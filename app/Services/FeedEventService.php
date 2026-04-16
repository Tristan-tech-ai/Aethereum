<?php

namespace App\Services;

use App\Models\FeedEvent;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FeedEventService
{
    /**
     * Log a new event to the community feed.
     * 
     * @param User $user The user performing the action
     * @param string $eventType e.g., 'rank_up', 'achievement', 'streak', 'card_mastered'
     * @param string $message A brief description of the event
     * @param array $metadata Extra JSON data (e.g., achievement_id, new_level)
     */
    public function logEvent(User $user, string $eventType, string $message, array $metadata = []): void
    {
        try {
            FeedEvent::create([
                'user_id' => $user->id,
                'event_type' => $eventType,
                'event_data' => array_merge($metadata, ['message' => $message]),
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to log feed event for user {$user->id}: " . $e->getMessage());
        }
    }

    public function logRaidComplete(User $user, $raid): void
    {
        $this->logEvent($user, 'raid_complete', "Completed a Study Raid!", [
            'raid_id' => $raid->id,
            'team_score' => $raid->team_score,
        ]);
    }

    public function logDuelComplete(User $user, $duel): void
    {
        $this->logEvent($user, 'duel_complete', "Completed a Focus Duel!", [
            'duel_id' => $duel->id,
        ]);
    }

    public function logChallengeComplete(User $user, $challenge): void
    {
        $this->logEvent($user, 'challenge_complete', "Helped complete a Community Challenge!", [
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
        ]);
    }

    public function logAchievementUnlocked(User $user, $achievement): void
    {
        $this->logEvent($user, 'achievement', "Unlocked an achievement!", [
            'achievement_id' => $achievement->id ?? $achievement['id'] ?? null,
            'achievement_title' => $achievement->title ?? $achievement['title'] ?? null,
        ]);
    }

    public function logRankUp(User $user, string $newRank): void
    {
        $this->logEvent($user, 'rank_up', "Ranked up to {$newRank}!", [
            'new_rank' => $newRank,
            'level' => $user->level,
        ]);
    }

    public function logStreakMilestone(User $user, int $streakDays): void
    {
        $this->logEvent($user, 'streak_milestone', "Reached a {$streakDays}-day streak!", [
            'streak_days' => $streakDays,
        ]);
    }
}
