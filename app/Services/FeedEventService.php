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
                'message' => $message,
                'metadata' => $metadata,
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to log feed event for user {$user->id}: " . $e->getMessage());
        }
    }
}
