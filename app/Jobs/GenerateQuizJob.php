<?php

namespace App\Jobs;

use App\Models\LearningContent;
use App\Models\Quiz;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateQuizJob implements ShouldQueue
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
            Log::info("GenerateQuizJob started for Content ID: {$this->learningContent->id}");

            // 1. Simulate AI Quiz Generation latency
            sleep(2);

            // 2. Mock Quiz JSON structure
            // Using placeholder logic similar to what we built in QuizGeneratorService
            $mockQuestions = [
                [
                    'id' => 'q_'.uniqid(),
                    'question' => 'Apa tujuan utama dari mock sistem ini?',
                    'options' => [
                        'A' => 'Untuk mempersulit frontend',
                        'B' => 'Untuk mensimulasikan respons AI tanpa memanggil API aslinya',
                        'C' => 'Untuk membuat error',
                        'D' => 'Tidak ada tujuan'
                    ],
                    'correct_answer' => 'B',
                    'explanation' => 'Mocking memungkinkan development terus berjalan di frontend maupun backend meskipun service eksternal belum siap.'
                ],
                [
                    'id' => 'q_'.uniqid(),
                    'question' => 'Berapa jumlah section dummy yang dibuat oleh AnalyzeContentJob?',
                    'options' => [
                        'A' => '1',
                        'B' => '2',
                        'C' => '3',
                        'D' => '4'
                    ],
                    'correct_answer' => 'C',
                    'explanation' => 'AnalyzeContentJob membuat 3 buah mock section (Pengenalan, Studi Kasus, Kesimpulan).'
                ]
            ];

            // 3. Store in database
            // Create a quiz record linked to this content
            Quiz::create([
                'learning_content_id' => $this->learningContent->id,
                'questions' => $mockQuestions,
                'difficulty' => 'medium',
                'time_limit_seconds' => 120,
            ]);

            Log::info("GenerateQuizJob completed successfully for Content ID: {$this->learningContent->id}");

        } catch (\Throwable $e) {
            Log::error("GenerateQuizJob failed for Content ID: {$this->learningContent->id}. Error: " . $e->getMessage());
            throw $e;
        }
    }
}
