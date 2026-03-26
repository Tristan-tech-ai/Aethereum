# Generate Course — End-to-End Implementation Specification

**Version:** 1.0
**Date:** March 25, 2026
**Status:** IMPLEMENTATION READY

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [Target E2E Flow](#3-target-e2e-flow)
4. [Implementation Tasks](#4-implementation-tasks)
5. [Task 1: GeminiService (NEW)](#5-task-1-geminiservice)
6. [Task 2: PDF Text Extraction](#6-task-2-pdf-text-extraction)
7. [Task 3: YouTube Transcript Extraction](#7-task-3-youtube-transcript-extraction)
8. [Task 4: Web Article Extraction (Jina)](#8-task-4-web-article-extraction-jina)
9. [Task 5: AnalyzeContentJob Rewrite](#9-task-5-analyzecontentjob-rewrite)
10. [Task 6: GenerateQuizJob Rewrite](#10-task-6-generatequizjob-rewrite)
11. [Task 7: Summary Validation with AI](#11-task-7-summary-validation-with-ai)
12. [Task 8: XP & Coin Reward System](#12-task-8-xp--coin-reward-system)
13. [Task 9: Achievement System](#13-task-9-achievement-system)
14. [Task 10: Frontend Polish](#14-task-10-frontend-polish)
15. [Environment & Dependencies](#15-environment--dependencies)
16. [API Contracts](#16-api-contracts)
17. [Gemini Prompt Templates](#17-gemini-prompt-templates)
18. [Database Schema Reference](#18-database-schema-reference)
19. [Testing Checklist](#19-testing-checklist)
20. [Risk & Fallback Strategy](#20-risk--fallback-strategy)

---

## 1. Executive Summary

### Goal
Make the "Generate Course" flow work **end-to-end** — from uploading a PDF/YouTube/URL to AI-analyzing it, structuring it into learning sections, generating real quizzes, validating summaries, awarding XP/coins, and creating Knowledge Cards.

### What Works Now
- File upload (PDF/PPTX/image) → stored to filesystem ✅
- URL upload (YouTube/article auto-detect) → stored to DB ✅
- Content status tracking (processing → ready/failed) ✅
- Session lifecycle (start → progress → quiz → summary → complete) ✅
- Knowledge Card creation from completed sessions ✅
- Focus tracking (tab switches, integrity calculation) ✅
- Quiz grading logic ✅
- Frontend: GenerateCoursePage, ContentLibraryPage, DocumentDungeonPage ✅

### What's MOCKED / BROKEN
- **AnalyzeContentJob** → Always returns 3 hardcoded mock sections ❌
- **GenerateQuizJob** → Always returns 2 hardcoded mock questions ❌
- **QuizGeneratorService** → Generates 5 placeholder questions unrelated to content ❌
- **Summary validation** → Simple word-count heuristics, no AI ❌
- **XP awards** → Never happens (TODO in ProcessKnowledgeCardJob) ❌
- **Coin awards** → Never happens (only welcome bonus) ❌
- **Achievement awards** → achievements table empty, no trigger logic ❌
- **No PDF text extraction** → File is stored but never read ❌
- **No YouTube transcript extraction** → URL stored but never fetched ❌
- **No web article extraction** → Jina API key exists but never called ❌
- **No GeminiService exists** → The core AI service was never created ❌

---

## 2. Current State Audit

### Files That Need MODIFICATION

| File | Current State | What Needs to Change |
|------|--------------|---------------------|
| `app/Jobs/AnalyzeContentJob.php` (75 lines) | Mock: 3 hardcoded sections, `sleep(3)` | Real: extract text → call Gemini → parse sections |
| `app/Jobs/GenerateQuizJob.php` (65 lines) | Mock: 2 hardcoded questions | Real: call Gemini per section → store quizzes |
| `app/Jobs/ProcessKnowledgeCardJob.php` (105 lines) | Card creation works, XP/coins/achievements are TODO | Add: XP award, coin award, achievement check |
| `app/Services/QuizGeneratorService.php` (300 lines) | `generateQuiz()` uses placeholder questions | Replace with Gemini API call |
| `app/Http/Controllers/Api/SessionController.php` (~400 lines) | `validateSummary()` uses word-count heuristics | Replace with Gemini-powered validation |

### Files That Need CREATION

| File | Purpose |
|------|---------|
| `app/Services/GeminiService.php` | Core AI service — analyze content, generate quizzes, validate summaries |
| `app/Services/ContentExtractorService.php` | Extract text from PDF, YouTube, web articles |
| `app/Services/KnowledgeProfileService.php` | XP calculation, level-up, rank-up logic |
| `app/Services/CoinEconomyService.php` | Coin award with daily cap |
| `app/Services/AchievementService.php` | Check & award achievements based on triggers |
| `database/seeders/AchievementSeeder.php` | Seed 14 achievement definitions |

### Existing Files — NO CHANGES NEEDED

| File | Status |
|------|--------|
| `app/Http/Controllers/Api/ContentController.php` | ✅ Upload & URL endpoints work correctly |
| `app/Models/LearningContent.php` | ✅ Schema correct, casts correct |
| `app/Models/KnowledgeCard.php` | ✅ Has `tierFromMastery()` static |
| `app/Models/LearningSession.php` | ✅ Relationships set up |
| `app/Services/FocusTrackerService.php` | ✅ Distraction penalty calculation works |
| `app/Services/LearningFlowService.php` | ✅ Flow config selection works |
| `frontend/src/stores/contentStore.js` | ✅ Upload, polling, delete all work |
| `frontend/src/stores/sessionStore.js` | ✅ Full session lifecycle with fallbacks |
| `frontend/src/pages/GenerateCoursePage.jsx` | ✅ Upload UI complete |
| `frontend/src/pages/ContentLibraryPage.jsx` | ✅ Library management complete |

---

## 3. Target E2E Flow

```
USER UPLOADS CONTENT
         │
         ▼
┌─────────────────────────────────┐
│   ContentController::upload()    │ ← POST /v1/content/upload
│   or ContentController::url()    │ ← POST /v1/content/url
│                                  │
│   - Validate file/URL            │
│   - Store file to disk           │
│   - Create LearningContent       │
│     (status: 'processing')       │
│   - Dispatch AnalyzeContentJob   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   AnalyzeContentJob (QUEUE)      │
│                                  │
│ 1. Extract raw text:             │
│    - PDF → smalot/pdfparser      │
│    - YouTube → YouTube captions  │
│    - Article → Jina Reader API   │
│    - Image → send to Gemini      │
│    - PPTX → PhpPresentation      │
│                                  │
│ 2. Call GeminiService::          │
│    analyzeContent(text)          │
│    → Returns:                    │
│      - title (improved)          │
│      - subject_category          │
│      - subject_icon              │
│      - subject_color             │
│      - difficulty                │
│      - estimated_duration        │
│      - keywords[]                │
│      - structured_sections[]     │
│        (5-7 sections, each with  │
│         title, content_text,     │
│         key_concepts,            │
│         estimated_minutes)       │
│                                  │
│ 3. Update LearningContent:       │
│    - ai_analysis = full result   │
│    - structured_sections         │
│    - subject_category/icon/color │
│    - status = 'ready'            │
│                                  │
│ 4. Dispatch GenerateQuizJob      │
│    for each section              │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  GenerateQuizJob (QUEUE)         │
│  (one job per section)           │
│                                  │
│ 1. Call GeminiService::          │
│    generateQuiz(section_text)    │
│    → Returns 5 MCQ questions     │
│      with options, correct_index,│
│      explanation                 │
│                                  │
│ 2. Create Quiz record:           │
│    content_id, section_index,    │
│    questions (JSONB),            │
│    difficulty, time_limit        │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  FRONTEND POLLING (3s interval)  │
│                                  │
│  contentStore.startPolling(id)   │
│  → GET /v1/content/{id}         │
│  → When status='ready' → stop   │
│  → Show "Ready to Learn" in     │
│    Content Library / Generate    │
│    Course page                   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  USER STARTS LEARNING SESSION    │
│                                  │
│  POST /v1/sessions/start         │
│  → Creates LearningSession       │
│  → Returns content + sections    │
│  → Frontend enters Quest Map     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  DOCUMENT DUNGEON LOOP           │
│  For each section:               │
│                                  │
│  1. READING (focus timer)        │
│     - Min read time enforced     │
│     - Tab switch detection       │
│     - Focus integrity tracking   │
│     - PATCH /sessions/{id}/      │
│       progress                   │
│                                  │
│  2. QUIZ (per section)           │
│     - Fetch quiz: GET /sessions/ │
│       {id}/quiz?section=N OR use │
│       embedded quiz_questions    │
│     - Submit: POST /sessions/    │
│       {id}/quiz-attempt          │
│     - Must score ≥70% to pass    │
│     - 5 min cooldown on retry    │
│                                  │
│  3. REPEAT for all sections      │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  SUMMARY (after last section)    │
│                                  │
│  User writes summary             │
│  POST /sessions/{id}/            │
│    validate-summary              │
│                                  │
│  → GeminiService::               │
│    validateSummary(              │
│      user_summary,               │
│      original_content            │
│    )                             │
│  → Returns: score, feedback,     │
│    completeness, accuracy,       │
│    missing_concepts, approved    │
│                                  │
│  Must get approved (≥60 score)   │
│  to complete session             │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  SESSION COMPLETE                │
│                                  │
│  POST /sessions/{id}/complete    │
│  → Dispatches                    │
│    ProcessKnowledgeCardJob:      │
│                                  │
│  1. Create Knowledge Card        │
│     mastery = quiz(40%) +        │
│     focus(30%) + summary(30%)    │
│     tier = Bronze/Silver/Gold/   │
│            Diamond               │
│                                  │
│  2. Award XP                     │
│     → KnowledgeProfileService    │
│     +20 per section completed    │
│     +30 quiz pass (+50 perfect)  │
│     +25 summary approved         │
│     +15 focus ≥90% bonus         │
│     +100 full material           │
│     → Check level up             │
│     → Check rank up              │
│                                  │
│  3. Award Coins                  │
│     → CoinEconomyService         │
│     10 base + bonuses            │
│     Daily cap: 500 coins         │
│                                  │
│  4. Check Achievements           │
│     → AchievementService         │
│     First Steps, Quiz Master,    │
│     Bookworm, Polymath, etc.     │
│                                  │
│  5. Update Streak                │
│     If first session today       │
│     → increment current_streak   │
│     → check streak milestones    │
│                                  │
│  6. Log Feed Events              │
│     → card_created, level_up,    │
│       rank_up, achievement       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  COMPLETION SCREEN (Frontend)    │
│                                  │
│  sessionStore rewards:           │
│  - Knowledge Card reveal         │
│    (tier animation)              │
│  - XP breakdown list             │
│  - Coins earned                  │
│  - Streak update                 │
│  - Achievement unlocks           │
│  - "View Profile" / "Continue"   │
└─────────────────────────────────┘
```

---

## 4. Implementation Tasks (Ordered)

| # | Task | Priority | Effort | Dependencies |
|---|------|----------|--------|-------------|
| 1 | Create `GeminiService` | **P0 CRITICAL** | Medium | None — core building block |
| 2 | PDF text extraction | **P0 CRITICAL** | Small | Composer package install |
| 3 | YouTube transcript extraction | **P0 CRITICAL** | Small | HTTP client |
| 4 | Web article extraction (Jina) | **P0 CRITICAL** | Small | Jina API key (available) |
| 5 | Rewrite `AnalyzeContentJob` | **P0 CRITICAL** | Medium | Tasks 1-4 |
| 6 | Rewrite `GenerateQuizJob` + `QuizGeneratorService` | **P0 CRITICAL** | Medium | Task 1, 5 |
| 7 | AI summary validation in `SessionController` | **P0** | Small | Task 1 |
| 8 | XP & Coin reward system | **P0** | Medium | None |
| 9 | Achievement system | **P1** | Medium | Task 8 |
| 10 | Frontend polish (GenerateCoursePage ↔ Library flow) | **P1** | Small | Tasks 5-6 |

---

## 5. Task 1: GeminiService (NEW)

### File: `app/Services/GeminiService.php`

### Purpose
Central service for all Google Gemini 2.0 Flash API calls.

### Config Required
```php
// config/services.php — add:
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
    'model'   => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
],
```

### .env (Already exists)
```
GEMINI_API_KEY=AIzaSyAvJgzgVwrCUTDa5pTbrJ5pMdDkqukDz5w
GEMINI_MODEL=gemini-2.0-flash
```

### API Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```

### Request Format
```json
{
  "contents": [
    {
      "parts": [
        { "text": "System prompt + user content" }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 8192,
    "responseMimeType": "application/json"
  }
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "{...JSON string...}" }
        ]
      }
    }
  ]
}
```

### Methods to Implement

```php
class GeminiService
{
    /**
     * Raw API call to Gemini.
     * @param string $prompt  Full prompt text
     * @param float  $temperature  0.0 to 1.0
     * @param int    $maxTokens  Max output tokens
     * @return array  Parsed JSON response from Gemini
     * @throws \RuntimeException on API error or invalid JSON
     */
    public function call(string $prompt, float $temperature = 0.7, int $maxTokens = 8192): array;

    /**
     * Analyze extracted text and return structured sections.
     * @param string $rawText    Extracted text from PDF/YouTube/article
     * @param string $contentType  'pdf'|'youtube'|'article'|'image'|'pptx'
     * @param string|null $title  Original title (optional, AI can improve)
     * @return array {
     *   title: string,
     *   subject_category: string,
     *   subject_icon: string,      // Lucide icon name
     *   subject_color: string,     // hex color
     *   difficulty: string,        // beginner|intermediate|advanced
     *   estimated_duration: int,   // total minutes
     *   keywords: string[],
     *   sections: array[] {
     *     title: string,
     *     content_text: string,    // rich learning text (markdown)
     *     key_concepts: string[],
     *     estimated_minutes: int,
     *   }
     * }
     */
    public function analyzeContent(string $rawText, string $contentType, ?string $title = null): array;

    /**
     * Generate quiz questions for a given section.
     * @param string $sectionText   The section content text
     * @param string $sectionTitle  The section title
     * @param string $difficulty    'easy'|'medium'|'hard'
     * @param int    $count         Number of questions (default 5)
     * @return array[] Each: {
     *   question: string,
     *   options: string[4],      // exactly 4 options
     *   correct_index: int,      // 0-3
     *   explanation: string,
     *   difficulty: string,
     * }
     */
    public function generateQuiz(string $sectionText, string $sectionTitle, string $difficulty = 'medium', int $count = 5): array;

    /**
     * Validate user summary against the original content.
     * @param string $userSummary       User's written summary
     * @param string $originalContent   The full material content
     * @param string[] $sectionTitles   List of section titles for reference
     * @return array {
     *   score: int,           // 0-100
     *   approved: bool,       // score >= 60
     *   feedback: {
     *     completeness: string,
     *     accuracy: string,
     *     clarity: string,
     *     missing_concepts: string[],
     *   }
     * }
     */
    public function validateSummary(string $userSummary, string $originalContent, array $sectionTitles = []): array;

    /**
     * Generate knowledge card metadata from session data.
     * @return array { subject_category, subject_icon, subject_color, keywords, card_title }
     */
    public function generateCardMetadata(string $title, string $summary, array $quizTopics): array;
}
```

### Rate Limits
- Gemini 2.0 Flash free tier: **15 RPM, 1500 req/day, 1M tokens/min**
- Plan: Use synchronous calls in queue jobs (not blocking web requests)
- Add retry logic with exponential backoff (429 handling)

### Error Handling
- Wrap in try/catch with specific exceptions
- If Gemini API fails → log error + set content status to 'failed' with error_message
- If JSON parse fails → retry once, then fail gracefully
- Return fallback mock data only in LOCAL/testing environments

---

## 6. Task 2: PDF Text Extraction

### Package: `smalot/pdfparser`
```bash
composer require smalot/pdfparser
```

### Why This Package
- Pure PHP (no external binary dependencies like pdftotext)
- Works on shared hosting / Railway / any PHP environment
- Handles most PDF text extraction needs
- 4K+ GitHub stars, actively maintained

### Implementation in ContentExtractorService

```php
// app/Services/ContentExtractorService.php

use Smalot\PdfParser\Parser as PdfParser;

public function extractFromPdf(string $filePath): string
{
    $parser = new PdfParser();
    $pdf = $parser->parseFile(Storage::path($filePath));
    $text = $pdf->getText();

    // Clean up: normalize whitespace, remove excessive blank lines
    $text = preg_replace('/\n{3,}/', "\n\n", $text);
    $text = trim($text);

    // Safety: truncate to ~50,000 chars (Gemini context limit ~1M tokens)
    if (mb_strlen($text) > 50000) {
        $text = mb_substr($text, 0, 50000) . "\n\n[Content truncated for analysis]";
    }

    return $text;
}
```

### Edge Cases
- Scanned PDF (no text layer) → Text will be empty → Inform user "This PDF appears to be scanned. Try uploading an image version instead."
- Password-protected PDF → `PdfParser` will throw → Catch and set status='failed'
- Very large PDFs → Truncate to 50K chars

---

## 7. Task 3: YouTube Transcript Extraction

### Approach: YouTube Captions via `invidious` or direct endpoint

YouTube does not have an official transcript API, but there are reliable methods:

### Option A: Use `youtube-transcript-api` style approach (HTTP scraping)

YouTube auto-generated captions are available at:
```
https://www.youtube.com/watch?v={videoId}
```
Page contains `captionTracks` in the initial JSON payload, which has `baseUrl` links to XML captions.

### Implementation in ContentExtractorService

```php
public function extractFromYoutube(string $url): array
{
    $videoId = $this->parseYoutubeVideoId($url);
    if (!$videoId) {
        throw new \InvalidArgumentException("Invalid YouTube URL");
    }

    // Try fetching transcript via timedtext API
    $transcriptUrl = "https://www.youtube.com/watch?v={$videoId}";
    $response = Http::withHeaders([
        'User-Agent' => 'Mozilla/5.0',
        'Accept-Language' => 'en',
    ])->get($transcriptUrl);

    $html = $response->body();

    // Extract captionTracks from page JSON
    preg_match('/"captionTracks":\s*(\[.*?\])/', $html, $matches);
    if (empty($matches[1])) {
        // Fallback: use Jina Reader to get page content
        return [
            'text' => $this->extractFromArticle($url),
            'method' => 'jina_fallback',
        ];
    }

    $captionTracks = json_decode($matches[1], true);
    $track = collect($captionTracks)->first(fn($t) =>
        str_contains($t['languageCode'] ?? '', 'en') ||
        str_contains($t['languageCode'] ?? '', 'id')
    ) ?? $captionTracks[0] ?? null;

    if (!$track || empty($track['baseUrl'])) {
        return [
            'text' => $this->extractFromArticle($url),
            'method' => 'jina_fallback',
        ];
    }

    // Fetch XML caption track
    $captionResponse = Http::get($track['baseUrl']);
    $xml = simplexml_load_string($captionResponse->body());

    $transcript = '';
    foreach ($xml->text as $segment) {
        $text = html_entity_decode(strip_tags((string) $segment));
        $transcript .= $text . ' ';
    }

    return [
        'text' => trim($transcript),
        'method' => 'youtube_captions',
        'video_id' => $videoId,
        'language' => $track['languageCode'] ?? 'unknown',
    ];
}

private function parseYoutubeVideoId(string $url): ?string
{
    $patterns = [
        '/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/',
        '/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/',
        '/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
    }
    return null;
}
```

### Fallback
If YouTube captions are unavailable → use Jina Reader API as fallback to extract the page title/description.

---

## 8. Task 4: Web Article Extraction (Jina Reader API)

### API Key (Already in .env)
```
JINA_API_KEY=jina_c7c2399ebe874bc49dd847e20e51311dBc_G6uDl-K8XU9HrE7vnOSoCs28D
```

### Endpoint
```
GET https://r.jina.ai/{url}
```
Returns clean markdown text of the web page.

### Implementation in ContentExtractorService

```php
public function extractFromArticle(string $url): string
{
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . config('services.jina.api_key'),
        'Accept' => 'text/plain',
        'X-Return-Format' => 'text',
    ])->timeout(30)->get('https://r.jina.ai/' . $url);

    if (!$response->successful()) {
        throw new \RuntimeException("Jina Reader failed: HTTP {$response->status()}");
    }

    $text = $response->body();

    // Truncate if needed
    if (mb_strlen($text) > 50000) {
        $text = mb_substr($text, 0, 50000) . "\n\n[Content truncated for analysis]";
    }

    return $text;
}
```

### Config Required
```php
// config/services.php — add:
'jina' => [
    'api_key' => env('JINA_API_KEY'),
],
```

---

## 9. Task 5: AnalyzeContentJob Rewrite

### File: `app/Jobs/AnalyzeContentJob.php`

### Current Code (MOCKED)
```php
// sleep(3) + 3 hardcoded mock sections → status='ready'
```

### New Implementation Flow

```php
public function handle(): void
{
    $content = $this->learningContent;
    $content->update(['status' => 'processing']);

    try {
        // ─── Step 1: Extract raw text ───
        $extractor = app(ContentExtractorService::class);
        $rawText = match ($content->content_type) {
            'pdf'     => $extractor->extractFromPdf($content->file_path),
            'youtube' => $extractor->extractFromYoutube($content->source_url)['text'],
            'article' => $extractor->extractFromArticle($content->source_url),
            'image'   => $extractor->extractFromImage($content->file_path),
            'pptx'    => $extractor->extractFromPptx($content->file_path),
            default   => throw new \RuntimeException("Unsupported type: {$content->content_type}"),
        };

        if (empty(trim($rawText))) {
            throw new \RuntimeException('No text could be extracted from this content.');
        }

        // ─── Step 2: AI analyze ───
        $gemini = app(GeminiService::class);
        $analysis = $gemini->analyzeContent($rawText, $content->content_type, $content->title);

        // ─── Step 3: Update content record ───
        $content->update([
            'title'               => $analysis['title'] ?? $content->title,
            'ai_analysis'         => $analysis,
            'structured_sections' => $analysis['sections'] ?? [],
            'subject_category'    => $analysis['subject_category'] ?? null,
            'subject_icon'        => $analysis['subject_icon'] ?? null,
            'subject_color'       => $analysis['subject_color'] ?? null,
            'difficulty'          => $analysis['difficulty'] ?? 'intermediate',
            'estimated_duration'  => $analysis['estimated_duration'] ?? null,
            'status'              => 'ready',
            'error_message'       => null,
        ]);

        // ─── Step 4: Generate quizzes per section ───
        $sections = $analysis['sections'] ?? [];
        foreach ($sections as $index => $section) {
            GenerateQuizJob::dispatch($content, $index, $section)->onQueue('default');
        }

        Log::info("AnalyzeContentJob completed for {$content->id}");

    } catch (\Throwable $e) {
        Log::error("AnalyzeContentJob failed for {$content->id}: " . $e->getMessage());
        $content->update([
            'status' => 'failed',
            'error_message' => mb_substr($e->getMessage(), 0, 500),
        ]);
        throw $e;
    }
}
```

### Key Changes
1. No more `sleep(3)` or mock data
2. Real text extraction per content type
3. Gemini API call for analysis
4. Dispatches `GenerateQuizJob` for EACH section (instead of once)
5. Stores full AI analysis in `ai_analysis` JSONB
6. Better error handling with user-visible error messages

---

## 10. Task 6: GenerateQuizJob Rewrite

### File Changes
- `app/Jobs/GenerateQuizJob.php` — rewrite constructor to accept section index + data
- `app/Services/QuizGeneratorService.php` — replace `generatePlaceholderQuestions()` with Gemini call

### New GenerateQuizJob

```php
class GenerateQuizJob implements ShouldQueue
{
    public function __construct(
        public LearningContent $content,
        public int $sectionIndex,
        public array $sectionData,
    ) {}

    public function handle(): void
    {
        // Skip if quiz already exists for this section
        if (Quiz::where('content_id', $this->content->id)
                ->where('section_index', $this->sectionIndex)->exists()) {
            return;
        }

        $gemini = app(GeminiService::class);
        $sectionText = $this->sectionData['content_text'] ?? '';
        $sectionTitle = $this->sectionData['title'] ?? "Section {$this->sectionIndex}";
        $difficulty = $this->content->difficulty ?? 'medium';

        $questions = $gemini->generateQuiz($sectionText, $sectionTitle, $difficulty, 5);

        Quiz::create([
            'content_id'        => $this->content->id,
            'section_index'     => $this->sectionIndex,
            'questions'         => $questions,
            'question_count'    => count($questions),
            'difficulty'        => $difficulty,
            'time_limit_seconds'=> 120,
            'pass_threshold'    => 70,
        ]);
    }
}
```

### QuizGeneratorService Update

Replace `generatePlaceholderQuestions()` with:
```php
private function generateAIQuestions(string $sectionTitle, string $content, string $difficulty = 'medium'): array
{
    return app(GeminiService::class)->generateQuiz($content, $sectionTitle, $difficulty, 5);
}
```

Keep `gradeAttempt()` and `recordAttempt()` unchanged — they work correctly.

---

## 11. Task 7: Summary Validation with AI

### File: `app/Http/Controllers/Api/SessionController.php`

### Current Code (in `validateSummary()` method)
```php
// Heuristic scoring
$wordCount = str_word_count($summary);
$lengthScore = min(100, ($wordCount / 150) * 100);
$hasStructure = preg_match('/[\.\!\?]/', $summary) ? 10 : 0;
// ... etc
```

### New Implementation

```php
public function validateSummary(Request $request, string $id): JsonResponse
{
    $session = LearningSession::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->firstOrFail();

    $request->validate([
        'summary' => ['required', 'string', 'min:50', 'max:5000'],
    ]);

    $summary = $request->input('summary');
    $content = $session->content;

    // Gather original content text from sections
    $sections = $content->structured_sections ?? [];
    $originalText = collect($sections)->pluck('content_text')->implode("\n\n");
    $sectionTitles = collect($sections)->pluck('title')->toArray();

    // Call Gemini for validation
    try {
        $gemini = app(GeminiService::class);
        $result = $gemini->validateSummary($summary, $originalText, $sectionTitles);
    } catch (\Throwable $e) {
        // Fallback to heuristic if AI fails
        $result = $this->heuristicSummaryValidation($summary);
    }

    $score = $result['score'] ?? 0;
    $approved = $result['approved'] ?? ($score >= 60);

    // Update session
    $session->update([
        'user_summary'  => $summary,
        'summary_score' => $score,
    ]);

    return response()->json([
        'data' => [
            'score'    => $score,
            'approved' => $approved,
            'feedback' => $result['feedback'] ?? null,
        ],
    ]);
}
```

---

## 12. Task 8: XP & Coin Reward System

### File: `app/Services/KnowledgeProfileService.php` (NEW)

### XP Sources per PRD

| Activity | XP |
|----------|-----|
| Complete 1 section | +20 |
| Pass quiz (≥70%) | +30 |
| Perfect quiz (100%) | +50 (replaces the +30) |
| Submit summary | +25 |
| Focus integrity ≥90% bonus | +15 |
| Complete full material | +100 |

### Formula
```php
public static function xpNeededForLevel(int $level): int
{
    return (int) round(100 * pow($level, 1.5));
}
```

### Level → Rank Mapping
```php
private static function rankForLevel(int $level): string
{
    return match(true) {
        $level >= 76 => 'Sage',
        $level >= 51 => 'Expert',
        $level >= 31 => 'Researcher',
        $level >= 16 => 'Scholar',
        $level >= 6  => 'Learner',
        default      => 'Seedling',
    };
}
```

### Method Signatures

```php
class KnowledgeProfileService
{
    /**
     * Calculate and award XP for a completed session.
     * Returns XP breakdown + whether level/rank changed.
     */
    public function awardSessionXP(LearningSession $session, User $user): array;

    /**
     * Add raw XP to user and check for level/rank up.
     */
    public function addXP(User $user, int $amount, string $source, ?string $description = null): array;

    /**
     * Update user streak based on learning activity.
     */
    public function updateStreak(User $user): array;
}
```

### Coin Economy — `app/Services/CoinEconomyService.php` (NEW)

```php
class CoinEconomyService
{
    private const DAILY_CAP = 500;

    /**
     * Award coins for a completed session.
     * Base: 10 + (focus_integrity / 10) + (quiz_score / 10)
     * Respects daily cap.
     */
    public function awardSessionCoins(LearningSession $session, User $user): array;

    /**
     * Add coins to user wallet with daily cap check.
     */
    public function addCoins(User $user, int $amount, string $source, ?string $description = null): array;
}
```

### Integration Point
In `ProcessKnowledgeCardJob::handle()`, replace TODO comments:
```php
// Award XP
$profileService = app(KnowledgeProfileService::class);
$xpResult = $profileService->awardSessionXP($session, $user);

// Award coins
$coinService = app(CoinEconomyService::class);
$coinResult = $coinService->awardSessionCoins($session, $user);

// Check achievements
$achievementService = app(AchievementService::class);
$newAchievements = $achievementService->checkAndAward($user);

// Log feed events
$feedService = app(FeedEventService::class);
if ($xpResult['level_up']) {
    $feedService->logEvent($user->id, 'level_up', $xpResult);
}
if ($xpResult['rank_up']) {
    $feedService->logEvent($user->id, 'rank_up', $xpResult);
}
$feedService->logEvent($user->id, 'card_created', ['card_id' => $card->id, 'tier' => $card->tier]);
```

---

## 13. Task 9: Achievement System

### File: `app/Services/AchievementService.php` (NEW)

### Achievement Definitions (Seed Data)

```php
// database/seeders/AchievementSeeder.php

$achievements = [
    ['id' => 'first_steps',      'name' => 'First Steps',       'description' => 'Complete your first learning session', 'icon' => 'rocket',    'category' => 'learning', 'trigger_condition' => ['type' => 'total_sessions', 'value' => 1]],
    ['id' => 'bookworm',         'name' => 'Bookworm',          'description' => 'Complete 10 materials',                'icon' => 'book-open', 'category' => 'learning', 'trigger_condition' => ['type' => 'total_cards', 'value' => 10]],
    ['id' => 'knowledge_seeker', 'name' => 'Knowledge Seeker',  'description' => 'Complete 50 materials',                'icon' => 'brain',     'category' => 'learning', 'trigger_condition' => ['type' => 'total_cards', 'value' => 50]],
    ['id' => 'quiz_master',      'name' => 'Quiz Master',       'description' => 'Score 100% on 10 quizzes',             'icon' => 'target',    'category' => 'learning', 'trigger_condition' => ['type' => 'perfect_quizzes', 'value' => 10]],
    ['id' => 'hot_streak',       'name' => 'Hot Streak',        'description' => 'Achieve a 30-day streak',              'icon' => 'flame',     'category' => 'streak',   'trigger_condition' => ['type' => 'current_streak', 'value' => 30]],
    ['id' => 'week_warrior',     'name' => 'Week Warrior',      'description' => 'Achieve a 7-day streak',               'icon' => 'flame',     'category' => 'streak',   'trigger_condition' => ['type' => 'current_streak', 'value' => 7]],
    ['id' => 'polymath',         'name' => 'Polymath',          'description' => 'Complete materials in 5+ subjects',     'icon' => 'globe',     'category' => 'learning', 'trigger_condition' => ['type' => 'unique_subjects', 'value' => 5]],
    ['id' => 'perfectionist',    'name' => 'Perfectionist',     'description' => 'Earn 5 Diamond cards',                 'icon' => 'diamond',   'category' => 'learning', 'trigger_condition' => ['type' => 'diamond_cards', 'value' => 5]],
    ['id' => 'focus_master',     'name' => 'Focus Master',      'description' => 'Maintain 95%+ focus integrity 10 times','icon' => 'eye',      'category' => 'learning', 'trigger_condition' => ['type' => 'high_focus_sessions', 'value' => 10]],
    ['id' => 'speed_learner',    'name' => 'Speed Learner',     'description' => 'Complete a session in under 15 minutes','icon' => 'zap',      'category' => 'learning', 'trigger_condition' => ['type' => 'fast_session', 'value' => 1]],
    ['id' => 'night_owl',        'name' => 'Night Owl',         'description' => 'Complete a session after midnight',     'icon' => 'moon',      'category' => 'special',  'trigger_condition' => ['type' => 'night_session', 'value' => 1]],
    ['id' => 'early_bird',       'name' => 'Early Bird',        'description' => 'Complete a session before 6 AM',       'icon' => 'sunrise',   'category' => 'special',  'trigger_condition' => ['type' => 'early_session', 'value' => 1]],
    ['id' => 'knowledge_emperor','name' => 'Knowledge Emperor',  'description' => 'Reach Level 100',                     'icon' => 'crown',     'category' => 'special',  'trigger_condition' => ['type' => 'level', 'value' => 100]],
    ['id' => 'monthly_master',   'name' => 'Monthly Master',    'description' => 'Achieve a 30-day streak',              'icon' => 'trophy',    'category' => 'streak',   'trigger_condition' => ['type' => 'current_streak', 'value' => 30]],
];
```

### AchievementService Methods

```php
class AchievementService
{
    /**
     * Check all achievements and award any newly earned ones.
     * Returns array of newly awarded achievements.
     */
    public function checkAndAward(User $user): array;

    /**
     * Check a specific achievement trigger.
     */
    private function checkTrigger(User $user, array $condition): bool;
}
```

### Trigger Check Logic
```php
private function checkTrigger(User $user, array $condition): bool
{
    return match ($condition['type']) {
        'total_sessions'      => $user->total_sessions >= $condition['value'],
        'total_cards'         => $user->total_knowledge_cards >= $condition['value'],
        'current_streak'      => $user->current_streak >= $condition['value'],
        'level'               => $user->level >= $condition['value'],
        'unique_subjects'     => $user->knowledgeCards()->distinct('subject_category')->count() >= $condition['value'],
        'diamond_cards'       => $user->knowledgeCards()->where('tier', 'Diamond')->count() >= $condition['value'],
        'perfect_quizzes'     => QuizAttempt::where('user_id', $user->id)->where('score_percentage', 100)->count() >= $condition['value'],
        'high_focus_sessions' => LearningSession::where('user_id', $user->id)->where('focus_integrity', '>=', 95)->count() >= $condition['value'],
        // ... other triggers
        default => false,
    };
}
```

---

## 14. Task 10: Frontend Polish

### GenerateCoursePage Enhancements
After tasks 1-9, the GenerateCoursePage already works with real data. Minor additions:

1. **After upload success** → show a status card that transitions from "Processing..." (with spinner) to "Ready!" (with checkmark) using the existing polling mechanism
2. **"Recent Generations" section** → Replace demo data with real data from `contentStore.contents` (already loaded from API)
3. **Click to learn** → Navigate to `/learn/{id}` (Document Dungeon) when content is ready

### ContentLibraryPage Connection
- Already works — shows content grid/list with status badges
- When status is 'ready', clicking Play navigates to `/learn/{id}`
- No changes needed

### DocumentDungeonPage Connection  
- Already has full quest-map → reading → quiz → summary → complete flow
- `sessionStore.startSession(contentId)` creates a backend session
- When Gemini returns real sections + quizzes, the flow will work automatically
- No structural changes needed — just the backend data needs to be real

### Completion Screen
Currently uses local fallback rewards. After Task 8, the backend will return real:
```json
{
  "rewards": {
    "xp_breakdown": [...],
    "total_xp": 145,
    "coins_earned": 28,
    "streak_update": { "current": 5, "is_new_day": true },
    "achievements": [{ "id": "first_steps", "name": "First Steps", "icon": "rocket" }]
  },
  "card": {
    "id": "uuid",
    "title": "...",
    "tier": "Gold",
    "mastery_percentage": 92
  }
}
```

The `sessionStore` is already designed to use this shape. No frontend changes needed.

---

## 15. Environment & Dependencies

### New Composer Packages Required

```bash
# PDF text extraction (pure PHP — no binary dependencies)
composer require smalot/pdfparser

# PPTX text extraction (optional, for P1)
# composer require phpoffice/phppresentation
```

### Config Additions

```php
// config/services.php — add these entries:

'gemini' => [
    'api_key'  => env('GEMINI_API_KEY'),
    'model'    => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
],

'jina' => [
    'api_key' => env('JINA_API_KEY'),
],
```

### .env Variables (Already Present)
```
GEMINI_API_KEY=AIzaSyAvJgzgVwrCUTDa5pTbrJ5pMdDkqukDz5w
GEMINI_MODEL=gemini-2.0-flash
JINA_API_KEY=jina_c7c2399ebe874bc49dd847e20e51311dBc_G6uDl-K8XU9HrE7vnOSoCs28D
```

### Queue Configuration
Currently using `sync` driver (jobs run immediately in-process).
For production: switch to `database` or `redis` driver and run `php artisan queue:work`.

**For development:** `sync` is fine — the user will see a loading state while the job runs.

---

## 16. API Contracts

### Existing Endpoints (No Changes Needed)

#### POST /api/v1/content/upload
- **Input:** `file` (max 20MB, pdf/jpg/png/pptx), `title?` (string)
- **Response:** `201 { data: LearningContent }` (status: 'processing')
- **Side Effect:** Dispatches `AnalyzeContentJob`

#### POST /api/v1/content/url
- **Input:** `url` (required), `title?` (string)
- **Response:** `201 { data: LearningContent }` (status: 'processing')
- **Side Effect:** Dispatches `AnalyzeContentJob`

#### GET /api/v1/content/{id}
- **Response:** `200 { data: LearningContent }` with `status`, `structured_sections`, etc.
- **Used by:** frontend polling (every 3s until status != 'processing')

#### POST /api/v1/sessions/start
- **Input:** `content_id` (uuid)
- **Response:** `200 { data: { session, content } }` — content includes `structured_sections`

#### POST /api/v1/sessions/{id}/quiz-attempt
- **Input:** `section` (int), `answers` (array of { question_index, selected_index })
- **Response:** `200 { data: { score, passed, answers[] } }`

### Modified Endpoint

#### POST /api/v1/sessions/{id}/validate-summary
- **Input:** `summary` (string, min 50, max 5000)
- **Before:** Returns heuristic score
- **After:** Returns Gemini-powered validation:
```json
{
  "data": {
    "score": 78,
    "approved": true,
    "feedback": {
      "completeness": "Good coverage of main concepts. You addressed 4 of 5 key areas.",
      "accuracy": "Your explanations are accurate and well-phrased.",
      "clarity": "Clear and well-structured writing.",
      "missing_concepts": ["Consider mentioning the performance implications"]
    }
  }
}
```

#### POST /api/v1/sessions/{id}/complete
- **Before:** Creates card with placeholder rewards
- **After:** Creates card + awards XP + coins + achievements + streak update:
```json
{
  "data": {
    "card": { "id": "uuid", "title": "...", "tier": "Gold", "mastery_percentage": 92 },
    "rewards": {
      "xp_breakdown": [
        { "label": "Sections complete (5)", "xp": 100 },
        { "label": "Quiz passed", "xp": 30 },
        { "label": "Summary approved", "xp": 25 },
        { "label": "Focus integrity ≥90%", "xp": 15 },
        { "label": "Full material complete", "xp": 100 }
      ],
      "total_xp": 270,
      "level_before": 3,
      "level_after": 4,
      "level_up": true,
      "rank_before": "Seedling",
      "rank_after": "Seedling",
      "rank_up": false,
      "coins_earned": 28,
      "streak_update": { "current": 5, "longest": 5, "is_new_day": true },
      "achievements": [
        { "id": "first_steps", "name": "First Steps", "icon": "rocket" }
      ]
    }
  }
}
```

---

## 17. Gemini Prompt Templates

### Content Analysis Prompt

```
You are an educational content analyst for a learning platform called AETHEREUM.

Your task is to analyze the following learning material and structure it into a comprehensive course.

MATERIAL TYPE: {content_type}
ORIGINAL TITLE: {title}

INSTRUCTIONS:
1. Read the material carefully
2. Identify the main subject area and topic
3. Break the content into 5-7 logical learning sections
4. Each section should have a clear focus and be completable in 5-15 minutes
5. Write rich educational content for each section (not just a summary — expand and explain concepts clearly)
6. Identify key concepts and important terms
7. Determine the difficulty level

MATERIAL TEXT:
---
{raw_text}
---

OUTPUT FORMAT (strict JSON):
{
  "title": "Improved descriptive title",
  "subject_category": "One of: Computer_Science, Mathematics, Physics, Chemistry, Biology, Engineering, Business, Economics, Psychology, Literature, History, Philosophy, Art, Music, Language, Health, General",
  "subject_icon": "A lucide-react icon name (e.g., 'code', 'calculator', 'atom', 'flask', 'dna', 'cog', 'briefcase', 'trending-up', 'brain', 'book-open', 'landmark', 'lightbulb', 'palette', 'music', 'languages', 'heart', 'folder')",
  "subject_color": "#hex color appropriate for the subject",
  "difficulty": "beginner|intermediate|advanced",
  "estimated_duration": total_minutes_integer,
  "keywords": ["keyword1", "keyword2", "...up to 10"],
  "sections": [
    {
      "title": "Section 1 Title",
      "content_text": "Detailed educational content in markdown format. Should be 200-500 words. Include explanations, examples, and key points. Make it engaging and easy to understand.",
      "key_concepts": ["concept1", "concept2", "concept3"],
      "estimated_minutes": 5
    }
  ]
}

RULES:
- Sections MUST be 5-7 in count
- Content text should be EDUCATIONAL, not just a summary — teach the reader
- Use markdown formatting (headers, bold, lists, code blocks where appropriate)
- Language: Match the material's language (Indonesian or English)
- Output ONLY valid JSON, no markdown fences or explanation
```

### Quiz Generation Prompt

```
You are creating quiz questions for an educational learning platform.

SECTION TITLE: {section_title}
DIFFICULTY: {difficulty}

SECTION CONTENT:
---
{section_text}
---

Generate exactly {count} multiple-choice questions based ONLY on the content above.

REQUIREMENTS:
- Questions must be directly answerable from the section content
- Each question has exactly 4 options
- Include 1 correct answer and 3 plausible distractors
- Mix difficulty: 1 easy, 2 medium, 1 hard, 1 tricky
- Write clear, unambiguous questions
- Provide a brief explanation for the correct answer
- Make questions test understanding, not just memorization

OUTPUT FORMAT (strict JSON array):
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why this is correct.",
    "difficulty": "easy|medium|hard"
  }
]

RULES:
- Output ONLY valid JSON array, no markdown fences
- Exactly {count} questions
- correct_index is 0-based (0, 1, 2, or 3)
- Language: Match the section content's language
```

### Summary Validation Prompt

```
You are an educational assessment AI for the AETHEREUM learning platform.

A student has written a summary after studying some material. Evaluate the quality of their summary.

ORIGINAL MATERIAL SECTIONS:
{section_titles_list}

ORIGINAL CONTENT:
---
{original_text_truncated_to_3000_chars}
---

STUDENT'S SUMMARY:
---
{user_summary}
---

Evaluate the summary on these criteria:
1. COMPLETENESS (0-100): Does it cover the main topics and key concepts?
2. ACCURACY (0-100): Is the information factually correct based on the material?
3. CLARITY (0-100): Is it well-written and easy to understand?

Also identify any important concepts that the student missed.

OUTPUT FORMAT (strict JSON):
{
  "score": overall_score_0_to_100,
  "approved": true_if_score_gte_60,
  "feedback": {
    "completeness": "Feedback on coverage...",
    "accuracy": "Feedback on correctness...",
    "clarity": "Feedback on writing quality...",
    "missing_concepts": ["missed concept 1", "missed concept 2"]
  }
}

RULES:
- Be encouraging but honest
- Score fairly — a student who covers 60%+ of key points in clear language should pass
- Output ONLY valid JSON, no markdown fences
- Language: Match the student's language
```

---

## 18. Database Schema Reference

### Tables Used by Generate Course Flow

#### `learning_contents`
```
id (uuid PK), user_id (FK), title, content_type, original_filename,
file_path, source_url, thumbnail_url, estimated_duration, total_pages,
language, ai_analysis (JSONB), structured_sections (JSONB),
subject_category, subject_icon, subject_color, difficulty,
status (processing|ready|failed), error_message, timestamps
```

#### `learning_sessions`
```
id (uuid PK), user_id (FK), content_id (FK), flow_type,
status (active|paused|completed|abandoned),
current_section (int), total_sections (int),
total_focus_time (int seconds), focus_integrity (decimal),
tab_switches (int), distraction_events (int),
quiz_attempts_total (int), quiz_passes (int), quiz_avg_score (decimal),
user_summary (text), summary_score (decimal),
progress_data (JSONB), metadata (JSONB),
started_at, completed_at, timestamps
```

#### `quizzes`
```
id (uuid PK), content_id (FK), section_index (int),
questions (JSONB), question_count (int),
difficulty, time_limit_seconds, pass_threshold,
timestamps
```

#### `quiz_attempts`
```
id (uuid PK), quiz_id (FK), user_id (FK), session_id (FK),
answers (JSONB), correct_count (int), total_questions (int),
score_percentage (decimal), passed (bool), time_taken_seconds (int),
timestamps
```

#### `knowledge_cards`
```
id (uuid PK), user_id (FK), content_id (FK), session_id (FK),
title, subject_category, subject_icon, subject_color,
mastery_percentage (int 0-100), quiz_avg_score, focus_integrity,
time_invested (int), tier (Bronze|Silver|Gold|Diamond),
summary_snippet (text), keywords (JSONB),
is_pinned (bool), is_public (bool), likes (int),
is_collaborative (bool), collaborators (JSONB),
last_reviewed_at, integrity_decay_rate, timestamps
```

#### `xp_events`
```
id (uuid PK), user_id (FK), xp_amount (int), source (string),
description (text), session_id (FK nullable),
level_before, level_after, xp_before, xp_after,
created_at
```

#### `user_wallets`
```
id (uuid PK), user_id (FK unique), current_balance (int),
total_earned (int), total_spent (int),
daily_earned (int), daily_cap (500), daily_reset_at,
created_at, updated_at
```

#### `coin_transactions`
```
id (uuid PK), wallet_id (FK), amount (int), type (earn|spend),
source (string), description (text), balance_after (int),
created_at
```

#### `achievements`
```
id (string PK), name, description, icon, category,
trigger_condition (JSONB)
```

#### `user_achievements`
```
id (uuid PK), user_id (FK), achievement_id (FK),
awarded_at, is_featured (bool)
UNIQUE(user_id, achievement_id)
```

---

## 19. Testing Checklist

### E2E Happy Path
- [ ] Upload PDF → processing status shown → polling detects ready → content shows in library
- [ ] Upload YouTube URL → same flow as above
- [ ] Upload article URL → same flow as above
- [ ] Content has real sections (5-7) from AI analysis
- [ ] Each section has meaningful educational content
- [ ] Start learning → quest map shows all sections
- [ ] Read section → focus timer works → tab switch detected
- [ ] Quiz questions are relevant to section content
- [ ] Pass quiz (≥70%) → section marked completed
- [ ] Fail quiz → 5 min cooldown → can retry
- [ ] Complete all sections → summary screen
- [ ] Submit summary → AI validation scores it
- [ ] Approved summary → complete session
- [ ] Knowledge Card created with correct tier
- [ ] XP awarded (check user.xp increased)
- [ ] Level up triggers correctly
- [ ] Coins awarded (check wallet balance)
- [ ] Achievement awarded (first_steps on first completion)
- [ ] Streak updated
- [ ] Completion screen shows all rewards

### Error Cases
- [ ] Upload unsupported file type → validation error
- [ ] Upload file >20MB → validation error
- [ ] Invalid URL → validation error
- [ ] Gemini API timeout → content marked 'failed' with error message
- [ ] Gemini returns invalid JSON → retry once, then fallback
- [ ] Empty PDF (no text) → meaningful error message
- [ ] YouTube video with no captions → fallback to Jina
- [ ] Network error during processing → can re-process

### Edge Cases
- [ ] Very long PDF (100+ pages) → text truncated, still produces good sections
- [ ] Very short content (1 paragraph) → still creates 3+ sections
- [ ] Non-English content → AI handles Indonesian/other languages
- [ ] Duplicate upload of same file → creates separate content (allowed)
- [ ] Daily coin cap (500) → excess coins not awarded, error not shown

---

## 20. Risk & Fallback Strategy

### Risk: Gemini API Downtime / Rate Limit
**Mitigation:**
- Queue jobs with retry (3 attempts, 30s backoff)
- If all retries fail → set status='failed' with clear user message
- User can retry from library (delete + re-upload)
- In development: env var `GEMINI_MOCK=true` to use mock data

### Risk: PDF Extraction Fails (Scanned PDF)
**Mitigation:**
- Detect empty text extraction
- Set error_message: "Could not extract text. This may be a scanned document."
- Future: integrate OCR (Tesseract or Gemini Vision)

### Risk: YouTube Captions Unavailable
**Mitigation:**
- Primary: YouTube captions XML endpoint
- Fallback 1: Jina Reader to get video page metadata
- Fallback 2: Gemini with just the video title + description
- Set clear error if all fail

### Risk: Large Gemini Response Time
**Mitigation:**
- Use queue (async processing)
- Frontend shows "Processing" with spinner
- Polling every 3s already handles the wait
- Typical Gemini response: 3-10 seconds for content analysis
- Set HTTP timeout to 60s for Gemini calls

### Risk: Gemini Returns Bad JSON
**Mitigation:**
- Use `responseMimeType: "application/json"` in Gemini config
- Parse with `json_decode()` + validate required keys
- If invalid → retry once with stricter prompt
- If still invalid → fail with error message

### Risk: Daily Free Tier Limit (1500 requests)
**Mitigation:**
- Each content upload = ~1 analysis + 5-7 quiz generations = ~8 API calls
- Daily limit = ~180 content uploads per day (plenty for development/demo)
- Monitor usage in logs
- For competition: well within limits

---

## Implementation Order Summary

```
 WEEK 1 (CORE):
 ├── Day 1: Install smalot/pdfparser + create GeminiService
 ├── Day 2: Create ContentExtractorService (PDF, YouTube, Jina)
 ├── Day 3: Rewrite AnalyzeContentJob (real extraction + Gemini)
 ├── Day 4: Rewrite GenerateQuizJob + QuizGeneratorService (real quizzes)
 └── Day 5: AI summary validation + test full upload→learn flow

 WEEK 2 (REWARDS):
 ├── Day 1: KnowledgeProfileService (XP, level, rank)
 ├── Day 2: CoinEconomyService (wallet, daily cap)
 ├── Day 3: AchievementService + AchievementSeeder
 ├── Day 4: Wire everything into ProcessKnowledgeCardJob
 └── Day 5: Full E2E testing + bug fixes
```
