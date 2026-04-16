<?php

namespace App\Services;

class QuizConfigurationFlowService
{
    public function __construct(
        protected QuizIntentDetectorService $intentDetector,
        protected MaterialRecommendationService $materialRecommendation
    ) {}

    public function handleIntent(array $state, string $message, $userId): array
    {
        // First check intent. If it's already past intent, we don't call this.
        // But the router handles that.
        $intent = $this->intentDetector->detect($message);
        
        if ($intent === 'quiz_request') {
            $hint = $this->intentDetector->extractTopicHint($message);
            $payload = $state['payload'] ?? [];
            
            if ($hint) {
                $contents = $this->materialRecommendation->findByHint($hint, $userId);
                
                // Fallback to general relevant materials if hint-based search found nothing
                if ($contents->isEmpty()) {
                    $contents = $this->materialRecommendation->findRelevantForUser($userId);
                }
            } else {
                $contents = $this->materialRecommendation->findRelevantForUser($userId);
            }


            if ($contents->isEmpty()) {
                return [
                    'message' => 'Aku tidak menemukan materi yang sesuai. Silakan sebutkan topik lain atau pilih dari daftar materimu.',
                    'ui_type' => 'text',
                    'options' => null,
                    'next_phase' => 'material',
                    'payload_update' => [],
                    'is_terminal' => false,
                ];
            }

            $options = $contents->map(fn ($content) => [
                'label' => $content->title,
                'value' => $content->id,
            ])->toArray();

            return [
                'message' => 'Sip, mau latihan soal! Pilih materi yang ingin dipelajari:',
                'ui_type' => 'chips',
                'options' => $options,
                'next_phase' => 'material',
                'payload_update' => [],
                'is_terminal' => false,
            ];
        }

        // Default or unhandled
        return [
            'message' => 'Maaf, aku kurang paham. Apakah kamu ingin latihan soal?',
            'ui_type' => 'text',
            'options' => null,
            'next_phase' => 'intent',
            'payload_update' => [],
            'is_terminal' => false,
        ];
    }

    public function handleMaterial(array $state, string $userInput, $userId): array
    {
        // They either send a content ID string (uuid) or text
        $content = $this->materialRecommendation->validateContentId($userInput);

        if ($content && $content->user_id === $userId) { // Secure check
            $sections = $this->materialRecommendation->getSectionsFromContent($content);

            $options = [
                ['label' => 'Semua Bagian', 'value' => 'semua']
            ];

            foreach ($sections as $section) {
                $options[] = [
                    'label' => $section['title'],
                    'value' => (string) $section['index'],
                ];
            }

            return [
                'message' => 'Mantap! Mau bahas bagian mana dari materi ini?',
                'ui_type' => 'chips',
                'options' => $options,
                'next_phase' => 'section',
                'payload_update' => [
                    'content_id' => $content->id,
                    'content_title' => $content->title,
                ],
                'is_terminal' => false,
            ];
        }

        // If not a valid content string, treat as free text search
        $contents = $this->materialRecommendation->findByHint($userInput, $userId);

        if ($contents->isEmpty()) {
            return [
                'message' => 'Maaf, materi tidak ditemukan. Coba ketik judul yang lain?',
                'ui_type' => 'text',
                'options' => null,
                'next_phase' => 'material',
                'payload_update' => [],
                'is_terminal' => false,
            ];
        }

        $options = $contents->map(fn ($content) => [
            'label' => $content->title,
            'value' => $content->id,
        ])->toArray();

        return [
            'message' => 'Mungkin materi ini yang kamu maksud?',
            'ui_type' => 'chips',
            'options' => $options,
            'next_phase' => 'material',
            'payload_update' => [],
            'is_terminal' => false,
        ];
    }

