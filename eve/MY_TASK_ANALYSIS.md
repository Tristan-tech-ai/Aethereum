# My Task — Deep Analysis & Restructuring Plan

> **Date**: 25 March 2026  
> **Status**: Analysis Complete  
> **Scope**: Frontend `My Task` dropdown, `TasksPage.jsx`, dan seluruh halaman terkait

---

## 1. Executive Summary

Menu dropdown **"My Task"** saat ini memiliki **3 masalah kritis**:
1. **Duplikasi halaman** — Item dropdown mengarah ke halaman Community (`/community/duels`) yang sudah ada di dropdown Community
2. **Data palsu** — `TasksPage.jsx` sepenuhnya menggunakan hardcoded demo data, bukan data real dari API
3. **Identitas kabur** — "My Task" tidak punya identitas yang jelas; campur aduk antara quiz pribadi, duel, dan social activities

### Kondisi Saat Ini vs Yang Seharusnya

| Aspek | Saat Ini | Seharusnya |
|-------|----------|------------|
| Data source | 100% hardcoded demo | Real API dari backend |
| Dropdown items | 4 items (2 duplikat dgn Community) | 4-5 items unik tanpa overlap |
| Tab system | 5 tab (all, quizzes, tests, duels, social) | Disesuaikan dgn data backend real |
| Navigasi | `/tasks`, `/tasks?tab=`, `/community/duels` | Semua under `/tasks` atau `/tasks?tab=` |

---

## 2. Audit Detail: Masalah Dropdown "My Task"

### 2.1 Struktur Dropdown Saat Ini

```
📋 My Task (badge: "3")
├── ⚡ Active Quizzes (badge: "2")     → /tasks
├── 📄 Ongoing Tests (badge: "1")      → /tasks?tab=tests
├── ⚔️ Active Duels                    → /community/duels    ← DUPLIKAT
└── 👥 Social Activities               → /tasks?tab=social
```

### 2.2 Masalah Duplikasi dengan Community

```
📋 My Task
├── ⚔️ Active Duels → /community/duels     ← SAMA
└── 👥 Social Activities → /tasks?tab=social
    └── Demo data links ke /community/rooms  ← SAMA
    └── Demo data links ke /challenge        ← SAMA

👥 Community
├── 🌐 Community Hub      → /community
├── 📖 Study Rooms         → /community/rooms    ← DUPLIKAT dgn Social Activities
├── ⚔️ Study Raids         → /community/raids
├── ⚡ Focus Duels          → /community/duels    ← DUPLIKAT dgn Active Duels
├── 🏆 Quiz Arena          → /community/arena
├── 💬 Learning Relay      → /community/relay
└── 🏅 Weekly Challenge    → /challenge           ← DUPLIKAT dgn Social Activities
```

**Hasil**: 3 dari 4 sub-item My Task mengarah ke halaman di bawah Community. Ini membuat "My Task" kehilangan identitas.

### 2.3 TasksPage.jsx — Full Hardcoded

Halaman `TasksPage.jsx` (420 baris) memiliki:
- **8 task items** — semua hardcoded di array `tasks[]`
- **5 tabs** — all, quizzes (3), tests (2), duels (1), social (2)
- **Stats box** — semua angka dummy (14 completed, 87% avg score, streak 3)
- **Links ke Community** — task type `duel` link ke `/community/duels`, type `social` link ke `/challenge` dan `/community/rooms`
- **Zero API calls** — tidak ada useEffect, tidak ada fetch, tidak ada store

---

## 3. Analisis Backend: Data Real yang Tersedia

### 3.1 Endpoint API yang Sudah Ada

| Endpoint | Controller | Status | Data yang Dikembalikan |
|----------|-----------|--------|------------------------|
| `GET /v1/raids/my` | StudyRaidController | ✅ Siap | Raid user + participants + progress |
| `GET /v1/duels/my` | FocusDuelController | ✅ Siap | Semua duel (pending/active/completed) |
| `GET /v1/challenges/current` | WeeklyChallengeController | ✅ Siap | Challenge aktif + kontribusi user |
| `GET /v1/rooms/public` | StudyRoomController | ✅ Siap | Room yang tersedia |
| `POST /v1/sessions/start` | SessionController | ✅ Siap | Mulai learning session |
| `PATCH /v1/sessions/{id}/progress` | SessionController | ✅ Siap | Update progress section |

