<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityChallenge;
use App\Services\WeeklyChallengeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyChallengeController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected WeeklyChallengeService $challengeService,
    ) {}

    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $challenge = $this->challengeService->getCurrentChallenge();

        if (!$challenge) {
            return $this->success(['challenge' => null], 'No active challenge');
        }

        $myContribution = $challenge->contributors()
            ->where('user_id', $user->id)
            ->first()?->pivot->contribution_value ?? 0;

        return $this->success([
            'challenge' => $challenge,
            'my_contribution' => $myContribution,
            'progress_percentage' => $challenge->goal_value > 0
                ? min(100, round(($challenge->current_value / $challenge->goal_value) * 100, 1))
                : 0,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $challenges = CommunityChallenge::where('ends_at', '<', now())
            ->latest('ends_at')
            ->paginate(10);

        return $this->success(['challenges' => $challenges]);
    }

    public function progress(Request $request, string $id): JsonResponse
    {
        $challenge = CommunityChallenge::findOrFail($id);

        $topContributors = $challenge->contributors()
            ->orderByPivot('contribution_value', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($u) => [
                'user_id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'avatar_url' => $u->avatar_url,
                'contribution_value' => $u->pivot->contribution_value,
            ]);

        return $this->success([
            'challenge' => $challenge,
            'top_contributors' => $topContributors,
            'total_contributors' => $challenge->contributors()->count(),
        ]);
    }
}
