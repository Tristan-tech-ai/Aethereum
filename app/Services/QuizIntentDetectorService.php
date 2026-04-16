<?php

namespace App\Services;

class QuizIntentDetectorService
{
    private const QUIZ_KEYWORDS = [
        'quiz', 'latihan soal', 'soal latihan', 'ujian',
        'test', 'coba soal', 'kerjain soal', 'buatin soal',
        'latihan', 'uji', 'evaluasi diri'
    ];

    private const STUDY_KEYWORDS = [
        'belajar', 'materi', 'review', 'pelajari', 'jelasin',
        'rangkum', 'pahami'
    ];

    /**
     * Detect the primary intent of a user message.
     *
     * @param string $message
     * @return string 'quiz_request' | 'study_request' | 'general_question'
     */
    public function detect(string $message): string
    {
        $normalized = $this->normalizeMessage($message);

        foreach (self::QUIZ_KEYWORDS as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return 'quiz_request';
            }
        }

        foreach (self::STUDY_KEYWORDS as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return 'study_request';
            }
        }

        return 'general_question';
    }

    /**
     * Extract the topic hint from a quiz request by removing intent keywords.
     *
     * @param string $message
     * @return string|null
     */
    public function extractTopicHint(string $message): ?string
    {
        $normalized = $this->normalizeMessage($message);
        $hint = $normalized;

        $allKeywords = array_merge(self::QUIZ_KEYWORDS, self::STUDY_KEYWORDS);

        $fillers = ['tentang', 'materi', 'bab', 'untuk', 'buat', 'tolong'];

        foreach ($allKeywords as $keyword) {
            $hint = str_replace($keyword, '', $hint);
        }

        foreach ($fillers as $filler) {
            $hint = preg_replace('/\b' . preg_quote($filler, '/') . '\b/i', '', $hint);
        }

        $hint = trim(preg_replace('/\s+/', ' ', $hint));

        return $hint === '' ? null : $hint;
    }

    /**
     * Normalize message by converting to lowercase and stripping punctuation.
     *
     * @param string $message
     * @return string
     */
    private function normalizeMessage(string $message): string
    {
        $lowercase = mb_strtolower($message);
        return trim(preg_replace('/[^\w\s]/u', '', $lowercase));
    }
}
