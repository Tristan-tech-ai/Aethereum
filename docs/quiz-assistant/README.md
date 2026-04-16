# Nexera Quiz Assistant Module

Module ini bertugas untuk menangani percakapan chatbot interaktif yang dapat memandu user membuat, mengevaluasi, dan mereview *Quiz* secara seamless.

## 1. Arsitektur Overview

Sistem bekerja berdasarkan transisi state (State Machine) melalui service orchestrator dan controller.

```text
User Message -> [ AssistantOrchestratorService ] -> (Intent == 'quiz') -> [ QuizConfigurationFlowService ]
                                                                                   | (State saved to DB)
                                                                                   v
User clicks 'Mulai' -> [ QuizAssistantController@generateSession ] -> [ QuizAssistantAdapter@createSession ] --> Returns Quiz URL
                                                                                   |
User answers quiz -> [ QuizAssistantController@submitQuiz ] -> [ QuizAssistantAdapter@evaluateSession ]
                           |
                           v
           [ QuizResultAnalyzerService ] ---> Calculates Mastery Level & Weak Topics
                           |
                           v
          [ QuizFeedbackGeneratorService ] -> Generates AI Follow-up Feedback + CTA Buttons
```

## 2. State Machine Phases

`intent` -> `material` -> `section` -> `count` -> `type` -> `difficulty` -> `confirm` -> `quiz_active` -> `completed`

- **intent**: Mendeteksi apa keinginan user.
- **material**: Mencari topik rekomendasi atau dari input.
- **section**: Memilih bagian (bab) mana yang mau diujikan.
- **count, type, difficulty**: Detail metrik soal yang mau digenerate.
- **confirm**: Rekapan sebelum sesi dimulai.
- **quiz_active**: Menunggu soal selesai disubmit dari frontend.
- **completed**: Quiz selesai, feedback sudah masuk di chat.

## 3. Endpoints

Semua endpoint diawali dengan base URL `/api/v1/assistant/`.

### `POST /chat/message`
Request:
```json
{
  "conversation_id": "uuid",
  "message": "aku mau latihan soal dong"
}
```
Response: (Pesan configurasi atau balasan chat)

### `POST /quiz/generate`
Membentuk sesi aktif setelah `confirm`.
Request: `{ "conversation_id": "uuid" }`
Response: `{ "success": true, "data": { "quiz_url": "...", "quiz_session_id": "..." } }`

### `POST /quiz/{sessionId}/submit`
Memasukkan nilai akhir dari frontend.
Request:
```json
{
  "conversation_id": "uuid",
  "answers": [ { "question_id": 0, "answer": "1", "time_taken_ms": 2000 } ]
}
```
Response: `{ "success": true, "data": { "score": 80, "feedback_text": "...", "mastery_level": "good" } }`

### `POST /quiz/config/reset`
Request: `{ "conversation_id": "uuid" }`

### `GET /quiz/{sessionId}`
Membaca state dan data lengkap dari session.

### `POST /quiz/{sessionId}/pause` & `POST /quiz/{sessionId}/resume`
Menjeda dan melanjutkannya di hari lain (dibatasi 24 jam).

## 4. Cara Menjalankan Cleanup Command Manual

Expired session (lewat dari 24 jam) dibersihkan secara otomatis via schedule, namun juga dapat dibersihkan paksa:

```bash
php artisan assistant:cleanup-sessions
```

## 5. Cara Membaca Daily Metrics

Metrics ditampung di Laravel Cache dengan key spesifik (Contoh: `qametric:quizzes_started:2023-10-10`).
Kamu dapat meread full recap dengan memanggil Service secara manual via Tinker:

```php
$metrics = app(\App\Services\QuizAssistantMetricsService::class)->getDailyStats('2023-10-10');
dump($metrics);
```

## 6. Edge Cases Handled
1. **Timeout AI Generasi Soal**: Dicatch oleh `QuizGenerationException` dan mereturn HTTP 422 untuk UX fallback, meminta request soal ulang yang lebih ringan.
2. **Expired Access**: Otomatis tertangani oleh middleware `ValidateQuizSessionOwnership`. Respons standar adalah HTTP 410 (Gone).
3. **Validasi State**: Jika `/generate` dipanggil di luar fase 'confirm' atau 'quiz_active', `InvalidConversationStateException` otomatis bekerja.
4. **AI Generation Feedback Gagal**: Akan switch secara *seamless* ke *fallback feedback* bawaan sesuai `mastery_level`.
