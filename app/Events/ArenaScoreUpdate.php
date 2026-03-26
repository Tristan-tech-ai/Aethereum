<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArenaScoreUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $arenaId,
        public array $scores,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("arena.{$this->arenaId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'scores' => $this->scores,
        ];
    }
}
