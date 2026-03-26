<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            // ─── Learning ───
            [
                'id'                => 'first_steps',
                'name'              => 'First Steps',
                'description'       => 'Complete your first learning session',
                'icon'              => 'rocket',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'total_sessions', 'value' => 1],
            ],
            [
                'id'                => 'bookworm',
                'name'              => 'Bookworm',
                'description'       => 'Complete 10 learning sessions',
                'icon'              => 'book-open',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'total_sessions', 'value' => 10],
            ],
            [
                'id'                => 'card_collector',
                'name'              => 'Card Collector',
                'description'       => 'Earn 10 Knowledge Cards',
                'icon'              => 'library',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'total_cards', 'value' => 10],
            ],
            [
                'id'                => 'knowledge_seeker',
                'name'              => 'Knowledge Seeker',
                'description'       => 'Earn 50 Knowledge Cards',
                'icon'              => 'brain',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'total_cards', 'value' => 50],
            ],
            [
                'id'                => 'quiz_master',
                'name'              => 'Quiz Master',
                'description'       => 'Score 100% on 10 quizzes',
                'icon'              => 'target',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'perfect_quizzes', 'value' => 10],
            ],
            [
                'id'                => 'polymath',
                'name'              => 'Polymath',
                'description'       => 'Complete materials in 5+ different subjects',
                'icon'              => 'globe',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'unique_subjects', 'value' => 5],
            ],
            [
                'id'                => 'perfectionist',
                'name'              => 'Perfectionist',
                'description'       => 'Earn 5 Diamond Knowledge Cards',
                'icon'              => 'diamond',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'diamond_cards', 'value' => 5],
            ],
            [
                'id'                => 'focus_master',
                'name'              => 'Focus Master',
                'description'       => 'Maintain 95%+ focus integrity 10 times',
                'icon'              => 'eye',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'high_focus_sessions', 'value' => 10],
            ],
            [
                'id'                => 'speed_learner',
                'name'              => 'Speed Learner',
                'description'       => 'Complete a session in under 15 minutes',
                'icon'              => 'zap',
                'category'          => 'learning',
                'trigger_condition' => ['type' => 'fast_session', 'value' => 1],
            ],

            // ─── Streaks ───
            [
                'id'                => 'week_warrior',
                'name'              => 'Week Warrior',
                'description'       => 'Achieve a 7-day learning streak',
                'icon'              => 'flame',
                'category'          => 'streak',
                'trigger_condition' => ['type' => 'current_streak', 'value' => 7],
            ],
            [
                'id'                => 'monthly_master',
                'name'              => 'Monthly Master',
                'description'       => 'Achieve a 30-day learning streak',
                'icon'              => 'trophy',
                'category'          => 'streak',
                'trigger_condition' => ['type' => 'current_streak', 'value' => 30],
            ],
            [
                'id'                => 'quarter_champion',
                'name'              => 'Quarter Champion',
                'description'       => 'Achieve a 90-day streak',
                'icon'              => 'award',
                'category'          => 'streak',
                'trigger_condition' => ['type' => 'current_streak', 'value' => 90],
            ],

            // ─── Social ───
            [
                'id'                => 'raid_veteran',
                'name'              => 'Raid Veteran',
                'description'       => 'Complete 10 Study Raids',
                'icon'              => 'users',
                'category'          => 'social',
                'trigger_condition' => ['type' => 'raids_completed', 'value' => 10],
            ],
            [
                'id'                => 'duel_champion',
                'name'              => 'Duel Champion',
                'description'       => 'Win 20 Focus Duels',
                'icon'              => 'swords',
                'category'          => 'social',
                'trigger_condition' => ['type' => 'duels_won', 'value' => 20],
            ],

            // ─── Special ───
            [
                'id'                => 'night_owl',
                'name'              => 'Night Owl',
                'description'       => 'Complete a session between midnight and 4 AM',
                'icon'              => 'moon',
                'category'          => 'special',
                'trigger_condition' => ['type' => 'night_session', 'value' => 1],
            ],
            [
                'id'                => 'early_bird',
                'name'              => 'Early Bird',
                'description'       => 'Complete a session between 4 AM and 6 AM',
                'icon'              => 'sunrise',
                'category'          => 'special',
                'trigger_condition' => ['type' => 'early_session', 'value' => 1],
            ],
            [
                'id'                => 'knowledge_emperor',
                'name'              => 'Knowledge Emperor',
                'description'       => 'Reach Level 100',
                'icon'              => 'crown',
                'category'          => 'special',
                'trigger_condition' => ['type' => 'level', 'value' => 100],
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['id' => $achievement['id']],
                $achievement
            );
        }

        $this->command->info('Seeded ' . count($achievements) . ' achievements.');
    }
}