### 3.2 Endpoint yang BELUM Ada (Harus Dibuat)

| Endpoint yang Dibutuhkan | Tujuan | Prioritas |
|---------------------------|--------|-----------|
| `GET /v1/sessions/active` | List semua learning session aktif user | **P0** |
| `GET /v1/my-tasks` | Agregasi semua task aktif user | **P1** |

### 3.3 Model Database yang Relevan untuk Task

```
┌─────────────────────────────────────────────────────────┐
│                    MY TASKS DATA SOURCES                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LearningSession (learning_sessions)                    │
│  ├── status: active | paused | completed | abandoned    │
│  ├── current_section / total_sections                   │
│  ├── quiz_avg_score, focus_integrity                    │
│  ├── xp_earned, coins_earned                            │
│  └── progress_data (JSON)                               │
│                                                         │
│  QuizAttempt (quiz_attempts)                            │
│  ├── correct_count, score_percentage                    │
│  ├── passed (boolean)                                   │
│  └── time_taken_seconds                                 │
│                                                         │
│  FocusDuel (focus_duels)                                │
│  ├── status: pending | accepted | active | completed    │
│  ├── challenger_id, opponent_id                         │
│  └── focus_integrity scores                             │
│                                                         │
│  StudyRaid (study_raids) via raid_participants          │
│  ├── status: lobby | active | completed                 │
│  ├── progress_percentage, quiz_score                    │
│  └── participant status: waiting | learning | completed │
│                                                         │
│  CommunityChallenge (challenges)                        │
│  ├── goal_value, current_value                          │
│  ├── is_completed                                       │
│  └── user contribution via challenge_contributions      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Rekomendasi: Halaman My Task yang Seharusnya

### 4.1 Prinsip Utama

> **"My Task" = Task PRIBADI user yang sedang berlangsung atau perlu perhatian.**  
> Bukan tempat discovery (itu Community). Bukan hub social (itu Community Hub).  
> Ini adalah **personal task tracker** — apa yang harus user selesaikan SEKARANG.

### 4.2 Dropdown Baru (Tanpa Duplikasi)

```
📋 My Task (badge: dinamis dari API)
├── ⚡ Active Learning     → /tasks                 ← Session belajar yg belum selesai
├── 📝 Quiz & Review       → /tasks?tab=quizzes     ← Quiz attempts yg pending
├── ⚔️ Active Duels        → /tasks?tab=duels       ← Duel dimana user terlibat (BUKAN /community/duels)
└── 🎯 My Activities       → /tasks?tab=activities  ← Raid/Challenge yg user ikuti
```

**Perubahan kunci**:
- ❌ Hapus link langsung ke `/community/duels` — semua navigasi ke `/tasks?tab=X`
- ❌ Hapus "Ongoing Tests" — tidak ada model "test" di backend; quiz sudah cukup
- ✅ Semua tab menampilkan data **MILIK USER** dari API, bukan discovery
- ✅ Setiap task card punya tombol "Continue" yang mengarah ke halaman yang tepat

### 4.3 Definisi Setiap Tab + Data Source

#### Tab 1: Active Learning (Default)
**Apa yang ditampilkan**: Learning sessions yang status = `active` atau `paused`

```
Data Source : GET /v1/sessions/active (BARU — harus dibuat)
Model       : LearningSession
Filter      : WHERE user_id = auth AND status IN ('active', 'paused')
Relasi      : WITH content (judul, subject)
```

**Card UI menampilkan**:
- Judul materi (dari LearningContent)
- Progress bar: `current_section / total_sections`
- Quiz score rata-rata: `quiz_avg_score`
- Focus integrity: `focus_integrity`%
- XP yang sudah didapat: `xp_earned`
- Tombol "Continue" → `/learn/{materialId}` (DocumentDungeonPage)
- Tombol "Abandon" → ubah status ke `abandoned`

**Real Impact**: User bisa lihat semua materi yang belum selesai dipelajari dan langsung lanjut. Ini adalah **use case paling penting** karena core product adalah belajar.

#### Tab 2: Quiz & Review
**Apa yang ditampilkan**: Section-section yang quiz-nya belum lulus

```
Data Source : GET /v1/sessions/active (include section states)
Model       : LearningSession → progress_data.sections_completed
Filter      : Sections where quiz passed = false AND session active
```

**Card UI menampilkan**:
- Nama section + nama materi
- Skor terakhir: `score_percentage`%
- Jumlah attempt
- Waktu cooldown (jika ada)
- Tombol "Retry Quiz" → `/learn/{materialId}` langsung ke section quiz

**Real Impact**: Membantu user fokus pada quiz yang perlu di-retry. Mendrive completion rate.

#### Tab 3: Active Duels
**Apa yang ditampilkan**: Duel dimana user terlibat (sebagai challenger ATAU opponent)

```
Data Source : GET /v1/duels/my (SUDAH ADA)
Model       : FocusDuel
Filter      : WHERE status IN ('pending', 'accepted', 'active')
Relasi      : WITH challenger, opponent
```

**Card UI menampilkan**:
- Nama opponent + avatar
- Status duel (Pending invitation / Active / Your turn)
- Focus score comparison jika active
- Waktu tersisa (expires_at)
- Tombol "Accept" (jika pending, user = opponent)
- Tombol "View Duel" → buka duel detail/in-progress modal

**Real Impact**: User bisa langsung terima/tolak duel dan pantau duel aktif tanpa harus ke Community.

**Perbedaan dengan Community > Focus Duels**:
| My Task > Active Duels | Community > Focus Duels |
|------------------------|------------------------|
| Hanya duel MILIK user | Discovery: cari lawan baru |
| Focus pada pending & active | Lihat history, stats, leaderboard |
| Action: accept, continue | Action: challenge, browse |

#### Tab 4: My Activities
**Apa yang ditampilkan**: Raid, Relay, dan Challenge aktif yang user ikuti

```
Data Sources:
- GET /v1/raids/my     → Raid aktif user (SUDAH ADA)
- GET /v1/challenges/current  → Challenge aktif (SUDAH ADA)
- GET /v1/relay/{id}   → Relay aktif (perlu filter per user)

