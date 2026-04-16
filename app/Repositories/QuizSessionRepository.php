<?php

namespace App\Repositories;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\QuizSession;

class QuizSessionRepository
{
    public function createForUser(LearningContent $content, Quiz $quiz, string $userId, int $sectionIndex, ?string $sectionTitle = null): QuizSession
    {
        return QuizSession::create([
            'user_id' => $userId,
            'content_id' => $content->id,
            'quiz_id' => $quiz->id,
            'section_index' => $sectionIndex,
            'section_title' => $sectionTitle,
            'status' => 'active',
            'current_question_index' => 0,
            'total_questions' => $quiz->question_count,
            'started_at' => now(),
        ]);
    }

    public function findById(string $id): ?QuizSession
    {
        return QuizSession::with(['quiz', 'responses', 'resultSummary'])->find($id);
    }

    public function findActiveForUserContent(string $userId, string $contentId, int $sectionIndex): ?QuizSession
    {
        return QuizSession::where('user_id', $userId)
            ->where('content_id', $contentId)
            ->where('section_index', $sectionIndex)
            ->where('status', 'active')
            ->latest('created_at')
            ->first();
    }

    public function updateProgress(QuizSession $session, int $currentQuestionIndex, int $correctCount, int $totalQuestions): void
    {
        $session->update([
            'current_question_index' => $currentQuestionIndex,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
        ]);
    }

    public function completeSession(QuizSession $session, float $scorePercentage, bool $passed): void
    {
        $session->update([
            'status' => 'completed',
            'score_percentage' => $scorePercentage,
            'completed_at' => now(),
            'correct_count' => $session->responses()->where('is_correct', true)->count(),
            'total_questions' => $session->responses()->count(),
        ]);
    }
}
