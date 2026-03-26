# Analisis Kebutuhan Realisasi Nexera Assistenten

> **Tanggal**: 25 Maret 2026  
> **Project**: AETHEREUM (Nexera)  
> **Status Dokumen**: Analisis Lengkap (siap dijadikan baseline implementasi)

---

## 1) Ringkasan Eksekutif

`Nexera Assistant` saat ini **belum terimplementasi secara fungsional**. Di codebase, fitur ini baru muncul sebagai elemen UI statis pada sidebar (`frontend/src/components/layout/Sidebar.jsx`) tanpa route, tanpa halaman, tanpa API khusus, dan tanpa alur backend untuk percakapan/asisten.

Namun fondasi platform untuk membangun asisten sudah cukup kuat:
- Sudah ada AI service inti (`app/Services/GeminiService.php`) untuk analisis konten, generate quiz, dan validasi ringkasan.
- Sudah ada data learning yang kaya (`learning_contents`, `learning_sessions`, `knowledge_cards`, social modes).
- Sudah ada autentikasi, API modular, dan state management frontend.

Kesimpulan: realisasi Nexera Assistenten paling efektif dilakukan dengan pendekatan **Contextual Learning Assistant** (asisten belajar berbasis konteks data user), bukan chatbot generik.

---

## 2) Temuan Kondisi Existing (As-Is)

## 2.1 UI/Frontend
- Terdapat label `Nexera Assistant` di sidebar, tetapi belum clickable ke alur nyata.
- Belum ditemukan komponen chat/assistant/page dedicated.
- Belum ada store khusus assistant.

## 2.2 Backend/API
- `routes/api.php` belum memiliki namespace endpoint assistant (mis. `/v1/assistant/*`).
- `GeminiService` sudah punya kemampuan:
  - `analyzeContent(...)`
  - `generateQuiz(...)`
  - `validateSummary(...)`
- Belum ada controller/service orkestrasi percakapan multi-turn.

## 2.3 Data Layer
- Belum ada tabel untuk conversation, message, memory, tool-call log, atau user preference asisten.
- Data belajar user sudah sangat kaya dan bisa dijadikan context retrieval.

## 2.4 Dokumentasi Produk
- PRD section AI berfokus pada content intelligence, bukan chat assistant penuh.
- Checklist masih mencantumkan `AI-powered study plan generator` sebagai future enhancement.

---

## 3) Definisi Produk yang Direkomendasikan

Agar selaras dengan visi AETHEREUM, **Nexera Assistenten** sebaiknya didefinisikan sebagai:

> **Asisten belajar personal yang membantu user merencanakan, menjalankan, dan mengevaluasi proses belajar berdasarkan data progres nyata di Nexera.**

Bukan sekadar Q&A umum, melainkan:
1. **Planner**: menyusun rencana belajar harian/mingguan.
2. **Coach**: memberi arahan saat sesi berjalan (fokus, section berikutnya, tips quiz).
3. **Reviewer**: memberi umpan balik setelah sesi (progress, weak area, rekomendasi next action).
4. **Companion**: menjawab pertanyaan terkait materi yang sedang dipelajari.

---

## 4) Kebutuhan Fungsional (Functional Requirements)

## 4.1 Core Use Cases (Wajib MVP)
1. **Generate Study Plan**
   - Input: goal user (mis. ujian, topik), durasi target, waktu harian.
   - Output: rencana terstruktur (hari, sesi, materi, estimasi waktu, milestone).
2. **Ask About Current Learning Content**
   - User bertanya tentang materi yang sedang dipelajari.
   - Assistant menjawab berbasis context dari `structured_sections` dan progress session.
3. **Session Guidance**
   - Saat user aktif belajar, assistant memberi next step:
     - section berikutnya
     - checkpoint quiz
     - pengingat fokus
4. **Progress Reflection**
   - Assistant menjelaskan performa user dari data nyata:
     - focus integrity
     - quiz avg
     - streak
     - knowledge card tier trend

## 4.2 Secondary Use Cases (P1)
1. **Adaptive Recommendation**
   - Rekomendasi konten/aktivitas sosial (duel/raid/challenge) berdasarkan weakness area.
