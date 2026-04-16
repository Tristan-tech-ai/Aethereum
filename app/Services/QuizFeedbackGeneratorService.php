<?php

namespace App\Services;

use App\Models\LearningContent;
use Illuminate\Support\Facades\Log;

class QuizFeedbackGeneratorService
{
    public function __construct(protected GeminiService $gemini) {}

    /**
     * Generate conversational follow-up message using Gemini API.
     */
    public function generateFollowUpMessage(array $analysisResult, LearningContent $content): array
    {
        $title = $content->title;
        $score = $analysisResult['score'];
        $accuracy = $analysisResult['accuracy'];
        $masteryLevel = $analysisResult['mastery_level'];

        $weakTopicsText = count($analysisResult['weak_topics']) > 0
            ? implode(', ', array_column($analysisResult['weak_topics'], 'title'))
            : 'Tidak ada';

        $strongTopicsText = count($analysisResult['strong_topics']) > 0
            ? implode(', ', array_column($analysisResult['strong_topics'], 'title'))
            : 'Tidak ada';

        $prompt = <<<PROMPT
System: Kamu adalah learning assistant yang membantu user memahami materi setelah mengerjakan quiz. Berikan feedback yang personal, supportif, dan actionable dalam Bahasa Indonesia. Maksimal 3 paragraf pendek.
User: Berikut hasil quiz user:
Materi: {$title}
Skor: {$score}/100 ({$accuracy}% benar)
Mastery level: {$masteryLevel}
Topik lemah: {$weakTopicsText}
Topik kuat: {$strongTopicsText}

Berikan:
Kalimat pembuka yang mengapresiasi usaha user (sesuaikan dengan skor)
Penjelasan singkat topik mana yang perlu direview
Satu saran spesifik langkah berikutnya
Jangan gunakan bullet points. Tulis dalam gaya percakapan yang hangat.
PROMPT;

        try {
            $response = $this->gemini->callRaw($prompt, 0.7, 500);
            $feedbackText = $response['text'];
        } catch (\Throwable $e) {
            Log::warning("Gemini timeout or error while generating feedback: " . $e->getMessage());
            $feedbackText = $this->getStaticFeedback($masteryLevel);
        }

        // Generate CTA buttons
        $ctaButtons = [];
        $weakConfig = null;

        if (count($analysisResult['weak_topics']) > 0) {
            $firstWeakTopic = $analysisResult['weak_topics'][0];
            $contentSlug = $content->slug ?? $content->id;
            
            $ctaButtons[] = [
                'label' => "Review " . $firstWeakTopic['title'],
                'url' => "/learn/{$contentSlug}?section={$firstWeakTopic['section_index']}",
                'type' => 'review'
            ];

            $ctaButtons[] = [
                'label' => 'Quiz Ulang Topik Lemah',
                'action' => 'quiz_weak_topics',
                'type' => 'quiz'
            ];

            $weakConfig = [
                'content_id' => $content->id,
                'section_index' => $firstWeakTopic['section_index'],
                'count' => 5,
                'type' => 'mixed',
                'difficulty' => 'easy',
            ];
        } else {
            $contentSlug = $content->slug ?? $content->id;
            $ctaButtons[] = [
                'label' => 'Review Keseluruhan',
                'url' => "/learn/{$contentSlug}",
                'type' => 'review'
            ];
            
            $ctaButtons[] = [
                'label' => 'Lanjut Materi Berikutnya',
                'url' => '/learn', // fallback/next url
                'type' => 'next'
            ];
        }

        return [
            'feedback_text' => $feedbackText,
            'ui_type' => 'follow_up',
            'cta_buttons' => $ctaButtons,
            'weak_topic_quiz_config' => $weakConfig,
        ];
    }

    /**
     * Generate explanations for up to 3 wrong questions.
     */
    public function generatePerQuestionFeedback(array $perQuestion, LearningContent $content): array
    {
        $wrongQuestions = array_filter($perQuestion, fn($q) => !$q['is_correct']);
        $wrongQuestions = array_slice($wrongQuestions, 0, 3);
        
        if (empty($wrongQuestions)) {
            return [];
        }

        $result = [];
        foreach ($wrongQuestions as $wq) {
            // In a real scenario, you would fetch actual question text using $wq['question_id'] 
            // For now we assume placeholder text or extract it if provided in the struct
            $qText = $wq['question_text'] ?? "Pertanyaan ID: " . $wq['question_id'];
            $cAnswer = $wq['correct_answer'] ?? 'Tidak diketahui';
            
            $prompt = "Berikan penjelasan singkat (1-2 kalimat) mengapa '{$cAnswer}' adalah jawaban yang benar untuk pertanyaan: '{$qText}' berdasarkan topik '{$content->title}'. Gunakan rujukan yang supportif.";
            
            try {
                $response = $this->gemini->callRaw($prompt, 0.6, 200);
                $explanation = $response['text'];
            } catch (\Throwable $e) {
                $explanation = "Ini adalah jawaban yang tepat berdasarkan materi {$content->title}.";
            }

            $result[] = [
                'question_text' => $qText,
                'correct_answer' => $cAnswer,
                'explanation' => $explanation,
                'section_title' => $wq['section_title'] ?? 'Materi Pembahasan',
            ];
        }

        return $result;
    }

    /**
     * Fallback static feedback.
     */
    private function getStaticFeedback(string $masteryLevel): string
    {
        return match ($masteryLevel) {
            'excellent' => "Luar biasa! Kamu sudah menguasai materi ini dengan sangat baik.",
            'good' => "Bagus! Ada beberapa topik yang bisa diperdalam lagi.",
            'needs_work' => "Kamu sudah berusaha! Mari review topik yang belum dikuasai.",
            'struggling' => "Jangan menyerah! Coba pelajari ulang materi dasarnya terlebih dahulu.",
            default => "Terima kasih sudah menyelesaikan quiz. Mari terus belajar!",
        };
    }
}
