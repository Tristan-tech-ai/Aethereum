<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdateSettingsRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Models\KnowledgeCard;
use App\Models\User;
use App\Models\Achievement;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ProfileController extends Controller
{
    use ApiResponse;

    // ─── Get My Profile (Full) ───
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['wallet', 'pinnedCards.content', 'featuredAchievements.achievement']);

        $stats = $this->buildStats($user);
        $activityFeed = $user->feedEvents()
            ->latest('created_at')
            ->limit(10)
            ->get(['id', 'event_type', 'event_data', 'created_at']);

        $friends = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('addressee_id', $user->id);
            })
            ->get();

        $friendIds = $friends->map(function ($row) use ($user) {
            return $row->requester_id === $user->id ? $row->addressee_id : $row->requester_id;
        })->values();

        $studyBuddies = User::whereIn('id', $friendIds)
            ->select('id', 'name', 'last_login_at')
            ->limit(6)
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'online' => $friend->last_login_at !== null
                        ? Carbon::parse($friend->last_login_at)->gt(now()->subMinutes(15))
                        : false,
                ];
            })
            ->values();

        $topSubjects = $user->knowledgeCards()
            ->select(
                'subject_category',
                DB::raw('COUNT(*) as cards_count'),
                DB::raw('AVG(mastery_percentage) as mastery_avg'),
                DB::raw('SUM(time_invested) as total_minutes')
            )
            ->groupBy('subject_category')
            ->orderByDesc('mastery_avg')
            ->limit(6)
            ->get()
            ->map(function ($row, $index) {
                $colors = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'];
                return [
                    'name' => $row->subject_category ?? 'General',
                    'mastery' => (int) round((float) $row->mastery_avg),
                    'hours' => (int) round(((int) $row->total_minutes) / 60),
                    'cards_count' => (int) $row->cards_count,
                    'color' => $colors[$index % count($colors)],
                ];
            })
            ->values();

        $interests = $topSubjects->pluck('name')->take(6)->values();
        
        return $this->success([
            'user' => $this->formatProfile($user),
            'stats' => $stats,
            'wallet' => $user->wallet,
            'pinned_cards' => $user->pinnedCards,
            'featured_achievements' => $user->featuredAchievements,
            'activity_feed' => $activityFeed,
            'study_buddies' => $studyBuddies,
            'top_subjects' => $topSubjects,
            'interests' => $interests,
        ], 'Profile retrieved successfully');
    }

    // ─── Get Public Profile ───
    public function show(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        // Check privacy
        if (!$user->is_profile_public && $request->user()?->id !== $user->id) {
            return $this->error('This profile is private', 403);
        }

        $user->load(['pinnedCards.content', 'featuredAchievements.achievement']);

        $totalHours = (int) round(
            $user->learningSessions()
                ->where('status', 'completed')
                ->sum('total_focus_time') / 3600
        );

        $totalMaterials = (int) $user->learningContents()
            ->where('status', 'ready')
            ->count();

        $avgMastery = (int) round(
            (float) ($user->knowledgeCards()->avg('mastery_percentage') ?? 0)
        );

        $stats = [
            'total_cards' => (int) $user->knowledgeCards()->count(),
            'total_hours' => $totalHours,
            'total_materials' => $totalMaterials,
            'avg_mastery' => $avgMastery,
            'current_streak' => (int) $user->current_streak,
            'best_streak' => (int) $user->longest_streak,
            'current_xp' => (int) $user->xp,
            'next_level_xp' => User::xpNeededForLevel(((int) $user->level) + 1),
        ];

        $achievements = $user->featuredAchievements
            ->map(function ($ua) {
                return [
                    'id' => $ua->achievement_id,
                    'name' => $ua->achievement?->name,
                    'description' => $ua->achievement?->description,
                    'emoji' => $this->achievementEmoji($ua->achievement?->icon),
                    'unlocked' => true,
                    'featured' => (bool) $ua->is_featured,
                    'unlockedDate' => optional($ua->awarded_at)?->format('M j'),
                ];
            })
            ->values();

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->bio,
                'level' => $user->level,
                'rank' => $user->rank,
                'current_streak' => $user->current_streak,
            ],
            'stats' => $stats,
            'pinned_cards' => $user->pinnedCards,
            'featured_achievements' => $achievements,
        ], 'Public profile retrieved successfully');
    }

    // ─── Get Public Heatmap ───
    public function publicHeatmap(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        if (!$user->is_profile_public && $request->user()?->id !== $user->id) {
            return $this->error('This profile is private', 403);
        }

        return $this->buildHeatmapResponse($user);
    }

    // ─── Get Learning Heatmap ───
    public function heatmap(Request $request): JsonResponse
    {
        return $this->buildHeatmapResponse($request->user());
    }

    private function buildHeatmapResponse(User $user): JsonResponse
    {
        // Fetch sessions from the last 365 days
        $startDate = Carbon::now()->subDays(365)->startOfDay();
        
        $sessions = $user->learningSessions()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(completed_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('ROUND(SUM(total_focus_time) / 60) as minutes')
            )
            ->groupBy('date')
            ->get();

        // Format as map of date string to stats
        $heatmap = [];
        foreach ($sessions as $session) {
            $heatmap[$session->date] = [
                'count' => (int) $session->count,
                'minutes' => (int) $session->minutes,
            ];
        }

        return $this->success([
            'heatmap' => $heatmap,
            'start_date' => $startDate->toDateString(),
            'end_date' => Carbon::now()->toDateString(),
        ], 'Heatmap data retrieved successfully');
    }

    // ─── Get Knowledge Cards ───
    public function cards(Request $request): JsonResponse
    {
        $query = $request->user()->knowledgeCards()->with('content');

        if ($request->has('tier')) {
            $query->where('tier', $request->input('tier'));
        }
        
        if ($request->has('is_pinned')) {
            $query->where('is_pinned', $request->boolean('is_pinned'));
        }

        $cards = $query->orderBy('created_at', 'desc')->paginate(12);

        return $this->success([
            'cards' => $cards->items(),
            'pagination' => [
                'total' => $cards->total(),
                'per_page' => $cards->perPage(),
                'current_page' => $cards->currentPage(),
                'last_page' => $cards->lastPage(),
            ]
        ], 'Cards retrieved successfully');
    }

    // ─── Pin Card ───
    public function pinCard(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $card = $user->knowledgeCards()->findOrFail($id);

        if ($card->is_pinned) {
            return $this->success(['card' => $card], 'Card is already pinned');
        }

        $pinnedCount = $user->pinnedCards()->count();
        if ($pinnedCount >= 6) {
            return $this->error('You can only pin up to 6 cards', 422);
        }

        $card->update(['is_pinned' => true]);

        return $this->success(['card' => $card], 'Card pinned successfully');
    }

    // ─── Unpin Card ───
    public function unpinCard(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $card = $user->knowledgeCards()->findOrFail($id);

        $card->update(['is_pinned' => false]);

        return $this->success(['card' => $card], 'Card unpinned successfully');
    }

    // ─── Get Achievements ───
    public function achievements(Request $request): JsonResponse
    {
        $user = $request->user();

        $unlocked = $user->achievements()
            ->with('achievement:id,name,description,icon,category')
            ->get()
            ->keyBy('achievement_id');

        $all = Achievement::query()
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'icon', 'category']);

        $achievements = $all->map(function ($achievement) use ($unlocked) {
            $ua = $unlocked->get($achievement->id);
            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'category' => $achievement->category,
                'emoji' => $this->achievementEmoji($achievement->icon),
                'icon' => $achievement->icon,
                'unlocked' => $ua !== null,
                'unlockedDate' => $ua?->awarded_at?->format('M j'),
                'featured' => (bool) ($ua?->is_featured ?? false),
                'progress' => null,
            ];
        })->values();

        return $this->success(['achievements' => $achievements], 'Achievements retrieved successfully');
    }

    // ─── Get XP History ───
    public function xpHistory(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $history = $request->user()->xpEvents()
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success(['history' => $history], 'XP history retrieved successfully');
    }

    // ─── Generate Share Card (Mock) ───
    public function generateShareCard(Request $request): JsonResponse
    {
        // This is a placeholder. Actual PNG generation will be done client-side 
        // using html2canvas and uploaded here if we want to store it, 
        // or we use a lambda/service. For now, we mock a URL.
        
        $user = $request->user();
        $mockUrl = "https://aethereum.app/share/cards/{$user->username}_" . time() . ".png";

        return $this->success([
            'share_url' => $mockUrl
        ], 'Share card URL generated successfully');
    }

    // ─── Update Profile ───

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update($data);

        return $this->success([
            'user' => $this->formatProfile($user->fresh()),
        ], 'Profile updated successfully');
    }

    // ─── Upload Avatar ───

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $request->user();

        // Delete old avatar if it exists
        if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        $file = $request->file('avatar');

        // Resize and crop to 256x256
        try {
            $image = Image::read($file);
            $image->cover(256, 256);
            
            $filename = 'avatars/' . $user->id . '_' . time() . '.webp';
            
            Storage::disk('public')->put($filename, $image->toWebp(85));
        } catch (\Exception $e) {
            // Fallback: store original without resize if Intervention Image not available
            $filename = $file->store('avatars', 'public');
        }

        $user->update(['avatar_url' => $filename]);

        return $this->success([
            'avatar_url' => $filename,
            'full_url'   => asset('storage/' . $filename),
        ], 'Avatar uploaded successfully');
    }

    // ─── Update Settings ───

    public function updateSettings(UpdateSettingsRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->update($data);

        return $this->success([
            'settings' => [
                'is_profile_public'   => $user->is_profile_public,
                'show_on_leaderboard' => $user->show_on_leaderboard,
                'weekly_goal'         => $user->weekly_goal,
            ],
        ], 'Settings updated successfully');
    }

    // ─── Helpers ───

    private function formatProfile($user): array
    {
        return [
            'id'                    => $user->id,
            'name'                  => $user->name,
            'email'                 => $user->email,
            'username'              => $user->username,
            'avatar_url'            => $user->avatar_url,
            'bio'                   => $user->bio,
            'xp'                    => $user->xp,
            'level'                 => $user->level,
            'rank'                  => $user->rank,
            'current_streak'        => $user->current_streak,
            'longest_streak'        => $user->longest_streak,
            'weekly_goal'           => $user->weekly_goal,
            'total_knowledge_cards' => $user->total_knowledge_cards,
            'total_learning_hours'  => $user->total_learning_hours,
            'total_sessions'        => $user->total_sessions,
            'created_at'            => optional($user->created_at)?->toIso8601String(),
            'is_profile_public'     => $user->is_profile_public,
            'show_on_leaderboard'   => $user->show_on_leaderboard,
            'email_verified_at'     => $user->email_verified_at,
        ];
    }

    private function buildStats(User $user): array
    {
        $friendsCount = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('addressee_id', $user->id);
            })
            ->count();

        $duelsWon = DB::table('focus_duels')
            ->where('winner_id', $user->id)
            ->count();

        $subjectsStudied = (int) $user->knowledgeCards()
            ->whereNotNull('subject_category')
            ->distinct('subject_category')
            ->count('subject_category');

        $weeklyProgress = (int) $user->learningSessions()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->startOfWeek())
            ->where('completed_at', '<=', now()->endOfWeek())
            ->distinct(DB::raw('DATE(completed_at)'))
            ->count(DB::raw('DATE(completed_at)'));

        $totalStudyMinutes = (int) round(
            $user->learningSessions()
                ->where('status', 'completed')
                ->sum('total_focus_time') / 60
        );

        $totalLikes = (int) $user->knowledgeCards()->sum('likes');
        $totalCards = (int) $user->knowledgeCards()->count();

        return [
            'friends_count' => $friendsCount,
            'duels_won' => $duelsWon,
            'subjects_studied' => $subjectsStudied,
            'weekly_progress' => $weeklyProgress,
            'total_study_time_hours' => (int) round($totalStudyMinutes / 60),
            'total_likes' => $totalLikes,
            'total_cards' => $totalCards,
            'xp_next_level' => User::xpNeededForLevel(((int) $user->level) + 1),
        ];
    }

    private function achievementEmoji(?string $icon): string
    {
        return match ($icon) {
            'rocket' => '🚀',
            'book-open' => '📖',
            'library' => '📚',
            'brain' => '🧠',
            'target' => '🎯',
            'globe' => '🌍',
            'diamond' => '💎',
            'eye' => '👁️',
            'zap' => '⚡',
            'flame' => '🔥',
            'trophy' => '🏆',
            'award' => '🏅',
            'moon' => '🌙',
            'sunrise' => '🌅',
            'crown' => '👑',
            'users' => '🤝',
            'swords' => '⚔️',
            'arena' => '🏟️',
            'community' => '🌐',
            'relay' => '🏃',
            'social' => '👥',
            'year' => '🌟',
            default => '⭐',
        };
    }
}