2. **Quiz Remediation Coach**
   - Menjelaskan kenapa jawaban salah, dan langkah perbaikan.
3. **Goal Tracking Dialogue**
   - Assistant memantau target mingguan dan memberi nudges.

## 4.3 Nice to Have (P2)
1. Voice input/output.
2. Persona mode (strict coach, friendly coach, exam mode).
3. Multi-language dynamic adaptation.

---

## 5) Kebutuhan UX/UI

## 5.1 Information Architecture
Tambahkan 3 entry point:
1. **Sidebar Assistant Button** → membuka `Assistant Panel`.
2. **Contextual Entry in Learning View** → “Ask Nexera” saat baca section.
3. **Profile/Tasks Assistant Widget** → “Plan my week”.

## 5.2 Interface Pattern
- **MVP direkomendasikan**: right-side drawer/panel (bukan halaman terpisah penuh), agar mudah dipanggil dari semua konteks.
- Struktur panel:
  - Header: mode/context aktif
  - Conversation list
  - Suggested prompts
  - Composer input
  - Quick actions (`Buat rencana`, `Evaluasi progres`, `Bantu section ini`)

## 5.3 UX States
- Empty state (first-time onboarding prompts)
- Loading/thinking state (streaming response)
- Error state (rate limit/downstream AI failure)
- Safety state (pertanyaan di luar scope → redirect ke mode edukasi)

## 5.4 Interaction Requirements
- Enter untuk kirim, Shift+Enter newline
- Retry response
- Copy response
- Pin insight ke “Task reminder” atau “Learning notes” (P1)

---

## 6) Kebutuhan Arsitektur Backend

## 6.1 Komponen Baru
1. **AssistantController** (`app/Http/Controllers/Api/AssistantController.php`)
2. **AssistantOrchestratorService**
3. **AssistantContextService** (mengambil context user/session/content)
4. **AssistantSafetyService** (policy guardrails)
5. **AssistantPromptBuilderService**

## 6.2 Endpoint API yang Dibutuhkan
Prefix: `/api/v1/assistant`

### MVP Endpoints
1. `POST /chat`
   - Kirim pesan user, return jawaban assistant.
2. `POST /study-plan/generate`
   - Generate rencana belajar personal.
3. `GET /conversations`
   - List conversation milik user.
4. `GET /conversations/{id}`
   - Ambil message history.
5. `POST /conversations/{id}/messages`
   - Lanjutkan percakapan.

### P1 Endpoints
6. `POST /recommendations`
7. `POST /session-guidance`
8. `POST /reflection`

## 6.3 Integrasi Service Existing
- Gunakan `GeminiService::call()` sebagai engine LLM dasar.
- Tambahkan prompt templates khusus assistant (jangan campur dengan prompt analyzer/quiz).
- Gunakan data dari:
  - `LearningSession`
  - `LearningContent`
  - `KnowledgeCard`
  - `QuizAttempt`
  - `FocusDuel`/`StudyRaid`/`CommunityChallenge` (opsional context sosial)

## 6.4 Orkestrasi Alur Chat
1. Validasi auth + permission.
2. Resolve context aktif (session/content/goal).
3. Build structured prompt (system + user + context snapshot).
4. Panggil LLM.
5. Post-process + safety filter.
6. Simpan message dan metadata.
7. Return response + sources/context tags.

---

## 7) Kebutuhan Data Model

## 7.1 Tabel Baru (Minimal)
1. `assistant_conversations`
   - `id`, `user_id`, `title`, `context_type`, `context_id`, `status`, timestamps
2. `assistant_messages`
   - `id`, `conversation_id`, `role` (user/assistant/system), `content`, `model`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `safety_flags`, timestamps
3. `assistant_preferences`
   - `user_id`, `tone`, `language`, `goal_style`, `notification_opt_in`, timestamps

## 7.2 Tabel Opsional (P1/P2)
4. `assistant_memory_snapshots`
5. `assistant_feedback`
   - thumbs up/down, issue category
