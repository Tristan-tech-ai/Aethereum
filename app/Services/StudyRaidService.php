<?php

namespace App\Services;

use App\Events\RaidCompleted;
use App\Events\RaidChatMessage;
use App\Events\RaidMemberProgress;
use App\Models\StudyRaid;
use App\Models\User;
use Illuminate\Support\Str;

class StudyRaidService
{
    public function __construct(
        protected FeedEventService $feedEventService,
        protected CoinEconomyService $coinService,
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
            $pivot = $participant->pivot;
            $quizScore = (float) ($pivot->quiz_score ?? 0);
            $focusScore = (float) ($pivot->focus_integrity ?? 100);
            
            // Mastery for raid: 60% quiz, 40% focus
            $mastery = (int) round(($quizScore * 0.60) + ($focusScore * 0.40));
            $tier = \App\Models\KnowledgeCard::tierFromMastery($mastery);

            // Create Knowledge Card
            $card = \App\Models\KnowledgeCard::create([
                'user_id' => $participant->id,
                'content_id' => $raid->content_id,
                'title' => $raid->content->title,
                'subject_category' => $raid->content->subject_category,
                'subject_icon' => $raid->content->subject_icon,
                'subject_color' => $raid->content->subject_color,
                'mastery_percentage' => $mastery,
                'quiz_avg_score' => $quizScore,
                'focus_integrity' => $focusScore,
                'time_invested' => $raid->duration_minutes * 60,
                'tier' => $tier,
                'is_collaborative' => true,
                'last_reviewed_at' => now(),
            ]);

            $raid->participants()->updateExistingPivot($participant->id, [
                'xp_earned' => $bonusXp,
                'coins_earned' => $baseCoins,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $participant->increment('xp', $bonusXp);
            // Award coins to wallet via service
            $this->coinService->addCoins($participant, $baseCoins, 'raid_complete', "Completed Raid: {$raid->content->title}");

            $this->feedEventService->logRaidComplete($participant, $raid);
        }

        broadcast(new \App\Events\RaidCompleted($raid->id, $teamScore, $raid->participants->map(fn ($p) => [
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

    public function broadcastChat(string $raidId, User $user, string $message): void
    {
        broadcast(new RaidChatMessage($raidId, $user->id, $user->name, $message))->toOthers();
    }
}
