<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserWallet;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\KnowledgeCard;
use App\Models\XpEvent;
use App\Models\FeedEvent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        $emails = [
            'tristan.lunar@gmail.com',
            'putra.lunar@gmail.com',
            'christian.lunar@gmail.com'
        ];
        
        // Cleanup existing demo users to avoid unique violation
        User::whereIn('email', $emails)->each(function($user) {
            $user->delete();
        });

        $password = Hash::make('nexerapassword2026');
        
        $accounts = [
            [
                'name' => 'Tristan Lunar',
                'email' => 'tristan.lunar@gmail.com',
                'username' => 'tristan_nexa',
                'bio' => 'Nexera Core Architect | Mastering AI & Learning Flow 🧠',
                'level' => 45,
                'rank' => 'Platinum',
            ],
            [
                'name' => 'Putra Lunar',
                'email' => 'putra.lunar@gmail.com',
                'username' => 'putra_sage',
                'bio' => 'Educational Game Designer | Leveling up my knowledge daily ⚔️',
                'level' => 38,
                'rank' => 'Gold',
            ],
            [
                'name' => 'Christian Lunar',
                'email' => 'christian.lunar@gmail.com',
                'username' => 'chris_scholar',
                'bio' => 'Full-stack Learner | Curiosity is my only weapon 🚀',
                'level' => 41,
                'rank' => 'Platinum',
            ]
        ];

        foreach ($accounts as $data) {
            $user = User::create([
                'id' => Str::uuid(),
                'name' => $data['name'],
                'email' => $data['email'],
                'email_verified_at' => now(),
                'password' => $password,
                'username' => $data['username'],
                'bio' => $data['bio'],
                'level' => $data['level'],
                'rank' => $data['rank'],
                'xp' => 450,
                'total_xp_ever' => ($data['level'] * 1000) + 450,
                'current_streak' => rand(15, 30),
                'longest_streak' => 35,
                'total_sessions' => rand(40, 100),
                'total_knowledge_cards' => rand(20, 50),
                'is_profile_public' => true,
            ]);

            UserWallet::create([
                'id' => Str::uuid(),
                'user_id' => $user->id,
                'current_balance' => rand(500, 2000),
            ]);

            // Create some content for them
            $contents = [
                ['title' => 'Advanced React 19 Patterns', 'subject' => 'Technology'],
                ['title' => 'Quantum Mechanics Basics', 'subject' => 'Science'],
                ['title' => 'Modern UI/UX Principles', 'subject' => 'Design'],
                ['title' => 'Laravel 12 Deep Dive', 'subject' => 'Programming'],
                ['title' => 'Philosophy of Learning', 'subject' => 'Humanities'],
            ];

            foreach ($contents as $cData) {
                $content = LearningContent::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'title' => $cData['title'],
                    'subject_category' => $cData['subject'],
                    'content_type' => 'document',
                    'status' => 'ready',
                    'is_public' => true,
                ]);

                // Create a completed session
                $session = LearningSession::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'content_id' => $content->id,
                    'status' => 'completed',
                    'completed_at' => now()->subHours(rand(1, 48)),
                    'quiz_avg_score' => rand(85, 100),
                    'focus_integrity' => rand(90, 100),
                    'xp_earned' => 250,
                ]);

                // Knowledge card
                KnowledgeCard::create([
                    'user_id' => $user->id,
                    'content_id' => $content->id,
                    'session_id' => $session->id,
                    'title' => $content->title,
                    'subject_category' => $content->subject_category,
                    'mastery_percentage' => rand(80, 100),
                    'tier' => 'Diamond',
                    'is_public' => true,
                    'last_reviewed_at' => now(),
                ]);

                // XP event
                XpEvent::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'session_id' => $session->id,
                    'xp_amount' => 250,
                    'source' => 'session_complete',
                    'description' => "Completed: {$content->title}",
                ]);
            }

            // Feed Event for "Recent activity"
            FeedEvent::create([
                'user_id' => $user->id,
                'event_type' => 'card_created',
                'event_data' => ['title' => 'Philosophy of Learning', 'tier' => 'Diamond'],
                'likes' => rand(5, 20),
                'created_at' => now()->subMinutes(rand(10, 120)),
            ]);
        }
    }
}