Model: StudyRaid + CommunityChallenge + LearningRelay
Filter: WHERE user is participant AND status != completed
```

**Card UI menampilkan**:
- **Raid cards**: Nama raid, team progress, jumlah anggota, status user (waiting/learning)
- **Challenge cards**: Nama challenge, progress bar komunitas, kontribusi user, reward tier
- **Relay cards**: Nama relay, section assignment user, status (learning/summarizing/quiz)
- Tombol "Continue" yang mengarah ke halaman spesifik

**Real Impact**: Satu tempat untuk lihat SEMUA aktivitas social yang user sudah commit. Tidak perlu cek satu per satu di Community.

---

## 5. Backend Implementation Plan

### 5.1 Endpoint Baru yang Perlu Dibuat

#### A. `GET /v1/sessions/active`

```php
// SessionController.php
public function myActiveSessions(Request $request)
{
    $sessions = LearningSession::where('user_id', $request->user()->id)
        ->whereIn('status', ['active', 'paused'])
        ->with(['content:id,title,subject,content_type'])
        ->orderBy('updated_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data'    => $sessions,
    ]);
}
```

```php
// routes/api.php — tambahkan
Route::get('sessions/active', [SessionController::class, 'myActiveSessions']);
```

#### B. `GET /v1/my-tasks/summary` (Agregasi untuk badge count)

```php
// Buat MyTaskController.php (BARU)
public function summary(Request $request)
{
    $userId = $request->user()->id;

    return response()->json([
        'success' => true,
        'data' => [
            'active_sessions' => LearningSession::where('user_id', $userId)
                ->whereIn('status', ['active', 'paused'])->count(),
            'pending_duels' => FocusDuel::where(function ($q) use ($userId) {
                $q->where('challenger_id', $userId)
                  ->orWhere('opponent_id', $userId);
            })->whereIn('status', ['pending', 'accepted', 'active'])->count(),
            'active_raids' => StudyRaid::whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->where('status', 'active')->count(),
            'active_challenge' => CommunityChallenge::where('is_completed', false)
                ->where('ends_at', '>', now())->exists() ? 1 : 0,
        ],
    ]);
}
```

### 5.2 Endpoint yang Sudah Ada dan Langsung Bisa Dipakai

| Endpoint | Untuk Tab | Siap? |
|----------|-----------|-------|
| `GET /v1/duels/my` | Active Duels | ✅ |
| `GET /v1/raids/my` | My Activities (raids) | ✅ |
| `GET /v1/challenges/current` | My Activities (challenge) | ✅ |

---

## 6. Frontend Implementation Plan

### 6.1 Zustand Store Baru: `taskStore.js`

```javascript
// frontend/src/stores/taskStore.js
import { create } from 'zustand';
import api from '../lib/api';

