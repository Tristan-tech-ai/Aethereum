<?php

namespace App\Services;

use App\Models\AssistantConversation;
use App\Repositories\AssistantConversationStateRepository;

class AssistantConversationStateStoreService
{
    public function __construct(
        protected AssistantConversationStateRepository $stateRepository,
    ) {}

    public function loadState(AssistantConversation $conversation): array
    {
        $stateRecord = $this->stateRepository->findByConversation($conversation);

        return $stateRecord ? $stateRecord->state ?? [] : [];
    }

    public function saveState(AssistantConversation $conversation, array $state): array
    {
        $record = $this->stateRepository->saveState($conversation, $state);

        return $record->state ?? [];
    }

    public function clearState(AssistantConversation $conversation): void
    {
        $this->stateRepository->clearState($conversation);
    }
}