6. `assistant_action_logs`
   - untuk audit rekomendasi otomatis

## 7.3 Indeks yang Disarankan
- `assistant_conversations(user_id, created_at)`
- `assistant_messages(conversation_id, created_at)`
- `assistant_feedback(message_id)`

---

## 8) Kebutuhan Prompting & AI Quality

## 8.1 Prompt Contracts
Dibutuhkan minimal 4 prompt template:
1. **General Tutor Prompt**
2. **Study Plan Generator Prompt**
3. **Session Coach Prompt**
4. **Progress Reflection Prompt**

Setiap prompt harus:
- Menetapkan persona (coach edukatif, tidak halu, tidak overclaim).
- Mewajibkan grounding pada data context yang diberikan.
- Menolak jawaban yang tidak didukung context internal.
- Memberikan output struktur konsisten (JSON untuk mode terstruktur).

## 8.2 Output Formats
- Chat biasa: markdown text.
- Study plan/recommendation: JSON schema tervalidasi.

Contoh schema study plan (ringkas):
```json
{
  "goal": "...",
  "weekly_plan": [
    {
      "day": "Monday",
      "tasks": [
        {"title": "...", "duration_min": 30, "source_content_id": "..."}
      ]
    }
  ],
  "risk_alerts": ["..."],
  "success_metric": "..."
}
```

## 8.3 Quality Guardrails
- Hallucination control: wajib sertakan `context_used` internal.
- Uncertainty handling: saat data tidak cukup, assistant harus menyatakan asumsi.
- Response length control: jawaban ringkas default, detail on demand.

---

## 9) Kebutuhan Keamanan, Privasi, dan Compliance

## 9.1 Security Controls
1. Semua endpoint assistant wajib di bawah middleware auth (`SupabaseAuth`).
2. Input sanitization pada message user.
3. Rate limit per user untuk endpoint chat.
4. Abuse detection (prompt injection, spam).

## 9.2 Privacy Controls
1. Batasi context retrieval hanya milik user yang login.
2. Masking data sensitif sebelum kirim ke LLM.
3. Simpan log minimum yang diperlukan.
4. User dapat menghapus conversation history.

## 9.3 Content Safety
- Blokir respons berbahaya (self-harm, hateful, illegal instruction).
- Mode edukatif: arahkan ke konten aman/relevan.

---

## 10) Kebutuhan Frontend Engineering

## 10.1 Komponen Baru
1. `components/assistant/AssistantPanel.jsx`
2. `components/assistant/AssistantMessageList.jsx`
3. `components/assistant/AssistantComposer.jsx`
4. `components/assistant/AssistantQuickActions.jsx`
5. `components/assistant/StudyPlanCard.jsx`

## 10.2 State Management
Buat `stores/assistantStore.js` untuk:
- active conversation
- message list
- loading/streaming/error
- current context (session/content/page)

## 10.3 Service Layer
Tambah `services/assistantApi.js`:
- `chat(payload)`
- `generateStudyPlan(payload)`
- `getConversations()`
- `getConversation(id)`

## 10.4 Routing & Navigation
- Minimal route tambahan: `/assistant` (opsional fallback page)
- Sidebar item `Nexera Assistant` harus trigger panel atau route ini.

---

## 11) Kebutuhan Observability & Operasional

## 11.1 Metrics
1. `assistant_requests_total`
2. `assistant_latency_ms`
3. `assistant_error_rate`
4. `assistant_safety_block_rate`
5. `assistant_user_satisfaction` (feedback)

## 11.2 Logging
- Correlation ID per request.
- Log prompt metadata (tanpa bocorkan data sensitif).
- Log token usage dan biaya estimasi.

## 11.3 Cost Control
- Token budget per request/user/day.
- Context compression/truncation strategy.
- Caching hasil study-plan bila input sama.

---

## 12) Kebutuhan Testing

## 12.1 Backend Tests
1. Unit test untuk prompt builder dan context builder.
2. Feature test endpoint assistant (auth, validation, success/error).
3. Contract test output JSON schema study plan.
4. Rate limit dan authorization test.

