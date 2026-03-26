<?php

namespace Database\Seeders;

use App\Models\CommunityChallenge;
use App\Models\FocusDuel;
use App\Models\KnowledgeCard;
use App\Models\LearningContent;
use App\Models\LearningSession;
use App\Models\Quiz;
use App\Models\StudyRaid;
use App\Models\StudyRoom;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserWallet;
use App\Models\XpEvent;
use App\Models\FeedEvent;
use App\Models\Friendship;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed impressive demo data:
     * - 10 users (some level 30+, veteran profiles)
     * - Each user has wallet, multiple learning contents, sessions, knowledge cards
     * - Active raids, completed duels, study rooms
     * - Community challenge in progress
     * - Friendships, feed events, XP history
     */
    public function run(): void
    {
        // 1. Seed achievement definitions
        $this->call(AchievementSeeder::class);

        // 2. Create demo users with varying experience
        $hero = User::factory()->veteran()->create([
            'name' => 'Andi Pratama',
            'email' => 'andi@aethereum.dev',
            'username' => 'andi_cs',
            'bio' => 'CS Student | Building my knowledge empire 🏰',
            'level' => 42,
            'rank' => 'Platinum',
            'current_streak' => 45,
            'longest_streak' => 45,
            'total_knowledge_cards' => 28,
            'total_sessions' => 85,
            'total_learning_hours' => 210,
        ]);

        $scholar = User::factory()->experienced()->create([
            'name' => 'Budi Santoso',
            'email' => 'budi@aethereum.dev',
            'username' => 'budi_learns',
            'bio' => 'Lifelong learner | Math & Physics enthusiast',
            'level' => 35,
            'rank' => 'Platinum',
        ]);

        $newcomer = User::factory()->create([
            'name' => 'Siti Aminah',
            'email' => 'siti@aethereum.dev',
            'username' => 'siti_scholar',
            'level' => 15,
            'rank' => 'Silver',
            'xp' => 1200,
            'total_xp_ever' => 1500,
            'current_streak' => 7,
            'total_knowledge_cards' => 8,
        ]);

        $otherUsers = User::factory()->count(7)->experienced()->create();
        $allUsers = collect([$hero, $scholar, $newcomer])->merge($otherUsers);

        // 3. Create wallets for all users
        foreach ($allUsers as $user) {
            UserWallet::factory()->create(['user_id' => $user->id]);
        }

        // 4. Create learning contents and sessions for hero user
        $heroContents = LearningContent::factory()
            ->count(10)
            ->create(['user_id' => $hero->id]);

        foreach ($heroContents as $content) {
            // Create completed sessions with knowledge cards
            $session = LearningSession::factory()
                ->completed()
                ->create([
                    'user_id' => $hero->id,
                    'content_id' => $content->id,
                ]);

            // Quiz for each content
            Quiz::factory()->create(['content_id' => $content->id]);

            // Knowledge card for each completed session
            KnowledgeCard::factory()->create([
                'user_id' => $hero->id,
                'content_id' => $content->id,
                'session_id' => $session->id,
                'title' => $content->title,
                'subject_category' => $content->subject_category,
                'subject_icon' => $content->subject_icon,
                'subject_color' => $content->subject_color,
            ]);

            // XP event
            XpEvent::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $hero->id,
                'xp_amount' => $session->xp_earned,
                'source' => 'session_complete',
                'description' => "Completed: {$content->title}",
                'session_id' => $session->id,
                'level_before' => $hero->level - 1,
                'level_after' => $hero->level,
                'xp_before' => $hero->total_xp_ever - $session->xp_earned,
                'xp_after' => $hero->total_xp_ever,
                'created_at' => now()->subDays(rand(1, 60)),
            ]);
        }

        // Pin top 6 cards for hero
        $hero->knowledgeCards()->orderByDesc('mastery_percentage')->limit(6)->update(['is_pinned' => true]);

        // Add some Diamond cards
        KnowledgeCard::factory()->diamond()->count(3)->create(['user_id' => $hero->id]);

        // 5. Create content & cards for other experienced users
        foreach ($allUsers->skip(1) as $user) {
            $contents = LearningContent::factory()
                ->count(fake()->numberBetween(3, 8))
                ->create(['user_id' => $user->id]);

            foreach ($contents as $content) {
                $session = LearningSession::factory()->completed()->create([
                    'user_id' => $user->id,
                    'content_id' => $content->id,
                ]);

                KnowledgeCard::factory()->create([
                    'user_id' => $user->id,
                    'content_id' => $content->id,
                    'session_id' => $session->id,
                    'title' => $content->title,
                    'subject_category' => $content->subject_category,
                ]);
            }

            // Pin some cards
            $user->knowledgeCards()->inRandomOrder()->limit(3)->update(['is_pinned' => true]);
        }

        // 6. Create social activities

        // Active study raid (hero + scholar + 2 others)
        $raid = StudyRaid::factory()->active()->create([
            'creator_id' => $hero->id,
            'content_id' => $heroContents->first()->id,
        ]);
        $raid->participants()->attach($hero->id, ['role' => 'creator', 'status' => 'learning', 'progress_percentage' => 65]);
        $raid->participants()->attach($scholar->id, ['role' => 'member', 'status' => 'learning', 'progress_percentage' => 40]);
        $raid->participants()->attach($otherUsers[0]->id, ['role' => 'member', 'status' => 'learning', 'progress_percentage' => 30]);

        // Completed raid
        $completedRaid = StudyRaid::factory()->completed()->create([
            'creator_id' => $scholar->id,
            'content_id' => $heroContents->skip(1)->first()->id,
        ]);
        $completedRaid->participants()->attach($scholar->id, ['role' => 'creator', 'status' => 'completed', 'quiz_score' => 92, 'xp_earned' => 150, 'coins_earned' => 30]);
        $completedRaid->participants()->attach($hero->id, ['role' => 'member', 'status' => 'completed', 'quiz_score' => 88, 'xp_earned' => 140, 'coins_earned' => 25]);

        // Completed focus duels
        FocusDuel::factory()->completed()->create([
            'challenger_id' => $hero->id,
            'opponent_id' => $scholar->id,
            'winner_id' => $hero->id,
        ]);

        FocusDuel::factory()->completed()->create([
            'challenger_id' => $newcomer->id,
            'opponent_id' => $hero->id,
            'winner_id' => $hero->id,
        ]);

        // Active study room
        $room = StudyRoom::factory()->create([
            'creator_id' => $hero->id,
            'name' => 'Late Night Study Grind 🌙',
            'is_public' => true,
        ]);
        $room->members()->attach($hero->id, ['current_material' => 'Data Structures & Algorithms', 'is_online' => true]);
        $room->members()->attach($scholar->id, ['current_material' => 'Linear Algebra', 'is_online' => true]);
        $room->members()->attach($newcomer->id, ['current_material' => 'Biology 101', 'is_online' => false]);

        // 7. Community challenge
        CommunityChallenge::factory()->create([
            'title' => 'Read-a-thon Week 📖',
            'challenge_type' => 'pages_read',
            'goal_value' => 10000,
            'current_value' => 6543,
            'starts_at' => now()->startOfWeek(),
            'ends_at' => now()->endOfWeek(),
        ]);

        // 8. Friendships
        Friendship::create(['id' => Str::uuid(), 'requester_id' => $hero->id, 'addressee_id' => $scholar->id, 'status' => 'accepted']);
        Friendship::create(['id' => Str::uuid(), 'requester_id' => $hero->id, 'addressee_id' => $newcomer->id, 'status' => 'accepted']);
        Friendship::create(['id' => Str::uuid(), 'requester_id' => $scholar->id, 'addressee_id' => $newcomer->id, 'status' => 'pending']);

        foreach ($otherUsers->take(4) as $user) {
            Friendship::create(['id' => Str::uuid(), 'requester_id' => $hero->id, 'addressee_id' => $user->id, 'status' => 'accepted']);
        }

        // 9. Achievement awards for hero
        $heroAchievements = ['first_steps', 'bookworm', 'quiz_master', 'week_warrior', 'monthly_master', 'raid_veteran', 'duel_champion', 'polymath'];
        foreach ($heroAchievements as $i => $achievementId) {
            UserAchievement::create([
                'id' => Str::uuid(),
                'user_id' => $hero->id,
                'achievement_id' => $achievementId,
                'awarded_at' => now()->subDays(60 - ($i * 7)),
                'is_featured' => in_array($achievementId, ['quiz_master', 'monthly_master', 'polymath']),
            ]);
        }

        // Some achievements for scholar & newcomer
        foreach (['first_steps', 'bookworm', 'week_warrior'] as $achievementId) {
            UserAchievement::create([
                'id' => Str::uuid(),
                'user_id' => $scholar->id,
                'achievement_id' => $achievementId,
                'awarded_at' => now()->subDays(rand(10, 40)),
            ]);
        }

        UserAchievement::create([
            'id' => Str::uuid(),
            'user_id' => $newcomer->id,
            'achievement_id' => 'first_steps',
            'awarded_at' => now()->subDays(7),
        ]);

        // 10. Feed events
        FeedEvent::create([
            'user_id' => $hero->id,
            'event_type' => 'rank_up',
            'event_data' => ['new_rank' => 'Platinum', 'level' => 42],
            'likes' => 12,
        ]);

        FeedEvent::create([
            'user_id' => $hero->id,
            'event_type' => 'achievement',
            'event_data' => ['achievement_id' => 'monthly_master', 'name' => 'Monthly Master'],
            'likes' => 8,
        ]);

        FeedEvent::create([
            'user_id' => $scholar->id,
            'event_type' => 'streak_milestone',
            'event_data' => ['streak' => 30],
            'likes' => 5,
        ]);

        FeedEvent::create([
            'user_id' => $hero->id,
            'event_type' => 'raid_complete',
            'event_data' => ['raid_id' => $completedRaid->id, 'team_score' => 90],
            'likes' => 6,
        ]);

        $this->command->info('🏰 Aethereum demo data seeded successfully!');
        $this->command->info("   Hero: {$hero->username} (Level {$hero->level} {$hero->rank})");
        $this->command->info("   Scholar: {$scholar->username} (Level {$scholar->level} {$scholar->rank})");
        $this->command->info("   Newcomer: {$newcomer->username} (Level {$newcomer->level} {$newcomer->rank})");
        $this->command->info("   + 7 experienced users");
    }
}
