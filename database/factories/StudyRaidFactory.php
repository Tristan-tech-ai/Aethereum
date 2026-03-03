<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\StudyRaid;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StudyRaidFactory extends Factory
{
    protected $model = StudyRaid::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'creator_id' => User::factory(),
            'content_id' => LearningContent::factory(),
            'invite_code' => strtoupper(Str::random(8)),
            'max_participants' => fake()->numberBetween(2, 5),
            'duration_minutes' => fake()->randomElement([30, 60, 90, null]),
            'status' => 'lobby',
            'team_score' => null,
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'active',
            'started_at' => now()->subMinutes(fake()->numberBetween(5, 30)),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'team_score' => fake()->randomFloat(2, 60, 100),
            'started_at' => now()->subHours(2),
            'completed_at' => now()->subMinutes(fake()->numberBetween(5, 30)),
        ]);
    }
}
