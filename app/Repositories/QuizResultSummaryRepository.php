<?php

namespace App\Repositories;

use App\Models\QuizResultSummary;
use App\Models\QuizSession;

class QuizResultSummaryRepository
{
    public function create(QuizSession $session, string $summaryText, int $correctCount, int $totalQuestions, float $scorePercentage, bool $passed): QuizResultSummary
    {
        return QuizResultSummary::create([
            'quiz_session_id' => $session->id,
            'summary_text' => $summaryText,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'score_percentage' => $scorePercentage,
            'passed' => $passed,
        ]);
    }

    public function findBySessionId(string $sessionId): ?QuizResultSummary
    {
        return QuizResultSummary::where('quiz_session_id', $sessionId)->first();
    }
}
