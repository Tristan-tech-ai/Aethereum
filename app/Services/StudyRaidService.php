<?php

namespace App\Services;

use App\Events\RaidCompleted;
use App\Events\RaidMemberProgress;
use App\Models\StudyRaid;
use App\Models\User;
use Illuminate\Support\Str;

class StudyRaidService
{
    public function __construct(
        protected FeedEventService $feedEventService,
    ) {}

    public function generateInviteCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (StudyRaid::where('invite_code', $code)->exists());

        return $code;
    }

    public function calculateTeamScore(StudyRaid $raid): float
    {
        $avg = $raid->participants()->avg('raid_participants.quiz_score');
        return round($avg ?? 0, 2);
    }

    public function completeRaid(StudyRaid $raid): void
    {
        $teamScore = $this->calculateTeamScore($raid);

        $raid->update([
            'team_score' => $teamScore,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Award XP bonus (+50%) to all participants
        $baseXp = 100;
        $bonusXp = (int) ($baseXp * 1.5);
        $baseCoins = 20;

        foreach ($raid->participants as $participant) {
            $raid->participants()->updateExistingPivot($participant->id, [
                'xp_earned' => $bonusXp,
                'coins_earned' => $baseCoins,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $participant->increment('xp', $bonusXp);
            $participant->wallet?->increment('coins', $baseCoins);

            $this->feedEventService->logRaidComplete($participant, $raid);
        }

        broadcast(new RaidCompleted($raid->id, $teamScore, $raid->participants->map(fn ($p) => [
            'user_id' => $p->id,
            'name' => $p->name,
            'quiz_score' => $p->pivot->quiz_score,
            'xp_earned' => $bonusXp,
            'coins_earned' => $baseCoins,
        ])->toArray()))->toOthers();
    }

    public function broadcastProgress(string $raidId, string $participantId, float $progress): void
    {
        broadcast(new RaidMemberProgress($raidId, $participantId, $progress))->toOthers();
    }
}
