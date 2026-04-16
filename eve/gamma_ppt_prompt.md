# PROMPT UNTUK GAMMA AI — PRESENTASI NEXERA ASSISTANT

Buatkan presentasi PowerPoint profesional dengan **maksimal 10 slide** untuk kompetisi **FICPACT CUP 2026** (subtema: Interactive Edutainment). Presentasi ini mempresentasikan fitur unggulan **Nexera Assistanten** — sebuah AI chatbot pintar yang terintegrasi di dalam platform edukasi gamifikasi bernama **Nexera**.

---

## KONTEKS UMUM PRESENTASI

- **Nama Website**: Nexera
- **Tagline**: Platform Pembelajaran Kolaboratif Berbasis Gamifikasi
- **Nama Tim**: Lunar Kumar
- **Anggota Tim**: I Made Tristan Hope Firdaus, I Made Putra Sanjaya, Christian Najuar Luwisandro, Abi Hu SyahFarel, I Kadek Galih Murtiobama
- **Institusi**: SMK TI Bali Global Badung (Program PPLG)
- **Kompetisi**: FICPACT CUP 2026 — diselenggarakan oleh BEM FIKOM Universitas Katolik Soegijapranata
- **Link Website**: https://nexera.dedyn.io
- **Tech Stack**: React 19 (Frontend), Laravel 12 + PHP 8.4 (Backend), PostgreSQL 17, Supabase Auth, Google Gemini AI (LLM Engine)
- **Tema Desain**: "Calm Premium Dark" — dark mode futuristik dengan glassmorphism, warna utama Royal Purple (#7C3AED) dan aksen Cyan (#06B6D4), font Space Grotesk (heading) & Inter (body)

---

## INSTRUKSI DESAIN SLIDE

- Gunakan tema gelap (dark mode) yang elegan dan futuristik, sesuai identitas Nexera.
- Warna dominan: latar gelap (#0F0F1A ke #1A1A2E), aksen ungu (#7C3AED), aksen cyan (#06B6D4).
- Gunakan ikon-ikon modern (gaya Lucide/Feather icons). Hindari emoji kekanak-kanakan.
- Gunakan visual diagram/flowchart jika menjelaskan arsitektur atau alur kerja.
- Pastikan konten per slide ringkas (poin-poin), jangan terlalu padat teks.
- Nuansa keseluruhan: premium, scholarly, tech-startup vibes — bukan desain sekolah biasa.

---

## STRUKTUR SLIDE (10 SLIDE)

### SLIDE 1 — Cover / Judul
- Judul besar: **NEXERA**
- Subtitle: *Platform Pembelajaran Kolaboratif Berbasis Gamifikasi*
- Baris ketiga: **Nexera Assistanten — Your Personal AI Learning Coach**
- Nama Tim: Lunar Kumar
- Institusi: SMK TI Bali Global Badung
- Kompetisi: FICPACT CUP 2026 — Subtema: Interactive Edutainment
- Elemen visual: logo/ikon futuristik bergaya AI + education

---

### SLIDE 2 — Masalah yang Dihadapi
- Judul: **Mengapa Belajar Mandiri Gagal?**
- Poin-poin masalah (dengan data):
  - 82% siswa kehilangan fokus setelah 15 menit belajar mandiri di layar (survei 78 responden).
  - 88% menganggap aplikasi belajar saat ini "terlalu kaku, seperti buku teks digital".
  - 91% termotivasi oleh reward system (badge, level up, item) — tapi platform edukasi belum memanfaatkannya.
  - Skor PISA Indonesia konsisten berada di persentil bawah dari 81 negara.
  - Ada 44 juta+ siswa berisiko "learning loss" karena metode belajar tidak relevan dengan gaya hidup digital mereka.
- Insight: **Masalah utama bukan ketiadaan materi, melainkan ketiadaan MOTIVASI dan ATENSI yang konsisten.**
- Visual: grafik atau ilustrasi siswa bosan di depan layar vs siswa engaged di game

---

### SLIDE 3 — Solusi: Sekilas Nexera
- Judul: **Nexera — Belajar Seperti Bermain Game RPG**
- Penjelasan singkat (2-3 kalimat): Nexera adalah platform edukasi yang menggabungkan gamifikasi mendalam, fitur sosial multiplayer, dan AI personal coach ke dalam satu ekosistem belajar yang membuat siswa ketagihan belajar.
- Tampilkan 7 fitur inti Nexera secara ringkas (ikon + nama saja, 1 baris per fitur):
  1. 📖 **Document Dungeon** — Sesi belajar imersif ala dungeon RPG
  2. ⚔️ **Study Raids** — Belajar kolaboratif real-time ala raid guild
  3. 🏆 **Gamified Profile & Knowledge Cards** — Tier Bronze → Diamond
  4. 🤖 **Nexera Assistanten** — AI Coach personal berbasis Gemini ← HIGHLIGHT INI
  5. 🔥 **Focus Economy & Streak System** — Reward disiplin & konsistensi
  6. 🏅 **Leaderboard (Hall of Sages)** — Arena kompetisi global
  7. 🎨 **Calm Premium Dark UI** — Desain futuristik tingkat enterprise
- Catatan: beri tanda BINTANG atau HIGHLIGHT khusus pada fitur nomor 4 (Nexera Assistanten)

---

### SLIDE 4 — Deep Dive: Apa itu Nexera Assistanten?
- Judul: **Nexera Assistanten — Bukan Chatbot Biasa**
- Definisi: Nexera Assistanten adalah asisten belajar personal berbasis AI (Google Gemini) yang terintegrasi ke dalam ekosistem Nexera. Dia bukan chatbot general-purpose — dia adalah **Learning Coach** yang mengerti konteks belajar spesifik setiap pengguna.
- 4 Peran Utama (tampilkan sebagai 4 kartu/kolom):
  1. **🎯 Planner** — Menyusun rencana belajar harian/mingguan berdasarkan target dan kemampuan pengguna.
  2. **🧭 Coach** — Memberikan arahan saat sesi belajar aktif: section berikutnya, tips quiz, motivasi.
  3. **📊 Reviewer** — Menganalisis performa setelah sesi: weak topics, mastery level, rekomendasi perbaikan.
  4. **🧑‍🏫 Companion** — Menjawab pertanyaan spesifik terkait materi yang sedang dipelajari (kontekstual, bukan generik).
- Tagline bawah: *"Seperti mempekerjakan Private Tutor jenius yang standby 24/7 dan paham persis kesulitan unikmu."*

---

### SLIDE 5 — Fitur Quiz Assistant (Highlight Teknis)
- Judul: **Quiz Assistant — Latihan Soal Cerdas via Chat**
- Penjelasan: Pengguna cukup mengetik "aku mau latihan soal" di chat, dan Assistant akan memandu konfigurasi quiz secara percakapan natural — memilih materi, bab, jumlah soal, tipe, dan tingkat kesulitan.
- Tampilkan State Machine Flow sebagai diagram visual sederhana:
  ```
  intent → material → section → count → type → difficulty → confirm → quiz_active → completed
  ```
- Penjelasan tiap fase (ringkas, 1 baris):
  - **intent**: AI mendeteksi pengguna ingin latihan soal
  - **material**: Menampilkan rekomendasi materi berdasarkan riwayat belajar
  - **section**: Memilih bab/bagian yang mau diujikan
  - **count, type, difficulty**: Jumlah soal, tipe soal (pilihan ganda/essay), tingkat kesulitan
  - **confirm**: Rekap konfigurasi sebelum mulai
  - **quiz_active**: Soal digenerate oleh Gemini AI, pengguna mengerjakan
  - **completed**: Hasil analisis + feedback personal dari AI
- Highlight: **Semua konfigurasi dilakukan lewat percakapan natural — tidak perlu klik menu atau navigasi rumit.**

---

### SLIDE 6 — Arsitektur Teknis Assistant
- Judul: **Bagaimana Nexera Assistanten Bekerja?**
- Tampilkan diagram arsitektur (flowchart visual):
  ```
  User Message
      ↓
  AssistantOrchestratorService (mendeteksi intent: chat biasa / quiz / study plan)
      ↓
  [Intent == 'quiz'] → QuizConfigurationFlowService → State Machine → QuizAssistantAdapter
      ↓
  QuizGeneratorService (memanggil Gemini API untuk generate soal)
      ↓
  User mengerjakan quiz
      ↓
  QuizResultAnalyzerService (analisis: mastery level, weak topics, statistik)
      ↓
  QuizFeedbackGeneratorService (Gemini AI menghasilkan feedback personal)
      ↓
  Feedback muncul di chat sebagai pesan Assistant
  ```
- Poin teknis penting (3 bullet):
  - **Contextual AI**: Prompt dikirim bersama profil user, riwayat belajar, dan data quiz — bukan prompt kosong.
  - **Structured Output**: AI dipaksa menghasilkan JSON schema yang tervalidasi (bukan narasi bebas), akurasi format 99.2%.
  - **Safety Layer**: Middleware penjaga mencegah prompt injection dan respons berbahaya.

---

### SLIDE 7 — Teknologi di Balik Layar
- Judul: **Tech Stack & AI Engine**
- Bagi jadi 2 kolom:

**Kolom Kiri — Platform Stack:**
| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Zustand, Framer Motion |
| Backend | Laravel 12, PHP 8.4 |
| Database | PostgreSQL 17 (via Supabase Pooler) |
| Auth | Supabase Auth (SSO Google) |
| Realtime | Laravel Reverb (WebSocket) |
| Deployment | Railway (Docker) + Vercel (Frontend) |
| CI/CD | GitHub Actions |

**Kolom Kanan — AI Engine:**
| Komponen | Detail |
|----------|--------|
| LLM Provider | Google Gemini 2.5 Flash |
| Prompt Engineering | Retrieval-Augmented Generation (RAG) — konteks dari data belajar user |
| Output Mode | Structured JSON (quiz, study plan) + Markdown (chat) |
| Safety | Prompt injection filter + educational-only guardrails |
| Rate Limiting | 5 req/min (quiz), 30 req/min (chat) per user |
| Monitoring | Custom metrics service (quiz started, completed, fallback rate) |

---

### SLIDE 8 — Keamanan & Production Readiness
- Judul: **Production-Grade Security & Monitoring**
- Tampilkan sebagai kartu-kartu atau ikon grid:
  1. **🔒 Session Ownership Middleware**: Setiap sesi quiz divalidasi kepemilikannya — user lain tidak bisa mengakses sesi orang lain.
  2. **⏱️ Rate Limiting**: Endpoint quiz dan chat dibatasi per user untuk mencegah abuse (quiz_generate: 5/menit, chat: 30/menit).
  3. **🚨 Custom Exception Handling**: Error spesifik (QuizGenerationException, InvalidConversationStateException, MaterialNotFoundException) ditangani dengan respons JSON yang jelas untuk frontend.
  4. **📊 Metrics & Monitoring**: QuizAssistantMetricsService mencatat metrik harian (quiz started, completed, intent distribution, fallback usage) secara lightweight via Cache.
  5. **🧹 Auto Cleanup**: Artisan command `assistant:cleanup-sessions` berjalan otomatis setiap jam untuk membersihkan sesi expired (>24 jam).
  6. **✅ Form Request Validation**: Semua input divalidasi menggunakan dedicated Laravel Form Request classes — tidak ada inline validation.

---

### SLIDE 9 — Hasil Pengujian & Validasi
- Judul: **Teruji & Tervalidasi**
- Tampilkan tabel/grid hasil:
  - **Skor SUS (Usability)**: 82.5/100 — Rating "Excellent (A-)", persentil ke-88, dari 24 responden
  - **Lighthouse Performance**: 95/100 | Accessibility: 100 | Best Practices: 100
  - **API Testing**: 25+ endpoint, 100% assertion passed
  - **AI Safety**: Prompt injection test LULUS — safety layer berhasil memblokir instruksi bypass
  - **Browser Compatibility**: Chrome 100+, Firefox 115+, Edge terbaru, Android 13+
  - **Responsive Test**: iPhone 13, iPad Air, Desktop 1080p — semua layout konsisten
- Kutipan survei:
  - *"88.4% responden menyatakan sangat terbantu dengan AI yang spesifik membahas materi yang ditugaskan, bukan menjawab kemana-mana."*
  - *"92% responden menginginkan desain premium, bukan desain kaku ala buku pelajaran digital."*

---

### SLIDE 10 — Penutup & Call to Action
- Judul: **Nexera — Masa Depan Belajar Dimulai di Sini**
- Ringkasan dalam 3 poin:
  1. **Gamifikasi Mendalam**: Belajar selengkap bermain RPG — XP, Tiers, Raids, Duels.
  2. **AI Coach Personal**: Nexera Assistanten memandu setiap langkah belajar dengan kecerdasan kontekstual.
  3. **Social Accountability**: Belajar bukan aktivitas sendirian — teman sekelasmu melihat progresmu secara real-time.
- Tampilkan link website: **https://nexera.dedyn.io**
- Tampilkan nama tim dan institusi
- Pesan penutup: *"Kami tidak sekadar memindahkan buku ke layar. Kami merancang ulang apa artinya BELAJAR — untuk generasi yang tumbuh bersama game, AI, dan media sosial."*
- Visual: ikon/ilustrasi futuristik yang menggambarkan kolaborasi antara manusia dan AI dalam konteks pendidikan

---

## CATATAN TAMBAHAN UNTUK AI GENERATOR

1. **Fokus berat ada di Nexera Assistanten (Slide 4, 5, 6, 7, 8)**. Penjelasan tentang Nexera secara umum cukup ringkas di Slide 2-3.
2. Jangan gunakan desain yang "kekanak-kanakan" atau "sekolah dasar vibes". Target audiens adalah juri kompetisi web development tingkat perguruan tinggi.
3. Setiap slide harus punya visual/diagram/ikon yang mendukung — jangan hanya bullet points tanpa visual.
4. Bahasa presentasi: **Bahasa Indonesia** (formal namun engaging, bukan terlalu kaku akademis).
5. Pastikan ada kohesi visual antar slide — warna, tipografi, dan layout konsisten dari awal sampai akhir.
6. Jika ada flowchart atau diagram arsitektur, buat dengan gaya modern (rounded boxes, gradient connections, ikon di setiap node).
