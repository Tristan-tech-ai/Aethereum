<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RaidCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $raidId,
        public float $teamScore,
        public array $individualScores,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("raid.{$this->raidId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'team_score' => $this->teamScore,
            'individual_scores' => $this->individualScores,
        ];
    }
}
