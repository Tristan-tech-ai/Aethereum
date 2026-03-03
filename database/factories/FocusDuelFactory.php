<?php

namespace Database\Factories;

use App\Models\FocusDuel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FocusDuelFactory extends Factory
{
    protected $model = FocusDuel::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'challenger_id' => User::factory(),
            'opponent_id' => User::factory(),
            'duration_minutes' => fake()->randomElement([25, 50, 90]),
            'challenger_focus_integrity' => null,
            'opponent_focus_integrity' => null,
            'winner_id' => null,
            'status' => 'pending',
            'accepted_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'expires_at' => now()->addDay(),
        ];
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $cFocus = fake()->randomFloat(2, 60, 100);
            $oFocus = fake()->randomFloat(2, 60, 100);
            return [
                'challenger_focus_integrity' => $cFocus,
                'opponent_focus_integrity' => $oFocus,
                'winner_id' => $cFocus >= $oFocus ? $attributes['challenger_id'] : $attributes['opponent_id'],
                'status' => 'completed',
                'accepted_at' => now()->subHours(2),
                'started_at' => now()->subHours(2),
                'completed_at' => now(),
            ];
        });
    }
}
