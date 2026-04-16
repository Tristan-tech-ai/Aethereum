<?php

namespace App\Repositories;

use App\Models\QuizResponse;
use App\Models\QuizSession;

class QuizResponseRepository
{
    public function create(QuizSession $session, int $questionIndex, int $selectedIndex, bool $isCorrect, int $timeTakenMs)
    {
        return QuizResponse::create([
            'quiz_session_id' => $session->id,
            'question_index' => $questionIndex,
            'selected_index' => $selectedIndex,
            'is_correct' => $isCorrect,
            'time_taken_ms' => $timeTakenMs,
            'answered_at' => now(),
        ]);
    }

    public function findForSession(QuizSession $session)
    {
        return QuizResponse::where('quiz_session_id', $session->id)
            ->orderBy('question_index')
            ->get();
    }
}
