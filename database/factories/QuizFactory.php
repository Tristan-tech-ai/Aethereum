<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    public function definition(): array
    {
        $questionCount = fake()->numberBetween(3, 5);
        $questions = [];
        for ($i = 0; $i < $questionCount; $i++) {
            $correctIndex = fake()->numberBetween(0, 3);
            $questions[] = [
                'question' => fake()->sentence() . '?',
                'options' => [
                    fake()->sentence(3),
                    fake()->sentence(3),
                    fake()->sentence(3),
                    fake()->sentence(3),
                ],
                'correct_index' => $correctIndex,
                'explanation' => fake()->sentence(),
            ];
        }

        return [
            'id' => Str::uuid()->toString(),
            'content_id' => LearningContent::factory(),
            'section_index' => fake()->numberBetween(0, 6),
            'questions' => $questions,
            'question_count' => $questionCount,
            'difficulty' => fake()->randomElement(['easy', 'medium', 'hard']),
            'time_limit_seconds' => 120,
            'pass_threshold' => 70,
        ];
    }
}
