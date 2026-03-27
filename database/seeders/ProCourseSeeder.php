<?php

namespace Database\Seeders;

use App\Models\LearningContent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProCourseSeeder extends Seeder
{
    public function run(): void
    {
        // Use a special "Nexera" system user, or fall back to first seeded user
        $systemUser = User::where('email', 'andi@aethereum.dev')->first()
            ?? User::first();

        if (!$systemUser) {
            $this->command->warn('ProCourseSeeder: No users found. Run DatabaseSeeder first.');
            return;
        }

        $proCourses = [
            [
                'title' => 'Data Structures & Algorithms: Complete Mastery',
                'content_type' => 'pdf',
                'subject_category' => 'Computer Science',
                'subject_icon' => '💻',
                'subject_color' => '#6366F1',
                'difficulty' => 'advanced',
                'estimated_duration' => 480,
                'total_pages' => 312,
                'language' => 'en',
                'coin_price' => 350,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Machine Learning Fundamentals: From Zero to Hero',
                'content_type' => 'pdf',
                'subject_category' => 'Computer Science',
                'subject_icon' => '💻',
                'subject_color' => '#6366F1',
                'difficulty' => 'intermediate',
                'estimated_duration' => 360,
                'total_pages' => 248,
                'language' => 'en',
                'coin_price' => 400,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Calculus & Linear Algebra for Engineers',
                'content_type' => 'pdf',
                'subject_category' => 'Mathematics',
                'subject_icon' => '📐',
                'subject_color' => '#F59E0B',
                'difficulty' => 'intermediate',
                'estimated_duration' => 420,
                'total_pages' => 280,
                'language' => 'en',
                'coin_price' => 300,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Quantum Physics: Principles & Applications',
                'content_type' => 'pdf',
                'subject_category' => 'Physics',
                'subject_icon' => '⚛️',
                'subject_color' => '#06B6D4',
                'difficulty' => 'advanced',
                'estimated_duration' => 540,
                'total_pages' => 378,
                'language' => 'en',
                'coin_price' => 450,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Modern Web Development with React & TypeScript',
                'content_type' => 'article',
                'subject_category' => 'Computer Science',
                'subject_icon' => '💻',
                'subject_color' => '#6366F1',
                'difficulty' => 'intermediate',
                'estimated_duration' => 300,
                'total_pages' => null,
                'language' => 'en',
                'coin_price' => 280,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Organic Chemistry: Mechanisms & Reactions',
                'content_type' => 'pdf',
                'subject_category' => 'Chemistry',
                'subject_icon' => '🧪',
                'subject_color' => '#10B981',
                'difficulty' => 'advanced',
                'estimated_duration' => 400,
                'total_pages' => 265,
                'language' => 'en',
                'coin_price' => 320,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Behavioral Economics & Decision Making',
                'content_type' => 'pdf',
                'subject_category' => 'Economics',
                'subject_icon' => '📊',
                'subject_color' => '#8B5CF6',
                'difficulty' => 'intermediate',
                'estimated_duration' => 240,
                'total_pages' => 198,
                'language' => 'en',
                'coin_price' => 250,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'The Philosophy of Mind: Consciousness & Cognition',
                'content_type' => 'pdf',
                'subject_category' => 'Philosophy',
                'subject_icon' => '🧠',
                'subject_color' => '#EC4899',
                'difficulty' => 'intermediate',
                'estimated_duration' => 280,
                'total_pages' => 190,
                'language' => 'en',
                'coin_price' => 200,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Network Security & Ethical Hacking Essentials',
                'content_type' => 'pdf',
                'subject_category' => 'Computer Science',
                'subject_icon' => '💻',
                'subject_color' => '#6366F1',
                'difficulty' => 'advanced',
                'estimated_duration' => 360,
                'total_pages' => 240,
                'language' => 'en',
                'coin_price' => 500,
                'thumbnail_url' => null,
            ],
            [
                'title' => 'Microeconomics: Markets, Prices & Strategy',
                'content_type' => 'pdf',
                'subject_category' => 'Economics',
                'subject_icon' => '📊',
                'subject_color' => '#8B5CF6',
                'difficulty' => 'beginner',
                'estimated_duration' => 180,
                'total_pages' => 145,
                'language' => 'en',
                'coin_price' => 150,
                'thumbnail_url' => null,
            ],
        ];

        foreach ($proCourses as $data) {
            LearningContent::create([
                'id' => (string) Str::uuid(),
                'user_id' => $systemUser->id,
                'title' => $data['title'],
                'content_type' => $data['content_type'],
                'original_filename' => Str::slug($data['title']) . '.pdf',
                'file_path' => null,
                'source_url' => null,
                'thumbnail_url' => $data['thumbnail_url'],
                'estimated_duration' => $data['estimated_duration'],
                'total_pages' => $data['total_pages'],
                'language' => $data['language'],
                'subject_category' => $data['subject_category'],
                'subject_icon' => $data['subject_icon'],
                'subject_color' => $data['subject_color'],
                'difficulty' => $data['difficulty'],
                'status' => 'ready',
                'is_public' => true,
                'coin_price' => $data['coin_price'],
                'is_pro' => true,
                'ai_analysis' => [
                    'summary' => "A comprehensive pro-level course on {$data['subject_category']} covering all essential topics with expert-curated content.",
                    'key_topics' => ['Core Foundations', 'Advanced Techniques', 'Real-world Applications', 'Practice Problems', 'Expert Insights'],
                    'learning_objectives' => [
                        "Master the fundamentals of {$data['subject_category']}",
                        'Apply concepts to practical scenarios',
                        'Build expertise through structured exercises',
                        'Achieve certified-level understanding',
                    ],
                ],
                'structured_sections' => [
                    ['title' => 'Introduction & Core Concepts', 'pages' => 30, 'estimated_minutes' => 45],
                    ['title' => 'Deep Dive: Fundamentals', 'pages' => 60, 'estimated_minutes' => 90],
                    ['title' => 'Advanced Topics', 'pages' => 80, 'estimated_minutes' => 120],
                    ['title' => 'Case Studies & Applications', 'pages' => 60, 'estimated_minutes' => 90],
                    ['title' => 'Practice & Assessment', 'pages' => 40, 'estimated_minutes' => 60],
                ],
            ]);
        }

        $this->command->info('✅ ProCourseSeeder: 10 pro courses seeded successfully!');
    }
}
