<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class XPAwarded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $userId,
        public int $amount,
        public string $source,
        public int $newTotal,
        public bool $levelUp = false,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->userId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'amount' => $this->amount,
            'source' => $this->source,
            'new_total' => $this->newTotal,
            'level_up' => $this->levelUp,
        ];
    }
}
