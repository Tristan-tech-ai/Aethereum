<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\LearningSession;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Support\Facades\Log;

class AchievementService
{
    // ─────────────────────────────────────────────────────────────
    // Main Check & Award
    // ─────────────────────────────────────────────────────────────

    /**
     * Check all achievements for a user and award any new ones.
     * Returns array of newly awarded achievements.
     */
    public function checkAndAward(User $user): array
    {
        $user->loadMissing('achievements');

        $alreadyEarned = $user->achievements->pluck('achievement_id')->toArray();
        $allAchievements = Achievement::all();

        $newlyAwarded = [];

        foreach ($allAchievements as $achievement) {
            if (in_array($achievement->id, $alreadyEarned)) {
                continue; // Already earned
            }

            if ($this->checkTrigger($user, $achievement->trigger_condition ?? [])) {
                try {
                    UserAchievement::create([
                        'user_id'        => $user->id,
                        'achievement_id' => $achievement->id,
                        'awarded_at'     => now(),
                        'is_featured'    => false,
                    ]);

                    $newlyAwarded[] = [
                        'id'          => $achievement->id,
                        'name'        => $achievement->name,
                        'description' => $achievement->description,
                        'icon'        => $achievement->icon,
                        'category'    => $achievement->category,
                    ];

                    Log::info("Achievement awarded: {$achievement->id} to user {$user->id}");
                } catch (\Throwable $e) {
                    Log::error("Failed to award achievement {$achievement->id}: " . $e->getMessage());
                }
            }
        }

        return $newlyAwarded;
    }

    // ─────────────────────────────────────────────────────────────
    // Trigger Logic
    // ─────────────────────────────────────────────────────────────

    private function checkTrigger(User $user, array $condition): bool
    {
        if (empty($condition['type'])) {
            return false;
        }

        $required = (int) ($condition['value'] ?? 1);

        return match ($condition['type']) {

            'total_sessions' =>
                (int) $user->total_sessions >= $required,

            'total_cards' =>
                (int) $user->total_knowledge_cards >= $required,

            'current_streak' =>
                (int) $user->current_streak >= $required,

            'level' =>
                (int) $user->level >= $required,

            'unique_subjects' =>
                $user->knowledgeCards()
                    ->whereNotNull('subject_category')
                    ->distinct('subject_category')
                    ->count('subject_category') >= $required,

            'diamond_cards' =>
                $user->knowledgeCards()
                    ->where('tier', 'Diamond')
                    ->count() >= $required,

            'perfect_quizzes' =>
                QuizAttempt::where('user_id', $user->id)
                    ->where('score_percentage', 100)
                    ->count() >= $required,

            'high_focus_sessions' =>
                LearningSession::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->where('focus_integrity', '>=', 95)
                    ->count() >= $required,

            'fast_session' =>
                LearningSession::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->where('total_focus_time', '<=', 900) // ≤15 min = 900 seconds
                    ->count() >= $required,

            'night_session' =>
                LearningSession::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->whereRaw("EXTRACT(HOUR FROM completed_at) >= 0")
                    ->whereRaw("EXTRACT(HOUR FROM completed_at) < 4")
                    ->count() >= $required,

            'early_session' =>
                LearningSession::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->whereRaw("EXTRACT(HOUR FROM completed_at) >= 4")
                    ->whereRaw("EXTRACT(HOUR FROM completed_at) < 6")
                    ->count() >= $required,

            default => false,
        };
    }
}
