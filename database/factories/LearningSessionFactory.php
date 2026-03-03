<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LearningSessionFactory extends Factory
{
    protected $model = LearningSession::class;

    public function definition(): array
    {
        $totalSections = fake()->numberBetween(3, 7);
        $current = fake()->numberBetween(0, $totalSections);
        $focusTime = fake()->numberBetween(600, 5400); // 10 min to 90 min
        $tabSwitches = fake()->numberBetween(0, 10);
        $focusIntegrity = max(0, 100 - ($tabSwitches * fake()->numberBetween(3, 8)));

        return [
            'id' => Str::uuid()->toString(),
            'user_id' => User::factory(),
            'content_id' => LearningContent::factory(),
            'flow_type' => 'document_dungeon',
            'current_section' => $current,
            'total_sections' => $totalSections,
            'started_at' => now()->subMinutes(fake()->numberBetween(30, 120)),
            'completed_at' => null,
            'total_focus_time' => $focusTime,
            'total_break_time' => fake()->numberBetween(0, 600),
            'focus_integrity' => $focusIntegrity,
            'tab_switches' => $tabSwitches,
            'distraction_count' => $tabSwitches,
            'quiz_avg_score' => null,
            'quiz_attempts_total' => 0,
            'quiz_passes' => 0,
            'user_summary' => null,
            'summary_score' => null,
            'xp_earned' => 0,
            'coins_earned' => 0,
            'status' => 'active',
            'progress_data' => null,
        ];
    }

    public function completed(): static
    {
        $quizScore = fake()->randomFloat(2, 70, 100);
        $focusIntegrity = fake()->randomFloat(2, 60, 100);
        $xp = fake()->numberBetween(100, 300);

        return $this->state(fn (array $attributes) => [
            'current_section' => $attributes['total_sections'],
            'completed_at' => now(),
            'quiz_avg_score' => $quizScore,
            'quiz_attempts_total' => fake()->numberBetween(1, 5),
            'quiz_passes' => fake()->numberBetween(1, 5),
            'user_summary' => fake()->paragraph(3),
            'summary_score' => fake()->randomFloat(2, 60, 100),
            'xp_earned' => $xp,
            'coins_earned' => fake()->numberBetween(10, 50),
            'status' => 'completed',
            'focus_integrity' => $focusIntegrity,
        ]);
    }

    public function abandoned(): static
    {
        return $this->state(fn () => [
            'status' => 'abandoned',
            'completed_at' => now(),
        ]);
    }
}
