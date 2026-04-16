<?php

namespace App\Repositories;

use App\Models\AssistantConversation;
use App\Models\AssistantConversationState;

class AssistantConversationStateRepository
{
    public function findByConversation(AssistantConversation $conversation): ?AssistantConversationState
    {
        return AssistantConversationState::where('conversation_id', $conversation->id)->first();
    }

    public function saveState(AssistantConversation $conversation, array $state): AssistantConversationState
    {
        return AssistantConversationState::updateOrCreate(
            ['conversation_id' => $conversation->id],
            ['state' => $state, 'last_updated_at' => now()]
        );
    }

    public function clearState(AssistantConversation $conversation): void
    {
        AssistantConversationState::where('conversation_id', $conversation->id)->delete();
    }
}