const useTaskStore = create((set) => ({
    activeSessions: [],
    activeDuels: [],
    activeRaids: [],
    currentChallenge: null,
    summary: { active_sessions: 0, pending_duels: 0, active_raids: 0, active_challenge: 0 },
    loading: false,

    fetchSummary: async () => {
        const res = await api.get('/v1/my-tasks/summary');
        set({ summary: res.data.data });
    },
    fetchActiveSessions: async () => { /* GET /v1/sessions/active */ },
    fetchActiveDuels: async () => { /* GET /v1/duels/my?status=active */ },
    fetchActiveRaids: async () => { /* GET /v1/raids/my?status=active */ },
    fetchCurrentChallenge: async () => { /* GET /v1/challenges/current */ },
}));
```

### 6.2 TasksPage.jsx — Rewrite Total

**Hapus semua hardcoded data** dan ganti dengan:

```jsx
useEffect(() => {
    taskStore.fetchActiveSessions();
    taskStore.fetchActiveDuels();
    taskStore.fetchActiveRaids();
    taskStore.fetchCurrentChallenge();
}, []);
```

### 6.3 Sidebar Badge — Dinamis dari API

```jsx
// Di Sidebar.jsx, ambil summary dari taskStore
const { summary } = useTaskStore();
const totalBadge = summary.active_sessions + summary.pending_duels + summary.active_raids;

