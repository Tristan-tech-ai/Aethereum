<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;
    private array  $fallbackModels;

    public function __construct()
    {
        $this->apiKey  = config('services.gemini.api_key', '');
        $this->model   = config('services.gemini.model', 'gemini-2.5-flash');
        $this->baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->fallbackModels = config('services.gemini.fallback_models', [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash',
            'gemini-3.1-flash-lite-preview',
            'gemini-3-flash-preview',
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Low-level request with model fallback on 429
    // ─────────────────────────────────────────────────────────────

    /**
     * Send a generateContent request, cycling through fallback models on 429.
     *
     * @return array  Raw Gemini API response body (decoded JSON)
     */
    private function requestWithFallback(array $payload, int $timeout = 60): array
    {
        // Build ordered model list: primary first, then fallbacks (deduplicated)
        $models = array_values(array_unique(
            array_merge([$this->model], $this->fallbackModels)
        ));

        $lastError = null;

        foreach ($models as $model) {
            $url = "{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout($timeout)->post($url, $payload);

            if ($response->successful()) {
                if ($model !== $this->model) {
                    Log::info("Gemini fallback used: {$model} (primary {$this->model} was rate-limited)");
                }
                return $response->json();
            }

            if ($response->status() === 429) {
                Log::warning("Gemini 429 on model {$model}, trying next fallback...");
                $lastError = "Rate limit on {$model}";
                continue;
            }

            if ($response->status() === 404) {
                Log::warning("Gemini 404 on model {$model} (not found), trying next fallback...");
                $lastError = "Model not found: {$model}";
                continue;
            }

            // Other errors — don't fallback, just throw
            throw new RuntimeException(
                "Gemini API error [{$response->status()}]: " . $response->body()
            );
        }

        // All models exhausted
        throw new RuntimeException(
            "Semua model Gemini sedang mencapai batas kuota. ({$lastError})"
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Core API Call
    // ─────────────────────────────────────────────────────────────

    /**
     * Send a prompt to Gemini and return the parsed JSON response.
     */
    public function call(string $prompt, float $temperature = 0.7, int $maxTokens = 8192): array
    {
        $body = $this->requestWithFallback([
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature'       => $temperature,
                'maxOutputTokens'   => $maxTokens,
                'responseMimeType'  => 'application/json',
            ],
        ], 90);

        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        $decoded = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $cleaned = preg_replace('/^```(?:json)?\s*/m', '', $text);
            $cleaned = preg_replace('/```\s*$/m', '', $cleaned);
            $decoded = json_decode(trim($cleaned), true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Gemini response is not valid JSON: ' . substr($text, 0, 500));
        }

        return $decoded;
    }

    /**
     * Call Gemini and return raw text (not JSON-decoded) along with token usage.
     *
     * @return array{ text: string, usage: array{ prompt_tokens: ?int, completion_tokens: ?int } }
     */
    public function callRaw(string $prompt, float $temperature = 0.7, int $maxTokens = 1024): array
    {
        $body = $this->requestWithFallback([
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature'     => $temperature,
                'maxOutputTokens' => $maxTokens,
            ],
        ], 60);

        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        return [
            'text'  => $text,
            'usage' => [
                'prompt_tokens'     => $body['usageMetadata']['promptTokenCount'] ?? null,
                'completion_tokens' => $body['usageMetadata']['candidatesTokenCount'] ?? null,
            ],
        ];
    }

    /**
     * Call Gemini with JSON response mode for structured chat output.
     *
     * @return array{ data: array, usage: array{ prompt_tokens: ?int, completion_tokens: ?int } }
     */
    public function callChat(string $prompt, float $temperature = 0.7, int $maxTokens = 1024): array
    {
        $body = $this->requestWithFallback([
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature'       => $temperature,
                'maxOutputTokens'   => $maxTokens,
                'responseMimeType'  => 'application/json',
            ],
        ], 60);

        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            throw new RuntimeException('Gemini returned an empty response.');
        }

        $decoded = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $cleaned = preg_replace('/^```(?:json)?\s*/m', '', $text);
            $cleaned = preg_replace('/```\s*$/m', '', $cleaned);
            $decoded = json_decode(trim($cleaned), true);
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            $decoded = [
                'message' => $text,
                'sections' => [],
                'cta' => [],
            ];
        }

        return [
            'data'  => $decoded,
            'usage' => [
                'prompt_tokens'     => $body['usageMetadata']['promptTokenCount'] ?? null,
                'completion_tokens' => $body['usageMetadata']['candidatesTokenCount'] ?? null,
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // Content Analysis
    // ─────────────────────────────────────────────────────────────

    /**
     * Analyze raw content text and return structured course sections.
     */
    public function analyzeContent(string $rawText, string $contentType, ?string $title = null): array
    {
        // Truncate to safe limit
        if (mb_strlen($rawText) > 50000) {
            $rawText = mb_substr($rawText, 0, 50000) . "\n\n[Content truncated for analysis]";
        }

        $titleHint = $title ? "ORIGINAL TITLE: {$title}" : '';

        $prompt = <<<PROMPT
You are an educational content analyst for a learning platform called Nexera.

Analyze the following learning material and structure it into a comprehensive course.

MATERIAL TYPE: {$contentType}
{$titleHint}

INSTRUCTIONS:
1. Read the material carefully
2. Identify the main subject area and topic
3. Break the content into 5-7 logical learning sections
4. Each section should have a clear focus and be completable in 5-15 minutes
5. Write rich educational content for each section — expand and explain concepts clearly (not just a summary)
6. Identify key concepts and important terms
7. Determine the difficulty level (beginner/intermediate/advanced)

MATERIAL TEXT:
---
{$rawText}
---

OUTPUT FORMAT (strict JSON — no markdown fences):
{
  "title": "Improved descriptive title",
  "subject_category": "One of: Computer_Science, Mathematics, Physics, Chemistry, Biology, Engineering, Business, Economics, Psychology, Literature, History, Philosophy, Art, Music, Language, Health, General",
  "subject_icon": "A lucide-react icon name e.g. code, calculator, atom, flask, dna, cog, briefcase, trending-up, brain, book-open, landmark, lightbulb, palette, music, languages, heart, folder",
  "subject_color": "#hex color appropriate for the subject (e.g. #6366f1 for CS, #f59e0b for Math)",
  "difficulty": "beginner|intermediate|advanced",
  "estimated_duration": total_minutes_as_integer,
  "keywords": ["keyword1", "keyword2"],
  "sections": [
    {
      "id": "sec_1",
      "title": "Section Title",
      "content_text": "Detailed educational content in markdown. 200-500 words. Include explanations, examples, key points.",
      "key_concepts": ["concept1", "concept2"],
      "estimated_minutes": 5
    }
  ]
}

RULES:
- sections array MUST have 5 to 7 items
- content_text should TEACH the reader, not just summarize
- Use markdown (bold, lists, code blocks where appropriate)
- Match the material language (Indonesian or English)
- Output ONLY valid JSON, no markdown fences, no extra text
PROMPT;

        $result = $this->call($prompt, 0.7, 8192);

        // Validate required fields
        if (empty($result['sections']) || !is_array($result['sections'])) {
            throw new RuntimeException('Gemini analysis missing sections array.');
        }

        return $result;
    }

    // ─────────────────────────────────────────────────────────────
    // Quiz Generation
    // ─────────────────────────────────────────────────────────────

    /**
     * Generate quiz questions for a learning section.
     *
     * @return array[]  Each: { question, options[4], correct_index, explanation, difficulty }
     */
    public function generateQuiz(
        string $sectionText,
        string $sectionTitle,
        string $difficulty = 'medium',
        int $count = 5
    ): array {
        // Truncate section text
        if (mb_strlen($sectionText) > 10000) {
            $sectionText = mb_substr($sectionText, 0, 10000);
        }

        $prompt = <<<PROMPT
You are creating quiz questions for an educational learning platform called Nexera.

SECTION TITLE: {$sectionTitle}
DIFFICULTY LEVEL: {$difficulty}

SECTION CONTENT:
---
{$sectionText}
---

Generate exactly {$count} multiple-choice questions based ONLY on the content above.

REQUIREMENTS:
- Each question must be directly answerable from the section content
- Each question has exactly 4 options
- Include 1 correct answer and 3 plausible distractors
- Mix difficulty: 1 easy, 2 medium, 1 hard, 1 application-based
- Write clear, unambiguous questions
- Provide a brief explanation for the correct answer
- Test understanding and application, not just memorization

OUTPUT FORMAT (strict JSON array — no markdown fences):
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why this is the correct answer.",
    "difficulty": "easy|medium|hard"
  }
]

RULES:
- Output ONLY valid JSON array, no markdown fences
- Exactly {$count} questions
- correct_index is 0-based integer (0, 1, 2, or 3)
- options array must have exactly 4 items
- Match the section content language (Indonesian or English)
PROMPT;

        $result = $this->call($prompt, 0.6, 4096);

        // Handle if Gemini wraps in an object
        if (isset($result['questions'])) {
            $result = $result['questions'];
        }

        if (!is_array($result) || empty($result)) {
            throw new RuntimeException('Gemini quiz generation returned invalid result.');
        }

        return $result;
    }

    // ─────────────────────────────────────────────────────────────
    // Summary Validation
    // ─────────────────────────────────────────────────────────────

    /**
     * Validate user-written summary against original content using Gemini.
     *
     * @return array { score: int, approved: bool, feedback: { completeness, accuracy, clarity, missing_concepts[] } }
     */
    public function validateSummary(
        string $userSummary,
        string $originalContent,
        array $sectionTitles = []
    ): array {
        // Truncate original content for context window
        if (mb_strlen($originalContent) > 3000) {
            $originalContent = mb_substr($originalContent, 0, 3000) . "\n[...content truncated]";
        }

        $sectionsText = !empty($sectionTitles)
            ? implode("\n", array_map(fn($t, $i) => ($i + 1) . ". {$t}", $sectionTitles, array_keys($sectionTitles)))
            : 'N/A';

        $prompt = <<<PROMPT
You are an educational assessment AI for the Nexera learning platform.

A student has written a summary after studying material. Evaluate its quality.

ORIGINAL MATERIAL SECTIONS:
{$sectionsText}

ORIGINAL CONTENT (excerpt):
---
{$originalContent}
---

STUDENT'S SUMMARY:
---
{$userSummary}
---

Evaluate the summary on these criteria:
1. COMPLETENESS: Does it cover the main topics and key concepts? (0-100)
2. ACCURACY: Is the information factually correct based on the material? (0-100)
3. CLARITY: Is it well-written and easy to understand? (0-100)

OUTPUT FORMAT (strict JSON — no markdown fences):
{
  "score": overall_integer_0_to_100,
  "approved": true_if_score_gte_60,
  "feedback": {
    "completeness": "Feedback on topic coverage...",
    "accuracy": "Feedback on factual correctness...",
    "clarity": "Feedback on writing quality...",
    "missing_concepts": ["missed concept 1", "missed concept 2"]
  }
}

RULES:
- Be encouraging but honest
- A student covering 60%+ of key concepts in clear language should pass (score >= 60)
- Output ONLY valid JSON, no markdown fences
- Match the student's language (Indonesian or English)
PROMPT;

        $result = $this->call($prompt, 0.5, 2048);

        // Ensure approved matches score
        $score    = (int) ($result['score'] ?? 0);
        $approved = $result['approved'] ?? ($score >= 60);

        return [
            'score'    => $score,
            'approved' => $approved,
            'feedback' => $result['feedback'] ?? [
                'completeness'     => 'Unable to evaluate.',
                'accuracy'         => 'Unable to evaluate.',
                'clarity'          => 'Unable to evaluate.',
                'missing_concepts' => [],
            ],
        ];
    }
}