    public function handleSection(array $state, string $userInput): array
    {
        $sectionIndex = null;
        if (strtolower(trim($userInput)) !== 'semua' && is_numeric($userInput)) {
            $sectionIndex = (int) $userInput;
        }

        return [
            'message' => 'Berapa jumlah soal yang ingin kamu kerjakan?',
            'ui_type' => 'chips',
            'options' => [
                ['label' => '5', 'value' => '5'],
                ['label' => '10', 'value' => '10'],
                ['label' => '15', 'value' => '15'],
                ['label' => '20', 'value' => '20'],
                ['label' => 'Custom', 'value' => 'custom'],
            ],
            'next_phase' => 'count',
            'payload_update' => [
                'section_index' => $sectionIndex,
            ],
            'is_terminal' => false,
        ];
    }

    public function handleCount(array $state, string $userInput): array
    {
        if (strtolower($userInput) === 'custom') {
            return [
                'message' => 'Silakan ketik angka jumlah soal yang kamu inginkan (3 - 30).',
                'ui_type' => 'text',
                'options' => null,
                'next_phase' => 'count',
                'payload_update' => [],
                'is_terminal' => false,
            ];
        }

        $count = $this->parseCountInput($userInput);
        if ($count < 3 || $count > 30) {
            return [
                'message' => 'Jumlah soal harus antara 3 dan 30. Berapa soal yang ingin dikerjakan?',
                'ui_type' => 'text',
                'options' => null,
                'next_phase' => 'count',
                'payload_update' => [],
                'is_terminal' => false,
            ];
        }

        return [
            'message' => 'Pilih tipe soal yang kamu suka:',
            'ui_type' => 'chips',
            'options' => [
                ['label' => 'Pilihan Ganda', 'value' => 'multiple_choice'],
                ['label' => 'Benar/Salah', 'value' => 'true_false'],
                ['label' => 'Campuran', 'value' => 'mixed'],
            ],
            'next_phase' => 'type',
            'payload_update' => [
                'count' => $count,
            ],
            'is_terminal' => false,
        ];
    }

    public function handleType(array $state, string $userInput): array
    {
        $type = $this->mapTypeInput($userInput);

        return [
            'message' => 'Terakhir, pilih tingkat kesulitan quiz:',
            'ui_type' => 'chips',
            'options' => [
                ['label' => 'Mudah', 'value' => 'easy'],
                ['label' => 'Sedang', 'value' => 'medium'],
                ['label' => 'Sulit', 'value' => 'hard'],
                ['label' => 'Adaptif', 'value' => 'adaptive'],
            ],
            'next_phase' => 'difficulty',
            'payload_update' => [
                'type' => $type,
            ],
            'is_terminal' => false,
        ];
    }

    public function handleDifficulty(array $state, string $userInput): array
    {
        $difficulty = $this->mapDifficultyInput($userInput);
        
        $payload = array_merge($state['payload'] ?? [], ['difficulty' => $difficulty]);
        $summary = $this->buildConfigSummary($payload);

        return [
            'message' => "Sip! Konfigurasi quiz sudah siap.\n\n{$summary}\n\nSudah pas belum?",
            'ui_type' => 'buttons',
            'options' => [
                ['label' => 'Mulai Quiz', 'value' => 'confirm'],
                ['label' => 'Ubah Konfigurasi', 'value' => 'ubah'],
            ],
            'next_phase' => 'confirm',
            'payload_update' => [
                'difficulty' => $difficulty,
            ],
            'is_terminal' => false,
        ];
    }

    public function handleConfirm(array $state, string $userInput): array
    {
        $input = strtolower(trim($userInput));

        if ($input === 'confirm' || $input === 'mulai' || $input === 'mulai quiz' || $input === 'ya') {
            return [
                'message' => 'Quiz dimulai! Semoga berhasil! 🚀',
                'ui_type' => 'text',
                'options' => null,
                'next_phase' => 'quiz_active',
                'payload_update' => [],
                'is_terminal' => true,
            ];
        }

        // Ubah konfigurasi
        return [
            'message' => 'Oke, kita sesuaikan lagi ya. Mau bahas bagian mana dari materi ini?',
            'ui_type' => 'chips',
            'options' => [
                ['label' => 'Semua Bagian', 'value' => 'semua'],
                ['label' => 'Bagian Lain', 'value' => 'pilih_ulang'],
            ],
            'next_phase' => 'section',
            'payload_update' => [],
            'is_terminal' => false,
        ];
    }

