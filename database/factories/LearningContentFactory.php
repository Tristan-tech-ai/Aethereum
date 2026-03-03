<?php

namespace Database\Factories;

use App\Models\LearningContent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LearningContentFactory extends Factory
{
    protected $model = LearningContent::class;

    public function definition(): array
    {
        $types = ['pdf', 'youtube', 'article', 'image', 'pptx'];
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
        $contentType = fake()->randomElement($types);

        $titles = [
            'Computer_Science' => ['Data Structures & Algorithms', 'Machine Learning Basics', 'Web Development Fundamentals', 'Database Design Patterns', 'Operating Systems Concepts'],
            'Mathematics' => ['Calculus I: Derivatives', 'Linear Algebra Essentials', 'Probability & Statistics', 'Discrete Mathematics', 'Number Theory'],
            'Physics' => ['Quantum Mechanics Intro', 'Classical Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics & Waves'],
            'Biology' => ['Cell Biology Fundamentals', 'Genetics & DNA', 'Ecology & Ecosystems', 'Human Anatomy', 'Microbiology'],
            'History' => ['World War II Analysis', 'Ancient Rome', 'Renaissance Period', 'Industrial Revolution', 'Cold War Era'],
            'Literature' => ['Shakespeare Analysis', 'Modern Poetry', 'Creative Writing', 'Indonesian Literature', 'World Fiction'],
            'Psychology' => ['Cognitive Psychology', 'Social Psychology', 'Behavioral Therapy', 'Developmental Psychology', 'Abnormal Psychology'],
            'Economics' => ['Microeconomics 101', 'Macroeconomics Principles', 'International Trade', 'Financial Markets', 'Game Theory'],
        ];

        $title = fake()->randomElement($titles[$subject[0]] ?? ['Learning Material']);

        $sections = [];
        $sectionCount = fake()->numberBetween(3, 7);
        for ($i = 0; $i < $sectionCount; $i++) {
            $sections[] = [
                'index' => $i,
                'title' => "Section " . ($i + 1) . ": " . fake()->sentence(4),
                'content' => fake()->paragraphs(3, true),
                'estimated_minutes' => fake()->numberBetween(5, 15),
            ];
        }

        return [
            'id' => Str::uuid()->toString(),
            'user_id' => User::factory(),
            'title' => $title,
            'content_type' => $contentType,
            'original_filename' => $contentType === 'pdf' ? Str::slug($title) . '.pdf' : null,
            'file_path' => $contentType === 'pdf' ? 'contents/' . Str::uuid() . '.pdf' : null,
            'source_url' => in_array($contentType, ['youtube', 'article']) ? fake()->url() : null,
            'thumbnail_url' => null,
            'estimated_duration' => fake()->numberBetween(15, 90),
            'total_pages' => $contentType === 'pdf' ? fake()->numberBetween(5, 50) : null,
            'language' => 'id',
            'ai_analysis' => ['summary' => fake()->paragraph(), 'key_concepts' => fake()->words(5)],
            'structured_sections' => $sections,
            'subject_category' => $subject[0],
            'subject_icon' => $subject[1],
            'subject_color' => $subject[2],
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'status' => 'ready',
            'error_message' => null,
        ];
    }

    public function processing(): static
    {
        return $this->state(fn () => [
            'status' => 'processing',
            'ai_analysis' => null,
            'structured_sections' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => 'failed',
            'error_message' => 'AI analysis failed after 3 retries',
        ]);
    }
}
