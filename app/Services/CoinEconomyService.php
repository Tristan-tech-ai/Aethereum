<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\LearningSession;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CoinEconomyService
{
    private const DAILY_CAP = 500;

    // ─── Base coin award for a completed session ───
    private const BASE_COINS        = 10;
    private const FOCUS_BONUS_MAX   = 20;  // Up to 20 extra coins for focus
    private const QUIZ_BONUS_MAX    = 20;  // Up to 20 extra coins for quiz score

    // ─────────────────────────────────────────────────────────────
    // Session Coin Award
    // ─────────────────────────────────────────────────────────────

    /**
     * Award coins for a completed learning session.
     * Returns result with amount awarded and remaining daily cap.
     */
    public function awardSessionCoins(LearningSession $session, User $user): array
    {
        $focusIntegrity = (float) ($session->focus_integrity ?? 0);
        $quizAvg        = (float) ($session->quiz_avg_score ?? 0);

        // Base + performance bonuses
        $focusBonus = (int) round(($focusIntegrity / 100) * self::FOCUS_BONUS_MAX);
        $quizBonus  = (int) round(($quizAvg / 100) * self::QUIZ_BONUS_MAX);
        $amount     = self::BASE_COINS + $focusBonus + $quizBonus;

        return $this->addCoins(
            $user,
            $amount,
            'session_complete',
            "Session completed — focus: {$focusIntegrity}%, quiz: {$quizAvg}%"
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Raw Coin Addition
    // ─────────────────────────────────────────────────────────────

    /**
     * Add coins to a user's wallet, respecting the daily cap.
     */
    public function addCoins(
        User $user,
        int $amount,
        string $source,
        ?string $description = null
    ): array {
        $wallet = $this->getOrCreateWallet($user);

        // Check daily cap
        $this->resetDailyCapIfNeeded($wallet);
        $remainingCap = self::DAILY_CAP - (int) $wallet->daily_earned;

        if ($remainingCap <= 0) {
            return [
                'coins_awarded'   => 0,
                'new_balance'     => $wallet->current_balance,
                'daily_earned'    => $wallet->daily_earned,
                'daily_cap'       => self::DAILY_CAP,
                'cap_reached'     => true,
            ];
        }

        $actualAmount = min($amount, $remainingCap);

        DB::transaction(function () use ($wallet, $actualAmount, $source, $description) {
            $newBalance = $wallet->current_balance + $actualAmount;

            $wallet->update([
                'current_balance' => $newBalance,
                'total_earned'    => $wallet->total_earned + $actualAmount,
                'daily_earned'    => $wallet->daily_earned + $actualAmount,
            ]);

            CoinTransaction::create([
                'wallet_id'   => $wallet->id,
                'user_id'     => $wallet->user_id,
                'type'        => 'earn',
                'amount'      => $actualAmount,
                'balance_after'=> $newBalance,
                'source'      => $source,
                'description' => $description,
            ]);
        });

        $wallet->refresh();

        return [
            'coins_awarded'   => $actualAmount,
            'new_balance'     => $wallet->current_balance,
            'daily_earned'    => $wallet->daily_earned,
            'daily_cap'       => self::DAILY_CAP,
            'cap_reached'     => $wallet->daily_earned >= self::DAILY_CAP,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private function getOrCreateWallet(User $user): UserWallet
    {
        return UserWallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'current_balance'    => 0,
                'total_earned'       => 0,
                'total_spent'        => 0,
                'daily_earned'       => 0,
                'daily_cap'          => self::DAILY_CAP,
                'daily_cap_reset_date' => now()->toDateString(),
            ]
        );
    }

    private function resetDailyCapIfNeeded(UserWallet $wallet): void
    {
        $today        = now()->toDateString();
        $lastReset    = $wallet->daily_cap_reset_date
            ? $wallet->daily_cap_reset_date->toDateString()
            : null;

        if ($lastReset !== $today) {
            $wallet->update([
                'daily_earned'         => 0,
                'daily_cap_reset_date' => $today,
            ]);
        }
    }
}
