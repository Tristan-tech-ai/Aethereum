<?php

namespace App\Services;

use App\Events\ArenaCompleted;
use App\Events\ArenaQuestionStart;
use App\Events\ArenaScoreUpdate;
use App\Models\QuizArena;
use App\Models\User;
use Illuminate\Support\Str;

class QuizArenaService
{
    public function generateRoomCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (QuizArena::where('room_code', $code)->exists());

        return $code;
    }

    public function calculateScore(bool $correct, int $responseTimeMs, int $timePerQuestionMs): int
    {
        if (!$correct) return 0;

        $baseScore = 1000;
        $speedBonus = max(0, 500 - (int) ($responseTimeMs / $timePerQuestionMs * 500));
        return $baseScore + $speedBonus;
    }

    public function broadcastQuestion(string $arenaId, array $question, int $questionIndex): void
    {
        broadcast(new ArenaQuestionStart($arenaId, $question, $questionIndex))->toOthers();
    }

    public function broadcastScoreUpdate(string $arenaId, array $scores): void
    {
        broadcast(new ArenaScoreUpdate($arenaId, $scores))->toOthers();
    }

    public function completeArena(QuizArena $arena): void
    {
        // Determine ranks
        $participants = $arena->participants()
            ->orderByPivot('total_score', 'desc')
            ->get();

        $podium = [];
        $coinRewards = [50, 30, 15];

        foreach ($participants as $index => $participant) {
            $rank = $index + 1;
            $coins = $coinRewards[$index] ?? 0;
            $xp = 20;

            $arena->participants()->updateExistingPivot($participant->id, [
                'final_rank' => $rank,
                'xp_earned' => $xp,
                'coins_earned' => $coins,
            ]);

            $participant->increment('xp', $xp);
            $participant->wallet?->increment('coins', $coins);

            $podium[] = [
                'rank' => $rank,
                'user_id' => $participant->id,
                'name' => $participant->name,
                'score' => $participant->pivot->total_score,
                'xp_earned' => $xp,
                'coins_earned' => $coins,
            ];
        }

        $arena->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        broadcast(new ArenaCompleted($arena->id, $podium))->toOthers();
    }
}
