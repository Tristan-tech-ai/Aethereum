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

    public $learningContent;

    /**
     * Create a new job instance.
     */
    public function __construct(LearningContent $learningContent)
    {
        $this->learningContent = $learningContent;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("AnalyzeContentJob started for Content ID: {$this->learningContent->id}");

            // 1. Update status to processing
            $this->learningContent->update(['status' => 'processing']);

            // 2. Simulate AI processing latency
            sleep(3); 

            // 3. Mock data representing structured sections from an LLM
            $mockStructuredSections = [
                [
                    'id' => 'sec_'.uniqid(),
                    'title' => 'Pengenalan Konsep (Mock)',
                    'content_text' => 'Ini adalah teks bagian pengenalan. Dalam versi asli, Gemini akan membaca PDF/URL dan merangkumnya menjadi paragraf-paragraf yang mudah dicerna di sini. Bagian ini penting untuk pondasi belajar.',
                    'estimated_minutes' => 5,
                ],
                [
                    'id' => 'sec_'.uniqid(),
                    'title' => 'Studi Kasus & Teori (Mock)',
                    'content_text' => 'Di sini berisi studi kasus lanjutan atau teori inti dari materi. Mocking ini memastikan UI frontend sudah bisa merender array JSON sections dengan mulus.',
                    'estimated_minutes' => 8,
                ],
                [
                    'id' => 'sec_'.uniqid(),
                    'title' => 'Kesimpulan Pendek (Mock)',
                    'content_text' => 'Bagian penutup dari materi. Anda telah menyelesaikan sesi belajar ini.',
                    'estimated_minutes' => 3,
                ],
            ];

            // 4. Save mock data and set status to ready
            $this->learningContent->update([
                'structured_sections' => $mockStructuredSections,
                'status' => 'ready',
            ]);

            Log::info("AnalyzeContentJob completed successfully for Content ID: {$this->learningContent->id}");

        } catch (\Throwable $e) {
            Log::error("AnalyzeContentJob failed for Content ID: {$this->learningContent->id}. Error: " . $e->getMessage());
            $this->learningContent->update(['status' => 'failed']);
            throw $e;
        }
    }
}
