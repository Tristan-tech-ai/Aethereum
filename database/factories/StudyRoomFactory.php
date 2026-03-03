<?php

namespace Database\Factories;

use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StudyRoomFactory extends Factory
{
    protected $model = StudyRoom::class;

    public function definition(): array
    {
        $names = [
            'Late Night Study Grind 🌙',
            'Exam Prep Zone 📝',
            'Chill Study Room ☕',
            'Focus Together 💪',
            'Pomodoro Gang 🍅',
            'Silent Library Mode 📚',
            'Morning Productivity ☀️',
            'CS Majors Unite 💻',
        ];

        return [
            'id' => Str::uuid()->toString(),
            'creator_id' => User::factory(),
            'name' => fake()->randomElement($names),
            'description' => fake()->optional()->sentence(),
            'room_code' => strtoupper(Str::random(8)),
            'is_public' => fake()->boolean(70),
            'max_capacity' => 20,
            'music_preset' => fake()->randomElement(['lofi', 'classical', 'nature', 'silence']),
            'status' => 'active',
            'current_pomodoro_phase' => 'study',
            'pomodoro_started_at' => now(),
            'closed_at' => null,
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => [
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }
}
