<?php

namespace App\Services;

use App\Events\DuelCompleted;
use App\Events\OpponentFocusEvent;
use App\Models\FocusDuel;
use App\Models\User;

class FocusDuelService
{
    public function __construct(
        protected FeedEventService $feedEventService,
    ) {}

    public function calculateFocusIntegrity(int $totalSeconds, int $distractedSeconds): float
    {
        if ($totalSeconds <= 0) return 100.0;
        $focusedSeconds = max(0, $totalSeconds - $distractedSeconds);
        return round(($focusedSeconds / $totalSeconds) * 100, 2);
    }

    public function determineWinner(FocusDuel $duel): ?string
    {
        if ($duel->challenger_focus_integrity === null || $duel->opponent_focus_integrity === null) {
            return null;
        }

        if ($duel->challenger_focus_integrity > $duel->opponent_focus_integrity) {
            return $duel->challenger_id;
        } elseif ($duel->opponent_focus_integrity > $duel->challenger_focus_integrity) {
            return $duel->opponent_id;
        }

        return null; // tie
    }

    public function completeDuel(FocusDuel $duel): void
    {
        $winnerId = $this->determineWinner($duel);

        $duel->update([
            'winner_id' => $winnerId,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Award coins: winner +30, loser +15, tie +20 each
        $challenger = User::find($duel->challenger_id);
        $opponent = User::find($duel->opponent_id);

        if ($winnerId === $duel->challenger_id) {
            $challenger->wallet?->increment('coins', 30);
            $opponent->wallet?->increment('coins', 15);
        } elseif ($winnerId === $duel->opponent_id) {
            $opponent->wallet?->increment('coins', 30);
            $challenger->wallet?->increment('coins', 15);
        } else {
            $challenger->wallet?->increment('coins', 20);
            $opponent->wallet?->increment('coins', 20);
        }

        // XP to both
        $challenger->increment('xp', 50);
        $opponent->increment('xp', 50);

        $this->feedEventService->logDuelComplete($challenger, $duel);
        $this->feedEventService->logDuelComplete($opponent, $duel);

        broadcast(new DuelCompleted(
            $duel->id,
            $winnerId,
            $duel->challenger_focus_integrity,
            $duel->opponent_focus_integrity,
        ))->toOthers();
    }

    public function broadcastFocusEvent(string $duelId, string $eventType, int $distractionCount): void
    {
        broadcast(new OpponentFocusEvent($duelId, $eventType, $distractionCount))->toOthers();
    }
}
