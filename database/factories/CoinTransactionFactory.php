<?php

namespace Database\Factories;

use App\Models\CoinTransaction;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CoinTransactionFactory extends Factory
{
    protected $model = CoinTransaction::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['earn', 'spend']);
        $sources = $type === 'earn'
            ? ['session_complete', 'duel_win', 'streak_bonus', 'welcome_bonus', 'raid_complete', 'daily_login']
            : ['profile_frame_purchase', 'badge_purchase', 'streak_freeze_purchase'];

        return [
            'id' => Str::uuid()->toString(),
            'wallet_id' => UserWallet::factory(),
            'user_id' => User::factory(),
            'type' => $type,
            'amount' => fake()->numberBetween(5, 100),
            'balance_after' => fake()->numberBetween(0, 5000),
            'source' => fake()->randomElement($sources),
            'description' => fake()->optional()->sentence(),
            'reference_id' => null,
            'reference_type' => null,
        ];
    }
}
