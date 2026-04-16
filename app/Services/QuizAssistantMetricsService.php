<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class QuizAssistantMetricsService
{
    private function increment(string $key): void
    {
        if (!Cache::has($key)) {
            Cache::put($key, 1, now()->addDays(30));
        } else {
            Cache::increment($key);
        }
    }

    public function recordQuizStarted($userId, string $contentId): void
    {
        $date = now()->format('Y-m-d');
        $this->increment("qametric:quizzes_started:{$date}");
    }

    public function recordQuizCompleted($userId, float $score, string $masteryLevel): void
    {
        $date = now()->format('Y-m-d');
        $this->increment("qametric:quizzes_completed:{$date}");
        
        $totalScoreKey = "qametric:total_score:{$date}";
        if (!Cache::has($totalScoreKey)) {
            Cache::put($totalScoreKey, $score, now()->addDays(30));
        } else {
            Cache::increment($totalScoreKey, (int) $score);
        }
    }

    public function recordFeedbackGenerated(bool $usedFallback): void
    {
        if ($usedFallback) {
            $date = now()->format('Y-m-d');
            $this->increment("qametric:fallback_feedback_count:{$date}");
        }
    }

    public function recordIntentDetected(string $intentType): void
    {
        $date = now()->format('Y-m-d');
        $this->increment("qametric:intent_{$intentType}:{$date}");
    }

    public function getDailyStats(string $date = null): array
    {
        $date = $date ?? now()->format('Y-m-d');
        $started = Cache::get("qametric:quizzes_started:{$date}", 0);
        $completed = Cache::get("qametric:quizzes_completed:{$date}", 0);
        $totalScore = Cache::get("qametric:total_score:{$date}", 0);
        $fallback = Cache::get("qametric:fallback_feedback_count:{$date}", 0);
        
        $completionRate = $started > 0 ? ($completed / $started) * 100 : 0.0;
        $avgScore = $completed > 0 ? ($totalScore / $completed) : 0.0;

        return [
            'date' => $date,
            'quizzes_started' => $started,
            'quizzes_completed' => $completed,
            'completion_rate' => round($completionRate, 2),
            'avg_score' => round($avgScore, 2),
            'fallback_feedback_count' => $fallback,
            'intent_distribution' => [
                'quiz_request' => Cache::get("qametric:intent_quiz_request:{$date}", 0),
                'study_request' => Cache::get("qametric:intent_study_request:{$date}", 0),
                'general_question' => Cache::get("qametric:intent_general_question:{$date}", 0),
            ]
        ];
    }
}
