<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;
    protected static ?string $password;

    public function definition(): array
    {
        $name = fake()->name();
        $username = Str::slug($name, '_') . '_' . fake()->unique()->numberBetween(1, 9999);

        return [
            'id' => Str::uuid()->toString(),
            'name' => $name,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'username' => Str::limit($username, 50, ''),
            'avatar_url' => null,
            'bio' => fake()->optional(0.7)->sentence(10),
            'xp' => 0,
            'level' => 1,
            'rank' => 'Bronze',
            'current_streak' => 0,
            'longest_streak' => 0,
            'streak_freeze_available' => true,
            'last_learning_date' => null,
            'weekly_goal' => 5,
            'total_xp_ever' => 0,
            'total_learning_hours' => 0,
            'total_sessions' => 0,
            'total_knowledge_cards' => 0,
            'is_profile_public' => true,
            'show_on_leaderboard' => fake()->boolean(30),
            'google_id' => null,
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'last_login_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    /**
     * Create an experienced user (level 30+, many sessions, active streaks).
     */
    public function experienced(): static
    {
        $level = fake()->numberBetween(30, 60);
        $totalXp = (int) round(100 * pow($level, 1.5));
        $streak = fake()->numberBetween(7, 90);

        return $this->state(fn (array $attributes) => [
            'xp' => $totalXp - (int) round(100 * pow($level - 1, 1.5)),
            'level' => $level,
            'rank' => User::rankForLevel($level),
            'current_streak' => $streak,
            'longest_streak' => fake()->numberBetween($streak, $streak + 30),
            'last_learning_date' => now()->subDay(),
            'total_xp_ever' => $totalXp,
            'total_learning_hours' => fake()->numberBetween(80, 300),
            'total_sessions' => fake()->numberBetween(50, 200),
            'total_knowledge_cards' => fake()->numberBetween(15, 80),
            'show_on_leaderboard' => true,
        ]);
    }

    /**
     * Create a veteran user (level 50+).
     */
    public function veteran(): static
    {
        $level = fake()->numberBetween(50, 80);
        $totalXp = (int) round(100 * pow($level, 1.5));
        $streak = fake()->numberBetween(30, 200);

        return $this->state(fn (array $attributes) => [
            'xp' => fake()->numberBetween(100, 500),
            'level' => $level,
            'rank' => User::rankForLevel($level),
            'current_streak' => $streak,
            'longest_streak' => fake()->numberBetween($streak, $streak + 60),
            'last_learning_date' => now(),
            'total_xp_ever' => $totalXp,
            'total_learning_hours' => fake()->numberBetween(200, 600),
            'total_sessions' => fake()->numberBetween(100, 500),
            'total_knowledge_cards' => fake()->numberBetween(40, 150),
            'show_on_leaderboard' => true,
        ]);
    }
}
