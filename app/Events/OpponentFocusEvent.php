<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OpponentFocusEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $duelId,
        public string $eventType,
        public int $distractionCount,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("duel.{$this->duelId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'event_type' => $this->eventType,
            'distraction_count' => $this->distractionCount,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
