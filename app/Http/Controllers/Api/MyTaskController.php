<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityChallenge;
use App\Models\FocusDuel;
use App\Models\LearningSession;
use App\Models\StudyRaid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyTaskController extends Controller
{
    /**
     * GET /api/v1/my-tasks/summary
     *
     * Returns counts of active items for the sidebar badge.
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $activeSessions = LearningSession::where('user_id', $userId)
            ->whereIn('status', ['active', 'paused'])
            ->count();

        $pendingDuels = FocusDuel::where(function ($q) use ($userId) {
            $q->where('challenger_id', $userId)
              ->orWhere('opponent_id', $userId);
        })->whereIn('status', ['pending', 'accepted', 'active'])->count();

        $activeRaids = StudyRaid::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->where('status', 'active')->count();

        $activeChallenge = CommunityChallenge::where('is_completed', false)
            ->where('ends_at', '>', now())
            ->where('starts_at', '<=', now())
            ->exists() ? 1 : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'active_sessions'  => $activeSessions,
                'pending_duels'    => $pendingDuels,
                'active_raids'     => $activeRaids,
                'active_challenge' => $activeChallenge,
                'total'            => $activeSessions + $pendingDuels + $activeRaids,
            ],
        ]);
    }
}
