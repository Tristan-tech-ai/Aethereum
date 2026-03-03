<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserWalletFactory extends Factory
{
    protected $model = UserWallet::class;

    public function definition(): array
    {
        $totalEarned = fake()->numberBetween(100, 5000);
        $totalSpent = fake()->numberBetween(0, (int) ($totalEarned * 0.4));

        return [
            'id' => Str::uuid()->toString(),
            'user_id' => User::factory(),
            'current_balance' => $totalEarned - $totalSpent,
            'total_earned' => $totalEarned,
            'total_spent' => $totalSpent,
            'daily_earned' => fake()->numberBetween(0, 200),
            'daily_cap' => 500,
            'daily_cap_reset_date' => now()->toDateString(),
        ];
    }

    public function welcome(): static
    {
        return $this->state(fn () => [
            'current_balance' => 100,
            'total_earned' => 100,
            'total_spent' => 0,
            'daily_earned' => 0,
        ]);
    }
}
