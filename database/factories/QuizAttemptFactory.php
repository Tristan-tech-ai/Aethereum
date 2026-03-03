<?php

namespace Database\Factories;

use App\Models\LearningSession;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    public function definition(): array
    {
        $totalQuestions = fake()->numberBetween(3, 5);
        $correctCount = fake()->numberBetween(0, $totalQuestions);
        $scorePercentage = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 2) : 0;

        $answers = [];
        for ($i = 0; $i < $totalQuestions; $i++) {
            $answers[] = [
                'question_index' => $i,
                'selected_index' => fake()->numberBetween(0, 3),
                'is_correct' => $i < $correctCount,
                'time_taken_ms' => fake()->numberBetween(3000, 60000),
            ];
        }

        return [
            'id' => Str::uuid()->toString(),
            'quiz_id' => Quiz::factory(),
            'user_id' => User::factory(),
            'session_id' => LearningSession::factory(),
            'answers' => $answers,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'score_percentage' => $scorePercentage,
            'passed' => $scorePercentage >= 70,
            'time_taken_seconds' => fake()->numberBetween(30, 300),
        ];
    }

    public function passed(): static
    {
        return $this->state(function (array $attributes) {
            $total = $attributes['total_questions'];
            $correct = fake()->numberBetween((int) ceil($total * 0.7), $total);
            $score = round(($correct / $total) * 100, 2);
            return [
                'correct_count' => $correct,
                'score_percentage' => $score,
                'passed' => true,
            ];
        });
    }
}