<DropdownNav icon={ClipboardCheck} label="My Task" badge={totalBadge || null}>
```

---

## 7. Halaman yang Harus DIHAPUS / Tidak Diimplementasi

| Halaman/Fitur | Alasan Tidak Perlu |
|---------------|--------------------|
| `SocialHubPage.jsx` (`/social`) | Duplikasi total dengan CommunityHubPage — semua tab sama persis |
| Tab "tests" di TasksPage | Tidak ada model "Test" di backend. Quiz sudah mencakup assessment |
| Link `/community/duels` di My Task | Duplikasi — My Task harus link ke `/tasks?tab=duels` bukan community |
| Link `/challenge` di tasks demo data | Challenge ditampilkan di tab Activities, bukan sebagai external link |

---

## 8. Prioritas Implementasi

### Phase 1: Backend Foundation (P0)
1. ✳️ Tambah `GET /v1/sessions/active` di SessionController
2. ✳️ Buat `MyTaskController` dengan method `summary()`
3. ✳️ Tambah route di `routes/api.php`

### Phase 2: Frontend Store & API Integration (P0)
4. ✳️ Buat `taskStore.js` (Zustand store)
5. ✳️ Rewrite `TasksPage.jsx` — hapus semua demo data, gunakan store

### Phase 3: Sidebar Fix (P0)
6. ✳️ Update dropdown items di `Sidebar.jsx`:
   - Hapus link `/community/duels` 
   - Ganti semua ke `/tasks?tab=X`
   - Badge dinamis dari `taskStore.summary`

### Phase 4: Tab Content Implementation (P1)
7. ✳️ Implement tab "Active Learning" (session cards)
8. ✳️ Implement tab "Quiz & Review" (failed quiz cards)
9. ✳️ Implement tab "Active Duels" (duel cards with accept/decline)
10. ✳️ Implement tab "My Activities" (raids + challenge cards)

### Phase 5: Cleanup (P2)
11. ✳️ Hapus `SocialHubPage.jsx` — redirect `/social` ke `/community`
12. ✳️ Hapus route `/social` dari `router.jsx`

---

## 9. Ringkasan Perubahan File

| File | Action | Detail |
|------|--------|--------|
| `app/Http/Controllers/Api/SessionController.php` | EDIT | Tambah `myActiveSessions()` |
| `app/Http/Controllers/Api/MyTaskController.php` | CREATE | Controller baru untuk summary |
| `routes/api.php` | EDIT | Tambah 2 route baru |
| `frontend/src/stores/taskStore.js` | CREATE | Zustand store baru |
| `frontend/src/pages/TasksPage.jsx` | REWRITE | Hapus demo data, pakai API |
| `frontend/src/components/layout/Sidebar.jsx` | EDIT | Fix dropdown items & dynamic badge |
| `frontend/src/router.jsx` | EDIT | Hapus route `/social` |
| `frontend/src/pages/SocialHubPage.jsx` | DELETE | Tidak diperlukan |

---

## 10. Impact Assessment

### Dengan implementasi ini, user mendapat:

| Sebelum | Sesudah |
|---------|---------|
| 8 task dummy yang tidak berubah | Task real berdasarkan aktivitas user |
| Klik "Active Duels" → ke halaman Community | Klik tab Duels → lihat duel milik sendiri |
| Badge "3" hardcoded | Badge dinamis: jumlah task real |
| 3 halaman duplikat | Zero duplikasi |
| Tidak tahu materi mana yang belum selesai | List jelas dengan progress bar real |
| Tab "tests" yang tidak ada model-nya | Tab "Quiz & Review" berbasis QuizAttempt real |

### Metrics yang akan meningkat:
- **Course completion rate** — user bisa lihat dan lanjutkan session yang terbengkalai
- **Duel acceptance rate** — pending duels terlihat jelas di task list
- **Daily active engagement** — task list memberikan alasan untuk kembali
- **Navigation clarity** — tidak ada confusion antara My Task dan Community

---

## Appendix A: Perbandingan My Task vs Community

```
┌────────────────────────────────┐    ┌────────────────────────────────┐
│           MY TASK              │    │          COMMUNITY             │
│   "Apa yang harus saya        │    │   "Apa yang bisa saya          │
│    selesaikan sekarang?"       │    │    ikuti / temukan?"           │
├────────────────────────────────┤    ├────────────────────────────────┤
│                                │    │                                │
│  ✅ Session belajar aktif      │    │  🔎 Browse study rooms         │
│  ✅ Quiz yang perlu retry      │    │  🔎 Cari lawan duel baru       │
│  ✅ Duel pending/active SAYA   │    │  🔎 Join raid baru             │
│  ✅ Raid yang saya ikuti       │    │  🔎 Create arena quiz          │
│  ✅ Challenge contribution     │    │  🔎 Start learning relay       │
│                                │    │  🔎 Weekly challenge overview   │
│  Action: Continue, Retry,      │    │  Action: Join, Create,         │
│          Accept, Abandon       │    │          Challenge, Browse      │
│                                │    │                                │
│  Scope: MILIK USER saja       │    │  Scope: SEMUA yang tersedia    │
│  Data: Filtered per user_id   │    │  Data: Public / discoverable   │
│                                │    │                                │
└────────────────────────────────┘    └────────────────────────────────┘
```

## Appendix B: SocialHubPage vs CommunityHubPage — Justifikasi Penghapusan

`SocialHubPage.jsx` (route: `/social`) memiliki:
- 6 tab: Raids, Duels, Arena, Rooms, Relay, Community
- Demo data yang identik dengan setiap dedicated community page
- Friends sidebar (juga ada di CommunityHubPage)

`CommunityHubPage.jsx` (route: `/community`) memiliki:
- 6 activity card yang link ke dedicated pages
- Quick stats
- Community feed
- Friends sidebar

**Kesimpulan**: SocialHubPage adalah versi monolitik dari apa yang CommunityHubPage + dedicated pages sudah cover. Setelah community restructuring (lihat `/memories/repo/community-restructure.md`), SocialHubPage menjadi redundant. Route `/social` seharusnya redirect ke `/community`.
