<?php

namespace App\Jobs;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateQuizJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 60;

    public function __construct(
        public LearningContent $learningContent,
        public int $sectionIndex,
        public array $sectionData,
    ) {}

    public function handle(): void
    {
        $content = $this->learningContent;

        // Skip if quiz already exists for this section
        if (Quiz::where('content_id', $content->id)
                ->where('section_index', $this->sectionIndex)
                ->exists()) {
            return;
        }

        $sectionTitle = $this->sectionData['title'] ?? "Section " . ($this->sectionIndex + 1);
        $sectionText  = $this->sectionData['content_text'] ?? '';
        $difficulty   = $content->difficulty ?? 'medium';

        Log::info("GenerateQuizJob started for content {$content->id}, section {$this->sectionIndex}");

        try {
            $gemini    = app(GeminiService::class);
            $questions = $gemini->generateQuiz($sectionText, $sectionTitle, $difficulty, 5);

            Quiz::create([
                'content_id'         => $content->id,
                'section_index'      => $this->sectionIndex,
                'questions'          => $questions,
                'question_count'     => count($questions),
                'difficulty'         => $difficulty,
                'time_limit_seconds' => 120,
                'pass_threshold'     => 70,
            ]);

            Log::info("GenerateQuizJob completed for content {$content->id}, section {$this->sectionIndex}", [
                'questions' => count($questions),
            ]);

        } catch (\Throwable $e) {
            Log::error("GenerateQuizJob failed for content {$content->id}, section {$this->sectionIndex}: " . $e->getMessage());
            throw $e;
        }
    }
}