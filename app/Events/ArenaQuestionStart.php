<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArenaQuestionStart implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $arenaId,
        public array $question,
        public int $questionIndex,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("arena.{$this->arenaId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'question' => $this->question,
            'question_index' => $this->questionIndex,
            'timer_start' => now()->toIso8601String(),
        ];
    }
}
