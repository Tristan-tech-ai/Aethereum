<?php

namespace Database\Factories;

use App\Models\KnowledgeCard;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KnowledgeCardFactory extends Factory
{
    protected $model = KnowledgeCard::class;

    public function definition(): array
    {
        $mastery = fake()->numberBetween(70, 100);
        $tier = KnowledgeCard::tierFromMastery($mastery);

        $subjects = [
            ['Computer_Science', '💻', '#3B82F6'],
            ['Mathematics', '📐', '#8B5CF6'],
            ['Physics', '⚛️', '#06B6D4'],
            ['Biology', '🧬', '#22C55E'],
            ['History', '📜', '#F59E0B'],
            ['Literature', '📚', '#EF4444'],
            ['Psychology', '🧠', '#EC4899'],
            ['Economics', '📊', '#10B981'],
        ];
        $subject = fake()->randomElement($subjects);

        return [
            'id' => Str::uuid()->toString(),
            'user_id' => User::factory(),
            'content_id' => LearningContent::factory(),
            'session_id' => LearningSession::factory(),
            'title' => fake()->sentence(4),
            'subject_category' => $subject[0],
            'subject_icon' => $subject[1],
            'subject_color' => $subject[2],
            'mastery_percentage' => $mastery,
            'quiz_avg_score' => fake()->randomFloat(2, 70, 100),
            'focus_integrity' => fake()->randomFloat(2, 60, 100),
            'time_invested' => fake()->numberBetween(15, 120),
            'tier' => $tier,
            'summary_snippet' => fake()->paragraph(2),
            'keywords' => fake()->words(fake()->numberBetween(3, 8)),
            'is_pinned' => fake()->boolean(20),
            'is_public' => true,
            'likes' => fake()->numberBetween(0, 50),
            'is_collaborative' => false,
            'collaborators' => null,
            'last_reviewed_at' => fake()->optional(0.5)->dateTimeBetween('-90 days', 'now'),
            'integrity_decay_rate' => 0.05,
        ];
    }

    public function diamond(): static
    {
        return $this->state(fn () => [
            'mastery_percentage' => 100,
            'tier' => 'Diamond',
            'quiz_avg_score' => 100.00,
            'focus_integrity' => fake()->randomFloat(2, 95, 100),
        ]);
    }

    public function gold(): static
    {
        return $this->state(fn () => [
            'mastery_percentage' => fake()->numberBetween(90, 99),
            'tier' => 'Gold',
        ]);
    }

    public function pinned(): static
    {
        return $this->state(fn () => ['is_pinned' => true]);
    }

    public function collaborative(): static
    {
        return $this->state(fn () => [
            'is_collaborative' => true,
            'collaborators' => [Str::uuid()->toString(), Str::uuid()->toString()],
        ]);
    }
}
