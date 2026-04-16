<?php

namespace App\Services;

use App\Models\LearningContent;
use App\Models\QuizSession;
use App\Models\QuizResponse;
use App\Repositories\QuizSessionRepository;
use RuntimeException;
use Illuminate\Support\Str;

class QuizAssistantAdapter implements QuizAssistantAdapterInterface
{
    public function __construct(
        protected QuizGeneratorService $quizGenerator,
        protected QuizSessionRepository $sessionRepository
    ) {}

    /**
     * Create a new session.
     * 
     * Asumsi: QuizGeneratorService memiliki method generateQuestions(contentId, sectionIndex, count, type, difficulty)
     * yang me-return array dari questions.
     */
    public function createSession(array $config, $userId): array
    {
        $content = LearningContent::find($config['content_id']);

        if (!$content) {
            throw new RuntimeException('Content not found for quiz assistant session.');
        }

        // 2. Ambil questions dari QuizGeneratorService::generateQuestions()
        // Mengasumsikan method ini ada di QuizGeneratorService sesuai spesifikasi task
        if (method_exists($this->quizGenerator, 'generateQuestions')) {
            $questions = $this->quizGenerator->generateQuestions(
                $config['content_id'],
                $config['section_index'] ?? null,
                $config['count'] ?? 10,
                $config['type'] ?? 'multiple_choice',
                $config['difficulty'] ?? 'medium'
            );
        } else {
            // Fallback memanggil generateQuiz() dan mengekstrak array questions
            $quiz = $this->quizGenerator->getOrGenerateQuiz($content, (int) ($config['section_index'] ?? 0));
            $questions = $quiz->questions ?? [];
        }

        if (empty($questions)) {
            throw new RuntimeException('Gagal membuat soal. Tidak ada soal yang dihasilkan.');
        }

        // 3. Buat record di quiz_sessions
        $session = QuizSession::create([
            'user_id' => $userId,
            'content_id' => $content->id,
            // quiz_id nullable or derived
            'section_index' => $config['section_index'] ?? null,
            'section_title' => $config['section_index'] !== null ? "Section " . ((int) $config['section_index'] + 1) : null,
            'status' => 'active',
            'current_question_index' => 0,
            'total_questions' => count($questions),
            'started_at' => now(),
            // Mengasumsikan table memiliki kolom config_json dan questions_json sesuai instruction
            'config_json' => $config,
            'questions_json' => $questions
        ]);

        // 4. Generate signed URL atau token
        $secretKey = config('app.key');
        $tokenRaw = $session->id . '|' . $userId . '|' . $secretKey;
        $signedToken = hash('sha256', $tokenRaw);

        $expiresAt = now()->addHours(2);

        // 5. Return response
        return [
            'session_id' => $session->id,
            'quiz_url' => "/quiz/session/{$session->id}?token={$signedToken}",
            'question_count' => count($questions),
            'content_title' => $content->title,
            'section_label' => $config['section_index'] !== null ? "Bagian " . ((int) $config['section_index'] + 1) : "Semua section",
            'expires_at' => $expiresAt->toDateTimeString(),
        ];
    }

    /**
     * Evaluate the quiz session answers.
     */
    public function evaluateSession(string $sessionId, array $answers, $userId): array
    {
        // 1. Load QuizSession + validasi userId
        $session = QuizSession::find($sessionId);
        
        if (!$session || $session->user_id !== $userId) {
            throw new RuntimeException("Session not found or invalid.");
        }

        $questions = $session->questions_json ?? [];
        
        if (empty($questions) && $session->quiz_id) {
             // Fallback if structured differently
             $questions = $session->quiz->questions ?? [];
        }

        $total = count($questions);
        $correctCount = 0;
        $timeTakenTotal = 0;
        $perQuestionResult = [];

        // 3. Simpan jawaban ke quiz_responses
        foreach ($answers as $ans) {
            $qId = $ans['question_id'] ?? $ans['question_index'] ?? 0;
            $userAnswer = $ans['answer'] ?? $ans['user_answer'] ?? $ans['selected_index'] ?? -1;
            
            $question = $questions[$qId] ?? null;
            $correctAnswer = $question['correct_index'] ?? null;

            $isCorrect = false;
            if ($question !== null) {
                $isCorrect = (string)$userAnswer === (string)$correctAnswer;
            }

            if ($isCorrect) {
                $correctCount++;
            }

            $elapsedSeconds = $ans['elapsed_seconds'] ?? (int) (($ans['time_taken_ms'] ?? 0) / 1000);
            $timeTakenTotal += $elapsedSeconds;

            // Assuming relation/saving exists
            QuizResponse::create([
                'session_id' => $session->id,
                'question_index' => $qId,
                'selected_index' => (int) $userAnswer,
                'is_correct' => $isCorrect,
                'time_taken_ms' => $elapsedSeconds * 1000,
            ]);

            $perQuestionResult[] = [
                'question_id' => $qId,
                'is_correct' => $isCorrect,
                'correct_answer' => $correctAnswer,
                'user_answer' => $userAnswer,
                'is_answered' => $userAnswer !== -1 && $userAnswer !== null,
            ];
        }

        // Any missing answers counted as wrong
        $answeredIds = array_column($perQuestionResult, 'question_id');
        foreach ($questions as $idx => $q) {
            if (!in_array($idx, $answeredIds)) {
                $perQuestionResult[] = [
                    'question_id' => $idx,
                    'is_correct' => false,
                    'correct_answer' => $q['correct_index'] ?? null,
                    'user_answer' => null,
                    'is_answered' => false,
                ];
            }
        }

        // 4. Update status completed
        $score = $total > 0 ? ($correctCount / $total) * 100 : 0;
        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
            'score_percentage' => $score,
            'correct_count' => $correctCount,
            'total_questions' => $total
        ]);

        return [
            'score' => round($score, 2),
            'accuracy' => round($score, 2),
            'total' => $total,
            'correct' => $correctCount,
            'wrong' => $total - $correctCount,
            'time_taken' => $timeTakenTotal,
            'per_question' => $perQuestionResult,
        ];
    }

    /**
     * Pause an active quiz session.
     */
    public function pauseSession(string $sessionId, $userId): bool
    {
        $session = QuizSession::where('id', $sessionId)->where('user_id', $userId)->first();
        if ($session && $session->status === 'active') {
            $session->update(['status' => 'paused']);
            return true;
        }
        return false;
    }

    /**
     * Resume a paused quiz session.
     */
    public function resumeSession(string $sessionId, $userId): ?array
    {
        $session = QuizSession::where('id', $sessionId)->where('user_id', $userId)->first();
        if ($session && $session->status === 'paused') {
            // Cek expiration ? Asumsi 24 jam belum expired
            if ($session->started_at->diffInHours(now()) <= 24) {
                $session->update(['status' => 'active']);
                
                $secretKey = config('app.key');
                $tokenRaw = $session->id . '|' . $userId . '|' . $secretKey;
                $signedToken = hash('sha256', $tokenRaw);

                return [
                    'session_id' => $session->id,
                    'quiz_url' => "/quiz/session/{$session->id}?token={$signedToken}",
                    'current_question_index' => $session->current_question_index ?? 0,
                ];
            }
        }
        return null;
    }
}
