<?php

namespace App\Jobs;

use App\Models\LearningContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public LearningContent $content
    ) {}

    /**
     * Execute the job.
     *
     * Placeholder — actual AI analysis will be implemented later.
     * For now this just marks the content as ready.
     */
    public function handle(): void
    {
        Log::info("AnalyzeContentJob started for content: {$this->content->id}");

        // TODO: Implement actual Gemini AI analysis here.
        // For now, mark the content as ready so the rest of the pipeline works.
        $this->content->update([
            'status' => 'ready',
        ]);

        Log::info("AnalyzeContentJob completed for content: {$this->content->id}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("AnalyzeContentJob failed for content: {$this->content->id}", [
            'error' => $exception->getMessage(),
        ]);

        $this->content->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
}
