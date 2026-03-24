<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\KnowledgeCard;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExploreController extends Controller
{
    use ApiResponse;

    public function trending(): JsonResponse
    {
        // Users with most XP gained this week
        // Since sqlite/postgres grouping can be complex, we'll do a simple join or subquery
        $startOfWeek = Carbon::now()->startOfWeek();

        // Optimized query: Sum XP from xp_events for this week
        $users = User::whereHas('xpEvents', function ($query) use ($startOfWeek) {
                $query->where('created_at', '>=', $startOfWeek);
            })
            ->withSum(['xpEvents as weekly_xp' => function ($query) use ($startOfWeek) {
                $query->where('created_at', '>=', $startOfWeek);
            }], 'amount')
            ->orderByDesc('weekly_xp')
            ->limit(10)
            ->get(['id', 'name', 'username', 'avatar_url', 'level', 'rank']);

        return $this->success(['users' => $users], 'Trending users retrieved');
    }

    public function risingStars(): JsonResponse
    {
        // New users (registered < 30 days ago) with highest total XP or level
        $users = User::where('created_at', '>=', Carbon::now()->subDays(30))
            ->orderByDesc('xp')
            ->limit(10)
            ->get(['id', 'name', 'username', 'avatar_url', 'level', 'rank', 'xp', 'created_at']);

        return $this->success(['users' => $users], 'Rising stars retrieved');
    }

    public function hallOfSages(): JsonResponse
    {
        // Sage rank (Level >= 76)
        $users = User::where('level', '>=', 76)
            ->orderByDesc('level')
            ->orderByDesc('xp')
            ->limit(20)
            ->get(['id', 'name', 'username', 'avatar_url', 'level', 'rank', 'xp']);

        return $this->success(['users' => $users], 'Hall of Sages retrieved');
    }

    public function bySubject(string $subject): JsonResponse
    {
        // Top learners per subject based on mastery/card count
        // Assumes public profile
        $users = User::where('is_profile_public', true)
            ->whereHas('knowledgeCards', function ($query) use ($subject) {
                $query->where('subject', $subject);
            })
            ->withCount(['knowledgeCards as subject_cards_count' => function ($query) use ($subject) {
                $query->where('subject', $subject);
            }])
            ->orderByDesc('subject_cards_count')
            ->limit(10)
            ->get(['id', 'name', 'username', 'avatar_url', 'level', 'rank']);

        return $this->success([
            'subject' => $subject,
            'users' => $users
        ], "Top learners for $subject retrieved");
    }
}
