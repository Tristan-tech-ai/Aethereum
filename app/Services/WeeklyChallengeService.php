<?php

namespace App\Services;

use App\Events\ChallengeGoalReached;
use App\Models\CommunityChallenge;
use App\Models\User;

class WeeklyChallengeService
{
    public function __construct(
        protected FeedEventService $feedEventService,
    ) {}

    public function recordContribution(User $user, CommunityChallenge $challenge, int $value): void
    {
        // Upsert contribution
        $challenge->contributors()->syncWithoutDetaching([
            $user->id => [
                'contribution_value' => \DB::raw("contribution_value + {$value}"),
            ],
        ]);

        // If the contributor doesn't exist yet, create with value
        if (!$challenge->contributors()->where('user_id', $user->id)->exists()) {
            $challenge->contributors()->attach($user->id, [
                'contribution_value' => $value,
            ]);
        }

        // Update global counter
        $challenge->increment('current_value', $value);

        $this->checkAndComplete($challenge->fresh());
    }

    public function checkAndComplete(CommunityChallenge $challenge): void
    {
        if ($challenge->is_completed) return;
        if ($challenge->current_value < $challenge->goal_value) return;

        $challenge->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        // Distribute rewards to all contributors
        foreach ($challenge->contributors as $contributor) {
            $contributor->wallet?->increment('coins', $challenge->reward_coins);

            broadcast(new ChallengeGoalReached(
                $contributor->id,
                $challenge->id,
                $challenge->reward_coins,
                $challenge->reward_badge_id,
            ));

            $this->feedEventService->logChallengeComplete($contributor, $challenge);
        }
    }

    public function getCurrentChallenge(): ?CommunityChallenge
    {
        return CommunityChallenge::where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->latest('starts_at')
            ->first();
    }
}