## 12.2 Frontend Tests
1. Component rendering tests (panel, message, composer).
2. Store tests (state transition loading/success/error).
3. Integration test flow kirim pesan → tampil response.

## 12.3 Non-Functional Tests
1. Load test endpoint chat.
2. Timeout/retry behavior test.
3. Failure mode test saat Gemini down.

---

## 13) Gap Analysis (Current vs Required)

| Area | Current | Required | Gap |
|---|---|---|---|
| Assistant UI | Placeholder sidebar label | Interactive assistant panel/page | Besar |
| Assistant API | Tidak ada | `/v1/assistant/*` lengkap | Besar |
| Conversation data model | Tidak ada | conversation + message tables | Besar |
| AI engine | Ada (`GeminiService`) | Orchestrator + prompt templates assistant | Sedang |
| Context awareness | Belum khusus assistant | Context builder lintas session/content/profile | Besar |
| Safety & policy | Belum khusus assistant | Guardrails + moderation + rate limit | Sedang |
| Observability | Belum khusus assistant | Metrics, logs, token usage | Sedang |

---

## 14) Rencana Implementasi Bertahap

## Phase A — Foundation (MVP, prioritas tinggi)
1. Buat data model conversation + messages.
2. Tambah controller/service assistant (`POST /v1/assistant/chat`).
3. Buat assistant panel sederhana di frontend.
4. Hubungkan sidebar `Nexera Assistant` ke panel.
5. Implement context minimal: current user + active session.

## Phase B — Study Plan & Contextual Intelligence
1. Endpoint `POST /v1/assistant/study-plan/generate`.
2. Prompt template terstruktur + JSON schema validation.
3. Tambah quick actions di panel.
4. Tambah progress reflection berbasis data profile.

## Phase C — Production Hardening
1. Rate limiting & abuse controls.
2. Safety filtering + fallback response.
3. Observability metrics + dashboard internal.
4. User feedback loop (thumbs up/down).

## Phase D — Advanced Features (P1/P2)
1. Adaptive recommendation engine.
2. Goal tracking nudges.
3. Persona modes + multilingual enhancement.

---

## 15) Definisi Sukses (Acceptance Criteria)

Fitur dianggap siap minimal bila:
1. User bisa membuka assistant dari sidebar dan melakukan percakapan end-to-end.
2. Assistant dapat menghasilkan study plan personal dengan format valid.
3. Assistant memberi jawaban berbasis konteks data belajar user (bukan generic).
4. Endpoint aman (auth, validation, rate limit) dan teruji.
5. Error handling jelas saat AI provider gagal.
6. Minimal tersedia metrik performa dan error rate.

---

## 16) Risiko dan Mitigasi

1. **Hallucination/incorrect advice**
   - Mitigasi: context grounding + structured output + fallback uncertainty response.
2. **Biaya token tinggi**
   - Mitigasi: context pruning, token budget, cache response tertentu.
3. **Latency tinggi**
   - Mitigasi: timeout, retry policy, response streaming.
4. **Data privacy leakage**
   - Mitigasi: strict scoping by user_id, masking, minimal logs.
5. **UX ambiguity (chatbot generik vs learning coach)**
   - Mitigasi: definisi produk tegas sebagai learning assistant.

---

## 17) Keputusan Strategis yang Direkomendasikan

1. Tetapkan `Nexera Assistenten` sebagai **learning coach berbasis data internal Nexera**.
2. Hindari scope creep ke chatbot general-purpose pada fase awal.
3. Prioritaskan 2 capability inti untuk impact cepat:
   - conversational coaching
   - AI study plan generator
4. Gunakan infrastruktur yang sudah ada (`GeminiService`, data session/profile) untuk mempercepat delivery.

---

## 18) Output Final Analisis

Dokumen ini mengidentifikasi seluruh kebutuhan realisasi Nexera Assistenten dari aspek:
- Produk
- UX/UI
- Frontend
- Backend/API
- Data model
- AI quality
- Security/privacy
- Testing
- Observability
- Roadmap implementasi

Dokumen siap digunakan sebagai baseline tech spec dan sprint planning.