    public function handleTimeout(array $state): array
    {
        $payload = $state['payload'] ?? [];
        $payloadUpdate = [];

        if (!isset($payload['section_index']) && !array_key_exists('section_index', $payload)) {
            $payloadUpdate['section_index'] = null;
        }
        if (!isset($payload['count'])) {
            $payloadUpdate['count'] = 10;
        }
        if (!isset($payload['type'])) {
            $payloadUpdate['type'] = 'multiple_choice';
        }
        if (!isset($payload['difficulty'])) {
            $payloadUpdate['difficulty'] = 'medium';
        }

        $mergedPayload = array_merge($payload, $payloadUpdate);
        $summary = $this->buildConfigSummary($mergedPayload);

        return [
            'message' => "Karena tidak ada respon, aku pakai konfigurasi default ya.\n\n{$summary}\n\nMau mulai sekarang?",
            'ui_type' => 'buttons',
            'options' => [
                ['label' => 'Mulai Quiz', 'value' => 'confirm'],
                ['label' => 'Ubah Konfigurasi', 'value' => 'ubah'],
            ],
            'next_phase' => 'confirm',
            'payload_update' => $payloadUpdate,
            'is_terminal' => false,
        ];
    }

    private function parseCountInput(string $input): int
    {
        $input = strtolower(trim($input));
        $map = [
            'tiga' => 3, 'empat' => 4, 'lima' => 5, 'enam' => 6,
            'tujuh' => 7, 'delapan' => 8, 'sembilan' => 9, 'sepuluh' => 10,
            'sebelas' => 11, 'dua belas' => 12, 'lima belas' => 15, 'dua puluh' => 20
        ];

        if (isset($map[$input])) {
            return $map[$input];
        }

        preg_match('/\d+/', $input, $matches);
        if (!empty($matches[0])) {
            return (int) $matches[0];
        }

        return 10; // default
    }

    private function mapTypeInput(string $input): string
    {
        $input = strtolower(trim($input));
        if (in_array($input, ['true_false', 'benar salah', 'benar/salah'])) return 'true_false';
        if (in_array($input, ['mixed', 'campuran', 'campur'])) return 'mixed';
        return 'multiple_choice';
    }

    private function mapDifficultyInput(string $input): string
    {
        $input = strtolower(trim($input));
        if (in_array($input, ['easy', 'mudah'])) return 'easy';
        if (in_array($input, ['hard', 'sulit', 'susah'])) return 'hard';
        if (in_array($input, ['adaptive', 'adaptif'])) return 'adaptive';
        return 'medium';
    }

    private function buildConfigSummary(array $payload): string
    {
        $title = $payload['content_title'] ?? 'Materi Tidak Diketahui';
        $section = isset($payload['section_index']) ? "Bagian " . ($payload['section_index'] + 1) : 'Semua Bagian';
        $count = $payload['count'] ?? 10;
        
        $typeLbl = match($payload['type'] ?? 'multiple_choice') {
            'true_false' => 'Benar/Salah',
            'mixed' => 'Campuran',
            default => 'Pilihan Ganda',
        };

        $diffLbl = match($payload['difficulty'] ?? 'medium') {
            'easy' => 'Mudah',
            'hard' => 'Sulit',
            'adaptive' => 'Adaptif',
            default => 'Sedang',
        };

        return "📚 Materi: {$title}\n📑 Bagian: {$section}\n📝 Jumlah: {$count} Soal\n⚙️ Tipe: {$typeLbl}\n📈 Kesulitan: {$diffLbl}";
    }
}
