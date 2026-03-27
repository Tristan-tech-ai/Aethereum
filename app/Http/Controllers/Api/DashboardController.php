<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/dashboard
     *
     * Returns all data needed for the dashboard in a single request:
     *  - user stats (xp, level, streak, study hours)
     *  - weekly activity (hours + session count per day for the last 7 days)
     *  - xp trend (weekly XP for the last 7 weeks)
     *  - continue learning (active/paused sessions with progress)
     *  - leaderboard (top 5 by XP, with "isYou" flag)
     *  - achievements (up to 4, mix of earned/unearned)
     *  - course progress totals
     *  - community stats (online users, active rooms, ongoing raids, friends online)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $cacheKey = "dashboard:v1:user:{$user->id}";
        $payload = Cache::remember($cacheKey, now()->addSeconds(30), function () use ($user) {
            return [
                'quick_stats'       => $this->buildQuickStats($user),
                'weekly_activity'   => $this->buildWeeklyActivity($user),
                'xp_trend'          => $this->buildXpTrend($user),
                'continue_learning' => $this->buildContinueLearning($user),
                'leaderboard'       => $this->buildLeaderboard($user),
                'achievements'      => $this->buildAchievements($user),
                'course_progress'   => $this->buildCourseProgress($user),
                'community_stats'   => $this->buildCommunityStats($user),
            ];
        });

        return $this->success($payload, 'Dashboard data retrieved successfully');
    }

    // ── Quick Stats ─────────────────────────────────────────────────────────────

    private function buildQuickStats(User $user): array
    {
        // Active course count (content with at least one active/paused session)
        $activeCourses = DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'paused'])
            ->distinct('content_id')
            ->count('content_id');

        // Study hours this week
        $weekStart = Carbon::now()->startOfWeek();
        $weeklySeconds = (int) DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $weekStart)
            ->sum('total_focus_time');
        $weeklyHours = round($weeklySeconds / 3600, 1);

        // Last week hours for trend calculation
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd   = Carbon::now()->subWeek()->endOfWeek();
        $lastWeekSeconds = (int) DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$lastWeekStart, $lastWeekEnd])
            ->sum('total_focus_time');
        $lastWeekHours = $lastWeekSeconds / 3600;

        $hoursTrend = $lastWeekHours > 0
            ? (int) round((($weeklyHours - $lastWeekHours) / $lastWeekHours) * 100)
            : ($weeklyHours > 0 ? 100 : 0);

        // Last week XP for trend
        $thisWeekXp = (int) DB::table('xp_events')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $weekStart)
            ->sum('xp_amount');
        $lastWeekXp = (int) DB::table('xp_events')
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
            ->sum('xp_amount');
        $xpTrend = $lastWeekXp > 0
            ? (int) round((($thisWeekXp - $lastWeekXp) / $lastWeekXp) * 100)
            : ($thisWeekXp > 0 ? 100 : 0);

        return [
            'active_courses' => [
                'value' => $activeCourses,
                'trend' => 0,
                'trend_label' => 'In progress',
            ],
            'study_hours' => [
                'value' => $weeklyHours . 'h',
                'trend' => $hoursTrend,
                'trend_label' => 'vs last week',
            ],
            'day_streak' => [
                'value' => (int) $user->current_streak,
                'trend' => $user->current_streak >= $user->longest_streak ? 7 : 0,
                'trend_label' => $user->current_streak >= ($user->longest_streak ?? 0)
                    ? 'Personal best!'
                    : 'Keep going!',
            ],
            'xp_earned' => [
                'value' => number_format((int) $user->xp),
                'trend' => $xpTrend,
                'trend_label' => 'This week',
            ],
        ];
    }

    // ── Weekly Activity ─────────────────────────────────────────────────────────

    private function buildWeeklyActivity(User $user): array
    {
        $days = collect();
        $weekStart = Carbon::now()->startOfWeek(); // Monday

        // Build a map of date -> {hours, sessions}
        $rows = DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $weekStart)
            ->select(
                DB::raw('DATE(completed_at) as date'),
                DB::raw('COUNT(*) as session_count'),
                DB::raw('SUM(total_focus_time) as total_seconds')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for ($i = 0; $i < 7; $i++) {
            $date = $weekStart->copy()->addDays($i)->toDateString();
            $row  = $rows->get($date);

            $days->push([
                'day'      => $dayLabels[$i],
                'hours'    => $row ? round((int) $row->total_seconds / 3600, 1) : 0,
                'quizzes'  => $row ? (int) $row->session_count : 0,
            ]);
        }

        return $days->values()->all();
    }

    // ── XP Trend ────────────────────────────────────────────────────────────────

    private function buildXpTrend(User $user): array
    {
        $weeks = collect();

        // Get XP per week for the last 7 weeks (DB-agnostic: no DATE_PART/DATE_TRUNC)
        $startDate = Carbon::now()->subWeeks(6)->startOfWeek();
        for ($i = 0; $i < 7; $i++) {
            $weekStart = $startDate->copy()->addWeeks($i);
            $weekEnd = $weekStart->copy()->endOfWeek();

            $xp = (int) DB::table('xp_events')
                ->where('user_id', $user->id)
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->sum('xp_amount');

            $weeks->push([
                'week' => 'W' . ($i + 1),
                'xp'   => $xp,
            ]);
        }

        return $weeks->values()->all();
    }

    // ── Continue Learning ────────────────────────────────────────────────────────

    private function buildContinueLearning(User $user): array
    {
        // Get the latest active/paused session per content, max 3
        $sessions = DB::table('learning_sessions as ls')
            ->join('learning_contents as lc', 'lc.id', '=', 'ls.content_id')
            ->where('ls.user_id', $user->id)
            ->whereIn('ls.status', ['active', 'paused'])
            ->select(
                'ls.id as session_id',
                'lc.id as content_id',
                'lc.title',
                'lc.subject_category',
                'lc.subject_color',
                'ls.current_section',
                'ls.total_sections',
                'ls.updated_at'
            )
            ->orderByDesc('ls.updated_at')
            ->limit(3)
            ->get();

        $colors = ['#3B82F6', '#EF4444', '#06B6D4', '#22C55E', '#F59E0B', '#8B5CF6'];

        return $sessions->map(function ($s, $i) use ($colors) {
            $totalSections  = max((int) $s->total_sections, 1);
            $currentSection = min((int) $s->current_section, $totalSections);
            $progress       = (int) round(($currentSection / $totalSections) * 100);
            $color          = $s->subject_color ?? $colors[$i % count($colors)];

            return [
                'id'         => $s->content_id,
                'session_id' => $s->session_id,
                'title'      => $s->title,
                'subject'    => $s->subject_category ?? 'General',
                'progress'   => $progress,
                'sections'   => $currentSection . '/' . $totalSections,
                'color'      => $color,
            ];
        })->values()->all();
    }

    // ── Leaderboard ──────────────────────────────────────────────────────────────

    private function buildLeaderboard(User $user): array
    {
        // Get top 5 by total XP ever
        $top = User::where('show_on_leaderboard', true)
            ->orderByDesc('total_xp_ever')
            ->limit(5)
            ->get(['id', 'name', 'username', 'avatar_url', 'total_xp_ever', 'xp'])
            ->map(function ($u, $index) use ($user) {
                $initials = collect(explode(' ', $u->name))
                    ->map(fn($w) => strtoupper(substr($w, 0, 1)))
                    ->take(2)
                    ->implode('');

                return [
                    'rank'       => $index + 1,
                    'name'       => $u->name,
                    'username'   => $u->username,
                    'avatar_url' => $u->avatar_url,
                    'avatar'     => $initials ?: '??',
                    'xp'         => (int) ($u->total_xp_ever ?? $u->xp ?? 0),
                    'isYou'      => $u->id === $user->id,
                ];
            })
            ->values()
            ->all();

        // Check if the current user appears in the top 5; if not, append their rank
        $userInTop = collect($top)->firstWhere('isYou', true);

        if (!$userInTop) {
            $userRank = User::where('total_xp_ever', '>', $user->total_xp_ever ?? 0)
                ->where('show_on_leaderboard', true)
                ->count() + 1;

            $initials = collect(explode(' ', $user->name))
                ->map(fn($w) => strtoupper(substr($w, 0, 1)))
                ->take(2)
                ->implode('');

            $top[] = [
                'rank'       => $userRank,
                'name'       => $user->name,
                'username'   => $user->username,
                'avatar_url' => $user->avatar_url,
                'avatar'     => $initials ?: '??',
                'xp'         => (int) ($user->total_xp_ever ?? $user->xp ?? 0),
                'isYou'      => true,
            ];
        }

        return $top;
    }

    // ── Achievements ─────────────────────────────────────────────────────────────

    private function buildAchievements(User $user): array
    {
        // Get the 2 most recently earned + 2 nearest unearned, max 4 total
        $unlockedIds = $user->achievements()
            ->orderByDesc('awarded_at')
            ->pluck('achievement_id')
            ->all();

        $earned = \App\Models\Achievement::whereIn('id', array_slice($unlockedIds, 0, 2))
            ->get(['id', 'name', 'description', 'icon', 'category'])
            ->map(fn($a) => [
                'id'     => $a->id,
                'title'  => $a->name,
                'desc'   => $a->description,
                'icon'   => $a->icon,
                'earned' => true,
            ])
            ->values();

        $unearned = \App\Models\Achievement::whereNotIn('id', $unlockedIds)
            ->orderBy('name')
            ->limit(max(0, 4 - $earned->count()))
            ->get(['id', 'name', 'description', 'icon', 'category'])
            ->map(fn($a) => [
                'id'     => $a->id,
                'title'  => $a->name,
                'desc'   => $a->description,
                'icon'   => $a->icon,
                'earned' => false,
            ])
            ->values();

        return $earned->concat($unearned)->values()->all();
    }

    // ── Course Progress ───────────────────────────────────────────────────────────

    private function buildCourseProgress(User $user): array
    {
        $contents = DB::table('learning_contents')
            ->where('user_id', $user->id)
            ->where('status', 'ready')
            ->select('id')
            ->get()
            ->pluck('id');

        if ($contents->isEmpty()) {
            return ['completed' => 0, 'inProgress' => 0, 'notStarted' => 0, 'total' => 0];
        }

        // For each content, determine its state based on sessions
        $sessionStats = DB::table('learning_sessions')
            ->where('user_id', $user->id)
            ->whereIn('content_id', $contents)
            ->select('content_id', 'status')
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('content_id');

        $completed  = 0;
        $inProgress = 0;
        $notStarted = 0;

        foreach ($contents as $contentId) {
            $sessions = $sessionStats->get($contentId);

            if (!$sessions || $sessions->isEmpty()) {
                $notStarted++;
            } elseif ($sessions->firstWhere('status', 'completed')) {
                $completed++;
            } else {
                $inProgress++;
            }
        }

        return [
            'completed'  => $completed,
            'inProgress' => $inProgress,
            'notStarted' => $notStarted,
            'total'      => $contents->count(),
        ];
    }

    // ── Community Stats ───────────────────────────────────────────────────────────

    private function buildCommunityStats(User $user): array
    {
        // Users active in last 15 minutes (studying now)
        $studyingNow = DB::table('learning_sessions')
            ->where('status', 'active')
            ->where('updated_at', '>=', Carbon::now()->subMinutes(15))
            ->distinct('user_id')
            ->count('user_id');

        // Active study rooms
        $activeRooms = DB::table('study_rooms')
            ->where('status', 'active')
            ->count();

        // Ongoing raids
        $ongoingRaids = DB::table('study_raids')
            ->where('status', 'active')
            ->count();

        // Friends online (last 15 min)
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('addressee_id', $user->id);
            })
            ->get()
            ->map(fn($r) => $r->requester_id === $user->id ? $r->addressee_id : $r->requester_id)
            ->values();

        $friendsOnline = User::whereIn('id', $friendIds)
            ->where('last_login_at', '>=', Carbon::now()->subMinutes(15))
            ->count();

        return [
            'studying_now'  => $studyingNow,
            'active_rooms'  => $activeRooms,
            'ongoing_raids' => $ongoingRaids,
            'friends_online' => $friendsOnline,
        ];
    }
}
