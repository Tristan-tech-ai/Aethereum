<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdateSettingsRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Models\KnowledgeCard;
use App\Models\User;
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
        $user = $request->user()->load(['wallet', 'pinnedCards.learningContent', 'featuredAchievements']);
        
        return $this->success([
            'user' => $this->formatProfile($user),
            'wallet' => $user->wallet,
            'pinned_cards' => $user->pinnedCards,
            'featured_achievements' => $user->featuredAchievements,
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

        $user->load(['pinnedCards.learningContent', 'featuredAchievements']);

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
            'pinned_cards' => $user->pinnedCards,
            'featured_achievements' => $user->featuredAchievements,
        ], 'Public profile retrieved successfully');
    }

    // ─── Get Learning Heatmap ───
    public function heatmap(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Fetch sessions from the last 365 days
        $startDate = Carbon::now()->subDays(365)->startOfDay();
        
        $sessions = $user->learningSessions()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(completed_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_minutes) as minutes')
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
        $query = $request->user()->knowledgeCards()->with('learningContent');

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
        $achievements = $request->user()->achievements()->orderBy('unlocked_at', 'desc')->get();
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
            'is_profile_public'     => $user->is_profile_public,
            'show_on_leaderboard'   => $user->show_on_leaderboard,
            'email_verified_at'     => $user->email_verified_at,
        ];
    }
}
