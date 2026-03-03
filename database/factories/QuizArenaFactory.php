<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\QuizArena;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class QuizArenaFactory extends Factory
{
    protected $model = QuizArena::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'host_id' => User::factory(),
            'content_id' => LearningContent::factory(),
            'room_code' => strtoupper(Str::random(6)),
            'max_players' => fake()->numberBetween(2, 8),
            'question_count' => 10,
            'time_per_question' => 30,
            'status' => 'lobby',
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'started_at' => now()->subMinutes(15),
            'completed_at' => now(),
        ]);
    }
}
