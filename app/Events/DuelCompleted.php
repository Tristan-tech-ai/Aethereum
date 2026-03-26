<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DuelCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $duelId,
        public ?string $winnerId,
        public float $challengerScore,
        public float $opponentScore,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("duel.{$this->duelId}")];
    }

    public function broadcastWith(): array
    {
        return [
            'winner_id' => $this->winnerId,
            'challenger_score' => $this->challengerScore,
            'opponent_score' => $this->opponentScore,
        ];
    }
}
