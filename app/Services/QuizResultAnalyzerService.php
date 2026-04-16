<?php

namespace App\Services;

use App\Models\QuizSession;
use App\Models\LearningContent;
use App\Models\QuizResultSummary;

class QuizResultAnalyzerService
{
    /**
     * Analyze quiz session results.
     */
    public function analyze(string $sessionId): array
    {
        $session = QuizSession::with(['responses', 'content'])->findOrFail($sessionId);
        
        $questions = $session->questions_json ?? [];
        if (empty($questions) && $session->quiz_id) {
            $questions = $session->quiz->questions ?? [];
        }

        $responses = $session->responses;
        $totalQuestions = count($questions);
        $correctCount = $responses->where('is_correct', true)->count();
        $accuracy = $totalQuestions > 0 ? ($correctCount / $totalQuestions) * 100 : 0;

        $topicStats = [];
        foreach ($questions as $idx => $qInfo) {
            // Check if respondent answered
            $resp = $responses->firstWhere('question_index', $idx);
            $isCorrect = $resp ? $resp->is_correct : false;

            $secIdx = $qInfo['section_index'] ?? $session->section_index ?? 0;
            $secTitle = $qInfo['section_title'] ?? $session->section_title ?? "Sesi Utama";

            if (!isset($topicStats[$secIdx])) {
                $topicStats[$secIdx] = [
                    'section_index' => $secIdx,
                    'title' => $secTitle,
                    'total' => 0,
                    'wrong' => 0,
                ];
            }
            $topicStats[$secIdx]['total']++;
            if (!$isCorrect) {
                $topicStats[$secIdx]['wrong']++;
            }
        }

        $weakTopics = [];
        $strongTopics = [];

        foreach ($topicStats as $stat) {
            $currAcc = $stat['total'] > 0 ? (($stat['total'] - $stat['wrong']) / $stat['total']) * 100 : 0;
            $item = [
                'section_index' => $stat['section_index'],
                'title' => $stat['title'],
                'wrong_count' => $stat['wrong'],
                'accuracy' => round($currAcc, 2),
            ];
            
            if ($currAcc < 60) {
                $weakTopics[] = $item;
            } elseif ($currAcc >= 80) {
                $strongTopics[] = $item;
            }
        }

        $masteryLevel = $this->getMasteryLevel($accuracy);

        $result = [
            'session_id' => $session->id,
            'score' => round($accuracy, 2),
            'accuracy' => round($accuracy, 2),
            'weak_topics' => $weakTopics,
            'strong_topics' => $strongTopics,
            'needs_review' => count($weakTopics) > 0,
            'mastery_level' => $masteryLevel,
        ];

        // Ensure record exists or created (schema dependent, using generic save)
        $summaryText = json_encode($result);
        QuizResultSummary::create([
            'session_id' => $session->id,
            'summary_text' => $summaryText,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'score_percentage' => round($accuracy, 2),
            'passed' => $accuracy >= 70,
        ]);

        return $result;
    }

    /**
     * Get mastery level corresponding to accuracy.
     */
    public function getMasteryLevel(float $accuracy): string
    {
        if ($accuracy >= 90) return 'excellent';
        if ($accuracy >= 75) return 'good';
        if ($accuracy >= 50) return 'needs_work';
        return 'struggling';
    }

    /**
     * Get enriched weak topics with preview content and review URLs.
     */
    public function getWeakTopicsWithContent(array $weakTopics, ?LearningContent $content): array
    {
        if (!$content) {
            return $weakTopics;
        }

        $sections = $content->structured_sections ?? [];
        $contentSlug = $content->slug ?? $content->id;

        $enriched = [];
        foreach ($weakTopics as $topic) {
            $secIdx = $topic['section_index'];
            $sectionData = $sections[$secIdx] ?? null;
            $preview = '';
            
            if ($sectionData) {
                $rawContent = $sectionData['content'] ?? $sectionData['content_text'] ?? '';
                $preview = mb_substr(strip_tags($rawContent), 0, 200);
            }

            $topic['content_preview'] = $preview;
            $topic['review_url'] = "/learn/{$contentSlug}?section={$secIdx}";
            $enriched[] = $topic;
        }

        return $enriched;
    }
}
