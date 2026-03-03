<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'id' => 'first_steps',
                'name' => 'First Steps',
                'description' => 'Complete your first learning session',
                'icon' => '🚀',
                'category' => 'learning',
                'trigger_condition' => ['type' => 'sessions_completed', 'value' => 1],
            ],
            [
                'id' => 'bookworm',
                'name' => 'Bookworm',
                'description' => 'Complete 10 materials',
                'icon' => '📖',
                'category' => 'learning',
                'trigger_condition' => ['type' => 'materials_completed', 'value' => 10],
            ],
            [
                'id' => 'knowledge_seeker',
                'name' => 'Knowledge Seeker',
                'description' => 'Complete 50 materials',
                'icon' => '🧠',
                'category' => 'learning',
                'trigger_condition' => ['type' => 'materials_completed', 'value' => 50],
            ],
            [
                'id' => 'quiz_master',
                'name' => 'Quiz Master',
                'description' => 'Score 100% on 10 quizzes',
                'icon' => '💯',
                'category' => 'learning',
                'trigger_condition' => ['type' => 'perfect_quizzes', 'value' => 10],
            ],
            [
                'id' => 'week_warrior',
                'name' => 'Week Warrior',
                'description' => 'Achieve a 7-day streak',
                'icon' => '🔥',
                'category' => 'streak',
                'trigger_condition' => ['type' => 'streak_days', 'value' => 7],
            ],
            [
                'id' => 'monthly_master',
                'name' => 'Monthly Master',
                'description' => 'Achieve a 30-day streak',
                'icon' => '🔥',
                'category' => 'streak',
                'trigger_condition' => ['type' => 'streak_days', 'value' => 30],
            ],
            [
                'id' => 'quarter_champion',
                'name' => 'Quarter Champion',
                'description' => 'Achieve a 90-day streak',
                'icon' => '🔥',
                'category' => 'streak',
                'trigger_condition' => ['type' => 'streak_days', 'value' => 90],
            ],
            [
                'id' => 'year_legend',
                'name' => 'Year Legend',
                'description' => 'Achieve a 365-day streak',
                'icon' => '🔥',
                'category' => 'streak',
                'trigger_condition' => ['type' => 'streak_days', 'value' => 365],
            ],
            [
                'id' => 'polymath',
                'name' => 'Polymath',
                'description' => 'Complete materials in 5+ different subjects',
                'icon' => '🌍',
                'category' => 'learning',
                'trigger_condition' => ['type' => 'unique_subjects', 'value' => 5],
            ],
            [
                'id' => 'raid_veteran',
                'name' => 'Raid Veteran',
                'description' => 'Complete 10 Study Raids',
                'icon' => '⚔️',
                'category' => 'social',
                'trigger_condition' => ['type' => 'raids_completed', 'value' => 10],
            ],
            [
                'id' => 'duel_champion',
                'name' => 'Duel Champion',
                'description' => 'Win 10 Focus Duels',
                'icon' => '🥊',
                'category' => 'social',
                'trigger_condition' => ['type' => 'duels_won', 'value' => 10],
            ],
            [
                'id' => 'arena_hero',
                'name' => 'Arena Hero',
                'description' => 'Win a Quiz Arena match',
                'icon' => '🏟️',
                'category' => 'social',
                'trigger_condition' => ['type' => 'arena_wins', 'value' => 1],
            ],
            [
                'id' => 'relay_runner',
                'name' => 'Relay Runner',
                'description' => 'Complete 5 Learning Relays',
                'icon' => '🏃',
                'category' => 'social',
                'trigger_condition' => ['type' => 'relays_completed', 'value' => 5],
            ],
            [
                'id' => 'social_learner',
                'name' => 'Social Learner',
                'description' => 'Join 20 Study Rooms',
                'icon' => '🤝',
                'category' => 'social',
                'trigger_condition' => ['type' => 'rooms_joined', 'value' => 20],
            ],
            [
                'id' => 'community_hero',
                'name' => 'Community Hero',
                'description' => 'Contribute to 5 Weekly Challenges',
                'icon' => '🌟',
                'category' => 'social',
                'trigger_condition' => ['type' => 'challenges_contributed', 'value' => 5],
            ],
            [
                'id' => 'perfectionist',
                'name' => 'Perfectionist',
                'description' => 'Earn 5 Diamond cards',
                'icon' => '💎',
                'category' => 'special',
                'trigger_condition' => ['type' => 'diamond_cards', 'value' => 5],
            ],
            [
                'id' => 'knowledge_emperor',
                'name' => 'Knowledge Emperor',
                'description' => 'Reach Level 100',
                'icon' => '👑',
                'category' => 'special',
                'trigger_condition' => ['type' => 'level_reached', 'value' => 100],
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['id' => $achievement['id']],
                $achievement
            );
        }
    }
}
