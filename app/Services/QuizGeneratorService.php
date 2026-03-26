<?php

namespace App\Services;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\LearningSession;
use Illuminate\Support\Facades\Log;

class QuizGeneratorService
{
    /**
     * Default pass threshold (percentage).
     */
    private const PASS_THRESHOLD = 70;

    /**
     * Get or generate a quiz for a given content section.
     *
     * If a quiz already exists for the content + section_index, return it.
     * Otherwise, generate one (via AI or fallback mock) and store it.
     *
     * @param  LearningContent  $content
     * @param  int              $sectionIndex
     * @return Quiz
     */
    public function getOrGenerateQuiz(LearningContent $content, int $sectionIndex): Quiz
    {
        // Check for existing quiz
        $existing = Quiz::where('content_id', $content->id)
            ->where('section_index', $sectionIndex)
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->generateQuiz($content, $sectionIndex);
    }

    /**
     * Generate a new quiz for a content section using Gemini AI.
     */
    public function generateQuiz(LearningContent $content, int $sectionIndex): Quiz
    {
        $sections = $content->structured_sections ?? [];
        $section  = $sections[$sectionIndex] ?? null;

        $sectionTitle   = $section['title'] ?? "Section {$sectionIndex}";
        $sectionContent = $section['content_text'] ?? $section['content'] ?? $section['text'] ?? '';
        $difficulty     = $content->difficulty ?? 'medium';

        try {
            $questions = app(GeminiService::class)->generateQuiz(
                $sectionContent,
                $sectionTitle,
                $difficulty,
                5
            );
        } catch (\Throwable $e) {
            Log::warning("GeminiService quiz generation failed, using placeholder: " . $e->getMessage());
            $questions = $this->generatePlaceholderQuestions($sectionTitle, $sectionContent);
        }

        $quiz = Quiz::create([
            'content_id'         => $content->id,
            'section_index'      => $sectionIndex,
            'questions'          => $questions,
            'question_count'     => count($questions),
            'difficulty'         => $difficulty,
            'time_limit_seconds' => 120,
            'pass_threshold'     => self::PASS_THRESHOLD,
        ]);

        Log::info("Quiz generated for content {$content->id}, section {$sectionIndex}", [
            'quiz_id'        => $quiz->id,
            'question_count' => count($questions),
        ]);

        return $quiz;
    }

    /**
     * Grade a quiz attempt.
     *
     * @param  Quiz   $quiz     The quiz being attempted
     * @param  array  $answers  Array of { question_index, selected_index, time_taken_ms }
     * @return array  Grade result with score, passed, details
     */
    public function gradeAttempt(Quiz $quiz, array $answers): array
    {
        $questions    = $quiz->questions ?? [];
        $totalQuestions = count($questions);
        $correctCount  = 0;
        $gradedAnswers = [];

        foreach ($answers as $answer) {
            $qIndex       = (int) ($answer['question_index'] ?? -1);
            $selectedIndex = (int) ($answer['selected_index'] ?? -1);
            $timeTakenMs  = (int) ($answer['time_taken_ms'] ?? 0);

            $question  = $questions[$qIndex] ?? null;
            $isCorrect = false;

            if ($question) {
                $correctIndex = (int) ($question['correct_index'] ?? -1);
                $isCorrect    = ($selectedIndex === $correctIndex);
            }

            if ($isCorrect) {
                $correctCount++;
            }

            $gradedAnswers[] = [
                'question_index' => $qIndex,
                'selected_index' => $selectedIndex,
                'is_correct'     => $isCorrect,
                'time_taken_ms'  => $timeTakenMs,
                'explanation'    => $question['explanation'] ?? null,
            ];
        }

        $scorePercentage = $totalQuestions > 0
            ? round(($correctCount / $totalQuestions) * 100, 2)
            : 0;

        $passed = $scorePercentage >= ($quiz->pass_threshold ?? self::PASS_THRESHOLD);

        return [
            'correct_count'    => $correctCount,
            'total_questions'  => $totalQuestions,
            'score_percentage' => $scorePercentage,
            'passed'           => $passed,
            'answers'          => $gradedAnswers,
        ];
    }

    /**
     * Create and store a QuizAttempt record, and update the session quiz stats.
     */
    public function recordAttempt(
        Quiz $quiz,
        LearningSession $session,
        string $userId,
        array $gradeResult
    ): QuizAttempt {
        $attempt = QuizAttempt::create([
            'quiz_id'           => $quiz->id,
            'user_id'           => $userId,
            'session_id'        => $session->id,
            'answers'           => $gradeResult['answers'],
            'correct_count'     => $gradeResult['correct_count'],
            'total_questions'   => $gradeResult['total_questions'],
            'score_percentage'  => $gradeResult['score_percentage'],
            'passed'            => $gradeResult['passed'],
            'time_taken_seconds'=> (int) collect($gradeResult['answers'])
                ->sum('time_taken_ms') / 1000,
        ]);

        // Update session quiz statistics
        $this->updateSessionQuizStats($session);

        return $attempt;
    }

    /**
     * Recalculate and update the session's quiz aggregate fields.
     */
    private function updateSessionQuizStats(LearningSession $session): void
    {
        $attempts = $session->quizAttempts()->get();

        $totalAttempts = $attempts->count();
        $passes = $attempts->where('passed', true)->count();
        $avgScore = $totalAttempts > 0
            ? round($attempts->avg('score_percentage'), 2)
            : null;

        $session->update([
            'quiz_attempts_total' => $totalAttempts,
            'quiz_passes'         => $passes,
            'quiz_avg_score'      => $avgScore,
        ]);
    }

    /**
     * Generate placeholder questions when Gemini is not yet integrated.
     *
     * @return array  Array of question objects
     */
    private function generatePlaceholderQuestions(string $sectionTitle, string $content): array
    {
        // Create basic comprehension-style questions based on available text
        $questions = [];

        $questions[] = [
            'question'      => "What is the main topic of \"{$sectionTitle}\"?",
            'options'       => [
                "Understanding the core concepts of {$sectionTitle}",
                "An unrelated topic",
                "A review of previous materials",
                "None of the above",
            ],
            'correct_index' => 0,
            'explanation'   => "This section focuses on the core concepts of {$sectionTitle}.",
        ];

        $questions[] = [
            'question'      => "Which statement best describes the content of this section?",
            'options'       => [
                "It introduces foundational ideas",
                "It only contains images",
                "It is a table of contents",
                "It is blank",
            ],
            'correct_index' => 0,
            'explanation'   => "The section introduces foundational ideas related to the topic.",
        ];

        $questions[] = [
            'question'      => "True or False: This section is relevant to \"{$sectionTitle}\"",
            'options'       => [
                'True',
                'False',
                'Not enough information',
                'The section does not exist',
            ],
            'correct_index' => 0,
            'explanation'   => "The section is directly relevant to {$sectionTitle}.",
        ];

        $questions[] = [
            'question'      => "What should you do after reading this section?",
            'options'       => [
                "Test your understanding with the quiz",
                "Skip to the end",
                "Close the app",
                "Delete the content",
            ],
            'correct_index' => 0,
            'explanation'   => "After reading, testing your understanding helps reinforce learning.",
        ];

        $questions[] = [
            'question'      => "How does this section relate to the overall material?",
            'options'       => [
                "It builds on previous sections and leads to the next",
                "It is completely independent",
                "It contradicts other sections",
                "It is optional and can be skipped",
            ],
            'correct_index' => 0,
            'explanation'   => "Each section builds upon the previous ones to form a coherent learning path.",
        ];

        return $questions;
    }
}
