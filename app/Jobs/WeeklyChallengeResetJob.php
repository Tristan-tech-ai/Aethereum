<?php

namespace App\Jobs;

use App\Models\CommunityChallenge;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class WeeklyChallengeResetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        DB::transaction(function () {
            // Close expired challenges that haven't completed
            CommunityChallenge::where('ends_at', '<', now())
                ->where('is_completed', false)
                ->update(['is_completed' => true, 'completed_at' => now()]);

            // Distribute rewards for completed challenges
            $completed = CommunityChallenge::where('is_completed', true)
                ->where('ends_at', '<', now())
                ->whereHas('contributors', fn ($q) => $q->where('reward_claimed', false))
                ->get();

            foreach ($completed as $challenge) {
                $unrewarded = $challenge->contributors()
                    ->wherePivot('reward_claimed', false)
                    ->get();

                foreach ($unrewarded as $user) {
                    if ($challenge->reward_coins > 0) {
                        DB::table('coin_transactions')->insert([
                            'id' => \Illuminate\Support\Str::uuid(),
                            'user_id' => $user->id,
                            'amount' => $challenge->reward_coins,
                            'type' => 'reward',
                            'description' => "Weekly challenge reward: {$challenge->title}",
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $user->increment('coins', $challenge->reward_coins);
                    }

                    $challenge->contributors()->updateExistingPivot($user->id, [
                        'reward_claimed' => true,
                    ]);
                }
            }
        });
    }
}
