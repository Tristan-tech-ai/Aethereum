<?php

namespace App\Jobs;

use App\Models\LearningContent;
use App\Services\ContentExtractorService;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 180; // 3 minutes for AI analysis

    public function __construct(
        public LearningContent $learningContent
    ) {}

    public function handle(): void
    {
        $content = $this->learningContent;

        Log::info("AnalyzeContentJob started for {$content->id} (type: {$content->content_type})");

        try {
            // ─── Step 1: Extract raw text ───
            $extractor = app(ContentExtractorService::class);

            $rawText = match ($content->content_type) {
                'pdf'     => $extractor->extractFromPdf($content->file_path),
                'youtube' => $extractor->extractFromYoutube($content->source_url)['text'],
                'article' => $extractor->extractFromArticle($content->source_url),
                'image'   => $extractor->extractFromImage($content->file_path ?? ''),
                'pptx'    => $extractor->extractFromPdf($content->file_path), // smalot handles pptx-like
                default   => throw new \RuntimeException("Unsupported content type: {$content->content_type}"),
            };

            if (empty(trim($rawText))) {
                throw new \RuntimeException('No text could be extracted from this content.');
            }

            // ─── Step 2: AI analysis via Gemini ───
            $gemini   = app(GeminiService::class);
            $analysis = $gemini->analyzeContent($rawText, $content->content_type, $content->title);

            $sections = $analysis['sections'] ?? [];
            if (empty($sections)) {
                throw new \RuntimeException('Gemini returned no sections for this content.');
            }

            // Ensure each section has an id
            foreach ($sections as $i => &$section) {
                $section['id'] ??= 'sec_' . ($i + 1);
            }
            unset($section);

            // ─── Step 3: Persist ───
            $content->update([
                'title'               => $analysis['title'] ?? $content->title,
                'ai_analysis'         => $analysis,
                'structured_sections' => $sections,
                'subject_category'    => $analysis['subject_category'] ?? $content->subject_category,
                'subject_icon'        => $analysis['subject_icon'] ?? $content->subject_icon,
                'subject_color'       => $analysis['subject_color'] ?? $content->subject_color,
                'difficulty'          => $analysis['difficulty'] ?? 'intermediate',
                'estimated_duration'  => $analysis['estimated_duration'] ?? null,
                'status'              => 'ready',
                'error_message'       => null,
            ]);

            Log::info("AnalyzeContentJob completed for {$content->id}", [
                'sections' => count($sections),
                'title'    => $analysis['title'] ?? $content->title,
            ]);

            // ─── Step 4: Generate quizzes for each section ───
            foreach ($sections as $index => $section) {
                GenerateQuizJob::dispatch($content->fresh(), $index, $section);
            }

        } catch (\Throwable $e) {
            Log::error("AnalyzeContentJob failed for {$content->id}: " . $e->getMessage());
            $content->update([
                'status'        => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 500),
            ]);
            throw $e;
        }
    }
}
