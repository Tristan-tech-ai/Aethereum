<?php

namespace Database\Factories;

use App\Models\CommunityChallenge;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CommunityChallengeFactory extends Factory
{
    protected $model = CommunityChallenge::class;

    public function definition(): array
    {
        $challenges = [
            ['Read-a-thon 📖', 'pages_read', 10000, 'Community reads 10,000 pages together!'],
            ['Focus Fortress 🏰', 'focus_integrity', 500, '500 users achieve 90%+ focus integrity'],
            ['Subject Sprint: Math 📐', 'materials_completed', 200, 'Complete 200 Math materials as a community'],
            ['Quiz Mania 🧠', 'quiz_perfect', 1000, 'Score 1000 perfect quizzes together!'],
            ['Streak Army 🔥', 'streak', 100, '100 users hit 7-day streaks'],
        ];

        $challenge = fake()->randomElement($challenges);
        $startsAt = now()->startOfWeek();

        return [
            'id' => Str::uuid()->toString(),
            'title' => $challenge[0],
            'description' => $challenge[3],
            'challenge_type' => $challenge[1],
            'subject_filter' => null,
            'goal_value' => $challenge[2],
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addWeek(),
            'current_value' => fake()->numberBetween(0, $challenge[2]),
            'is_completed' => false,
            'completed_at' => null,
            'reward_coins' => fake()->randomElement([100, 200, 300]),
            'reward_badge_id' => null,
            'reward_frame' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'current_value' => $attributes['goal_value'],
                'is_completed' => true,
                'completed_at' => now(),
            ];
        });
    }
}
