<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\LearningRelay;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LearningRelayFactory extends Factory
{
    protected $model = LearningRelay::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'creator_id' => User::factory(),
            'content_id' => LearningContent::factory(),
            'invite_code' => strtoupper(Str::random(8)),
            'max_participants' => fake()->numberBetween(2, 7),
            'status' => 'lobby',
            'combined_summary' => null,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'combined_summary' => fake()->paragraphs(5, true),
            'completed_at' => now(),
        ]);
    }
}
