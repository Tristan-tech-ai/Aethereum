# Community Features — Requirements Analysis

> **Tujuan**: Identifikasi SEMUA kebutuhan untuk merealisasikan fitur Community tanpa demo data.  
> **Generated**: Berdasarkan audit menyeluruh terhadap PRD, DRD, Checklist, backend code, frontend code, dan best practices real-time web.

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Audit Status: Apa yang Sudah Ada vs Belum](#2-audit-status)
3. [Bug Kritis pada Kode Existing](#3-bug-kritis)
4. [Backend Requirements](#4-backend-requirements)
   - 4.1 Controllers & Routes
   - 4.2 Services
   - 4.3 Broadcasting (WebSocket)
   - 4.4 Jobs & Schedulers
5. [Frontend Requirements](#5-frontend-requirements)
   - 5.1 Stores (Zustand)
   - 5.2 WebSocket Service
   - 5.3 Custom Hooks
   - 5.4 Halaman & Komponen — Integrasi API
6. [Per-Feature Breakdown](#6-per-feature-breakdown)
   - 6.1 Study Raid
   - 6.2 Focus Duel
   - 6.3 Quiz Arena
   - 6.4 Learning Relay
   - 6.5 Study Room
   - 6.6 Weekly Community Challenge
   - 6.7 Community Feed
   - 6.8 Friends System
7. [Database & Infrastructure](#7-database--infrastructure)
8. [Prioritas Implementasi](#8-prioritas-implementasi)

---

## 1. Executive Summary

Platform Aethereum memiliki **8 model Eloquent** dan **8 migration** untuk fitur sosial yang sudah lengkap. Namun, hanya **2 dari 8 controller** sosial inti yang sudah diimplementasi (Feed & Friends), dan keduanya mengandung **bug kritis** yang menyebabkan crash saat runtime. **6 controller utama** untuk Study Raid, Focus Duel, Quiz Arena, Learning Relay, Study Room, dan Weekly Challenge **belum dibuat sama sekali**.

Di sisi frontend, **17 komponen sosial** dan **6 halaman community** sudah ada, tetapi **seluruhnya menggunakan demo/hardcoded data**. Tidak ada satupun Zustand store untuk fitur sosial, tidak ada integrasi WebSocket (meskipun `socket.io-client` terinstall), dan tidak ada custom hooks untuk real-time features.

### Ringkasan Angka

| Kategori | Sudah Ada | Perlu Dibuat/Diperbaiki |
|---|---|---|
| Backend Models | 8/8 ✅ | 0 |
| Backend Migrations | 8/8 ✅ | 0 |
| Backend Controllers | 2/8 (buggy) | 6 baru + 2 fix |
| Backend Services | 1/7 (buggy) | 6 baru + 1 fix |
| Backend Broadcast Events | 0/15 | 15 baru |
| Backend Jobs | 0/3 | 3 baru |
| API Routes (sosial) | 2/8 grup | 6 grup baru |
| Broadcasting Config | 0/2 file | 2 file baru |
| Frontend Stores (sosial) | 0/5 | 5 baru |
| Frontend WebSocket Service | 0/1 | 1 baru |
| Frontend Custom Hooks | 0/6 | 6 baru |
| Frontend Pages (integrasi API) | 0/6 terhubung | 6 perlu integrasi |
| Frontend Components (integrasi API) | 0/17 terhubung | 17 perlu integrasi |

---

## 2. Audit Status

### ✅ Backend — SUDAH ADA & BENAR

| Item | File | Status |
|---|---|---|
| StudyRaid Model | `app/Models/StudyRaid.php` | ✅ Lengkap (relationships, casts, pivots) |
| FocusDuel Model | `app/Models/FocusDuel.php` | ✅ Lengkap |
| QuizArena Model | `app/Models/QuizArena.php` | ✅ Lengkap |
| LearningRelay Model | `app/Models/LearningRelay.php` | ✅ Lengkap |
| StudyRoom Model | `app/Models/StudyRoom.php` | ✅ Lengkap |
| CommunityChallenge Model | `app/Models/CommunityChallenge.php` | ✅ Lengkap |
| Friendship Model | `app/Models/Friendship.php` | ✅ Lengkap (`requester_id`, `addressee_id`) |
| FeedEvent Model | `app/Models/FeedEvent.php` | ✅ Lengkap (`likes`, `event_data`) |
| Migration: study_raids + raid_participants | `database/migrations/` | ✅ |
| Migration: focus_duels | `database/migrations/` | ✅ |
| Migration: quiz_arenas + arena_participants | `database/migrations/` | ✅ |
| Migration: learning_relays + relay_participants | `database/migrations/` | ✅ |
| Migration: study_rooms + study_room_members | `database/migrations/` | ✅ |
| Migration: community_challenges + challenge_contributions | `database/migrations/` | ✅ |
| Migration: friendships | `database/migrations/` | ✅ |
| Migration: feed_events + feed_likes | `database/migrations/` | ✅ |
| ExploreController | `app/Http/Controllers/Api/ExploreController.php` | ✅ |
| SearchController | `app/Http/Controllers/Api/SearchController.php` | ✅ |
| ProfileController | `app/Http/Controllers/Api/ProfileController.php` | ✅ |
| LeaderboardController | `app/Http/Controllers/Api/LeaderboardController.php` | ✅ |

### ❌ Backend — BELUM ADA

| Item | Expected File | Endpoints Needed |
|---|---|---|
| StudyRaidController | `app/Http/Controllers/Api/StudyRaidController.php` | 9 endpoint |
| FocusDuelController | `app/Http/Controllers/Api/FocusDuelController.php` | 7 endpoint |
| QuizArenaController | `app/Http/Controllers/Api/QuizArenaController.php` | 5 endpoint |
| LearningRelayController | `app/Http/Controllers/Api/LearningRelayController.php` | 6 endpoint |
| StudyRoomController | `app/Http/Controllers/Api/StudyRoomController.php` | 7 endpoint |
| WeeklyChallengeController | `app/Http/Controllers/Api/WeeklyChallengeController.php` | 3 endpoint |
| StudyRaidService | `app/Services/StudyRaidService.php` | — |
| FocusDuelService | `app/Services/FocusDuelService.php` | — |
| QuizArenaService | `app/Services/QuizArenaService.php` | — |
| LearningRelayService | `app/Services/LearningRelayService.php` | — |
| StudyRoomService | `app/Services/StudyRoomService.php` | — |
| WeeklyChallengeService | `app/Services/WeeklyChallengeService.php` | — |
| `routes/channels.php` | Channel authorization rules | — |
| `config/broadcasting.php` | Broadcasting driver config | — |
| 15 Broadcast Event classes | `app/Events/` | — |
| 3 Scheduled Jobs | `app/Jobs/` | — |

### ✅ Frontend — SUDAH ADA (tapi pakai demo data)

**Halaman Community:**
- `CommunityHubPage.jsx` — `/community`
- `StudyRaidsPage.jsx` — `/community/raids`
- `FocusDuelsPage.jsx` — `/community/duels`
- `QuizArenaPage.jsx` — `/community/arena`
- `StudyRoomsPage.jsx` — `/community/rooms`
- `LearningRelayPage.jsx` — `/community/relay`

**Komponen Sosial (17):**
- CommunityFeed, FriendsList, AddFriendModal
- ChallengeDuelModal, DuelInProgress, DuelResults, PendingDuels
- CreateRaidModal, RaidLobby, RaidInProgress, RaidComplete
- StudyRoomBrowser, StudyRoomView
- ChallengeWidget, ChallengeCompleteBanner
- FriendRequestNotification, UserMiniCard

### ❌ Frontend — BELUM ADA

| Item | Expected File |
|---|---|
| socialStore | `frontend/src/stores/socialStore.js` |
| friendStore | `frontend/src/stores/friendStore.js` |
| feedStore | `frontend/src/stores/feedStore.js` |
| studyRoomStore | `frontend/src/stores/studyRoomStore.js` |
| challengeStore | `frontend/src/stores/challengeStore.js` |
| reverbService (WebSocket client) | `frontend/src/services/reverbService.js` |
| useRaidSocket hook | `frontend/src/hooks/useRaidSocket.js` |
| useDuelSocket hook | `frontend/src/hooks/useDuelSocket.js` |
| useArenaSocket hook | `frontend/src/hooks/useArenaSocket.js` |
| useStudyRoomSocket hook | `frontend/src/hooks/useStudyRoomSocket.js` |
| useFeedSocket hook | `frontend/src/hooks/useFeedSocket.js` |
| useNotifications hook | `frontend/src/hooks/useNotifications.js` |

---

## 3. Bug Kritis

### 3.1 FriendController — Column Name Mismatch (CRASH)

**File**: `app/Http/Controllers/Api/FriendController.php`

**Masalah**: Controller menggunakan `user_id` dan `friend_id`, tapi migration & model menggunakan `requester_id` dan `addressee_id`.

```php
// ❌ SALAH (di Controller)
$q->where('user_id', $user->id)->where('friend_id', $targetUser->id);
Friendship::create(['user_id' => ..., 'friend_id' => ...]);
$f->user_id, $f->friend, $f->user  // relationships yang tidak ada di model

// ✅ BENAR (sesuai Model & Migration)
$q->where('requester_id', $user->id)->where('addressee_id', $targetUser->id);
Friendship::create(['requester_id' => ..., 'addressee_id' => ...]);
$f->requester_id, $f->requester, $f->addressee  // relationships yang benar
```

**Dampak**: Semua endpoint friends (request, accept, decline, remove, index, requests) akan **crash** dengan `SQLSTATE Column not found`.

**Fix yang dibutuhkan**:
1. Ganti semua `user_id` → `requester_id`
2. Ganti semua `friend_id` → `addressee_id`
3. Ganti relationship `->user` → `->requester`
4. Ganti relationship `->friend` → `->addressee`
5. Update query di `index()`, `requests()`, `accept()`, `decline()`, `remove()`

### 3.2 FeedController — Column & Table Reference Mismatch (CRASH)

**File**: `app/Http/Controllers/Api/FeedController.php`

**Masalah 1**: Controller menggunakan `likes_count` tapi kolom di migration adalah `likes`.

```php
// ❌ SALAH
$feedEvent->decrement('likes_count');
$feedEvent->increment('likes_count');
$feedEvent->fresh()->likes_count

// ✅ BENAR
$feedEvent->decrement('likes');
$feedEvent->increment('likes');
$feedEvent->fresh()->likes
```

**Masalah 2**: Controller menggunakan `feed_event_id` di tabel `feed_likes`, tapi migration menggunakan `event_id`.

```php
// ❌ SALAH
DB::table('feed_likes')->where('feed_event_id', $feedEvent->id)

// ✅ BENAR
DB::table('feed_likes')->where('event_id', $feedEvent->id)
```

**Masalah 3**: Controller mencoba `->where('id', $existingLike->id)->delete()` pada `feed_likes`, tapi tabel ini memiliki composite PK `(event_id, user_id)` tanpa kolom `id`.

```php
// ❌ SALAH
DB::table('feed_likes')->where('id', $existingLike->id)->delete();

// ✅ BENAR
DB::table('feed_likes')
    ->where('event_id', $feedEvent->id)
    ->where('user_id', $user->id)
    ->delete();
```

**Masalah 4**: FeedController juga menggunakan `user_id`/`friend_id` di query `friendships` tabel (sama seperti bug FriendController).

```php
// ❌ SALAH (di index method)
$q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
$friendship->user_id === $user->id ? $friendship->friend_id : $friendship->user_id

// ✅ BENAR
$q->where('requester_id', $user->id)->orWhere('addressee_id', $user->id);
$friendship->requester_id === $user->id ? $friendship->addressee_id : $friendship->requester_id
```

### 3.3 FeedEventService — Field Name Mismatch (CRASH)

**File**: `app/Services/FeedEventService.php`

**Masalah**: Service membuat FeedEvent dengan field `message` dan `metadata`, tapi model dan migration menggunakan `event_data` (tanpa field `message`).

```php
// ❌ SALAH
FeedEvent::create([
    'user_id' => $user->id,
    'event_type' => $eventType,
    'message' => $message,      // TIDAK ADA di model/migration
    'metadata' => $metadata,    // Seharusnya 'event_data'
]);

// ✅ BENAR
FeedEvent::create([
    'user_id' => $user->id,
    'event_type' => $eventType,
    'event_data' => array_merge($metadata, ['message' => $message]),
]);
```

---

## 4. Backend Requirements

### 4.1 Controllers & Routes

#### A. StudyRaidController

**File**: `app/Http/Controllers/Api/StudyRaidController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `create` | POST | `/api/v1/raids/create` | Buat raid baru dengan content_id, max_participants, duration |
| `join` | POST | `/api/v1/raids/{code}/join` | Join via invite code |
| `show` | GET | `/api/v1/raids/{id}` | Detail raid + participants |
| `start` | POST | `/api/v1/raids/{id}/start` | Creator only, min 2 peserta |
| `updateProgress` | PATCH | `/api/v1/raids/{id}/progress` | Update progress % per participant |
| `quizComplete` | POST | `/api/v1/raids/{id}/quiz-complete` | Submit quiz result |
| `complete` | POST | `/api/v1/raids/{id}/complete` | Mark self as done |
| `results` | GET | `/api/v1/raids/{id}/results` | Team score, individual scores, rewards |
| `myRaids` | GET | `/api/v1/raids/my-raids` | Active + past raids |

**Validasi**:
- `create`: content_id exist & belongs to user, max_participants 2-7
- `join`: raid status == 'lobby', belum penuh, invite_code valid
- `start`: only creator, min 2 participants, status == 'lobby'
- `updateProgress`: user is participant, raid status == 'active', progress 0-100

#### B. FocusDuelController

**File**: `app/Http/Controllers/Api/FocusDuelController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `challenge` | POST | `/api/v1/duels/challenge` | Challenge user by username + set duration |
| `accept` | POST | `/api/v1/duels/{id}/accept` | Accept challenge |
| `decline` | POST | `/api/v1/duels/{id}/decline` | Decline challenge |
| `start` | POST | `/api/v1/duels/{id}/start` | Both players confirm ready |
| `focusEvent` | PATCH | `/api/v1/duels/{id}/focus-event` | Tab switch/restore events (server timestamp) |
| `complete` | POST | `/api/v1/duels/{id}/complete` | Submit final score |
| `myDuels` | GET | `/api/v1/duels/my-duels` | Active + past duels |

**Validasi**:
- `challenge`: target user exists, bukan diri sendiri, target adalah friend
- `accept`: duel pending, user is opponent
- `start`: duel accepted, user is participant
- `focusEvent`: duel active, event_type in ['tab_switch', 'tab_restored']
- `complete`: duel active, user is participant

#### C. QuizArenaController

**File**: `app/Http/Controllers/Api/QuizArenaController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `create` | POST | `/api/v1/arena/create` | Buat arena dengan content_id, max_players, question_count |
| `join` | POST | `/api/v1/arena/{code}/join` | Join by room code |
| `start` | POST | `/api/v1/arena/{id}/start` | Host only, min 2 players |
| `answer` | POST | `/api/v1/arena/{id}/answer` | Submit answer + timestamp (speed scoring) |
| `results` | GET | `/api/v1/arena/{id}/results` | Final scoreboard |

**Logika Scoring**:
- Base score: 1000 per correct answer
- Speed bonus: 0–500 berdasarkan respons time
- Final rank berdasarkan total_score descending

#### D. LearningRelayController

**File**: `app/Http/Controllers/Api/LearningRelayController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `create` | POST | `/api/v1/relay/create` | Buat relay + auto-split content jadi N sections |
| `join` | POST | `/api/v1/relay/{code}/join` | Join + dapat assigned section |
| `start` | POST | `/api/v1/relay/{id}/start` | Start relay |
| `submitSummary` | POST | `/api/v1/relay/{id}/summary` | Submit section summary |
| `submitQuiz` | POST | `/api/v1/relay/{id}/quiz` | Submit quiz answers (full material) |
| `results` | GET | `/api/v1/relay/{id}/results` | Combined summary + individual results |

**Logika AI**:
- Saat `create`: gunakan Gemini untuk split content menjadi N sections yang equal
- Saat semua summary masuk: merge menjadi `combined_summary`
- Buat collaborative KnowledgeCard

#### E. StudyRoomController

**File**: `app/Http/Controllers/Api/StudyRoomController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `create` | POST | `/api/v1/rooms/create` | name, is_public, music_preset, max_capacity |
| `publicRooms` | GET | `/api/v1/rooms/public` | Browse public rooms (paginated) |
| `join` | POST | `/api/v1/rooms/{code}/join` | Join room |
| `updatePresence` | PATCH | `/api/v1/rooms/{id}/presence` | Update my material + last_active |
| `react` | POST | `/api/v1/rooms/{id}/react` | Send emoji reaction (broadcast via WS) |
| `leave` | POST | `/api/v1/rooms/{id}/leave` | Leave room |
| `close` | DELETE | `/api/v1/rooms/{id}` | Close room (creator only) |

**Logika Real-time**:
- Redis hash untuk real-time presence data
- Cleanup inactive members (>10min no activity)
- Pomodoro timer sync via broadcast
- +10% XP bonus untuk sessions di Study Room

#### F. WeeklyChallengeController

**File**: `app/Http/Controllers/Api/WeeklyChallengeController.php`

| Method | HTTP | Route | Deskripsi |
|---|---|---|---|
| `current` | GET | `/api/v1/challenges/current` | Current week's challenge + user progress |
| `history` | GET | `/api/v1/challenges/history` | Past challenges + user participation |
| `progress` | GET | `/api/v1/challenges/{id}/progress` | Detailed community progress |

**Routes registration** di `routes/api.php`:

```php
// ─── Study Raids ───
Route::prefix('v1/raids')->group(function () {
    Route::post('/create', [StudyRaidController::class, 'create']);
    Route::post('/{code}/join', [StudyRaidController::class, 'join']);
    Route::get('/my-raids', [StudyRaidController::class, 'myRaids']);
    Route::get('/{id}', [StudyRaidController::class, 'show']);
    Route::post('/{id}/start', [StudyRaidController::class, 'start']);
    Route::patch('/{id}/progress', [StudyRaidController::class, 'updateProgress']);
    Route::post('/{id}/quiz-complete', [StudyRaidController::class, 'quizComplete']);
    Route::post('/{id}/complete', [StudyRaidController::class, 'complete']);
    Route::get('/{id}/results', [StudyRaidController::class, 'results']);
});

// ─── Focus Duels ───
Route::prefix('v1/duels')->group(function () {
    Route::post('/challenge', [FocusDuelController::class, 'challenge']);
    Route::get('/my-duels', [FocusDuelController::class, 'myDuels']);
    Route::post('/{id}/accept', [FocusDuelController::class, 'accept']);
    Route::post('/{id}/decline', [FocusDuelController::class, 'decline']);
    Route::post('/{id}/start', [FocusDuelController::class, 'start']);
    Route::patch('/{id}/focus-event', [FocusDuelController::class, 'focusEvent']);
    Route::post('/{id}/complete', [FocusDuelController::class, 'complete']);
});

// ─── Quiz Arena ───
Route::prefix('v1/arena')->group(function () {
    Route::post('/create', [QuizArenaController::class, 'create']);
    Route::post('/{code}/join', [QuizArenaController::class, 'join']);
    Route::post('/{id}/start', [QuizArenaController::class, 'start']);
    Route::post('/{id}/answer', [QuizArenaController::class, 'answer']);
    Route::get('/{id}/results', [QuizArenaController::class, 'results']);
});

// ─── Learning Relay ───
Route::prefix('v1/relay')->group(function () {
    Route::post('/create', [LearningRelayController::class, 'create']);
    Route::post('/{code}/join', [LearningRelayController::class, 'join']);
    Route::post('/{id}/start', [LearningRelayController::class, 'start']);
    Route::post('/{id}/summary', [LearningRelayController::class, 'submitSummary']);
    Route::post('/{id}/quiz', [LearningRelayController::class, 'submitQuiz']);
    Route::get('/{id}/results', [LearningRelayController::class, 'results']);
});

// ─── Study Rooms ───
Route::prefix('v1/rooms')->group(function () {
    Route::post('/create', [StudyRoomController::class, 'create']);
    Route::get('/public', [StudyRoomController::class, 'publicRooms']);
    Route::post('/{code}/join', [StudyRoomController::class, 'join']);
    Route::patch('/{id}/presence', [StudyRoomController::class, 'updatePresence']);
    Route::post('/{id}/react', [StudyRoomController::class, 'react']);
    Route::post('/{id}/leave', [StudyRoomController::class, 'leave']);
    Route::delete('/{id}', [StudyRoomController::class, 'close']);
});

// ─── Weekly Challenges ───
Route::prefix('v1/challenges')->group(function () {
    Route::get('/current', [WeeklyChallengeController::class, 'current']);
    Route::get('/history', [WeeklyChallengeController::class, 'history']);
    Route::get('/{id}/progress', [WeeklyChallengeController::class, 'progress']);
});
```

### 4.2 Services

Setiap controller membutuhkan service class terpisah untuk business logic:

#### A. StudyRaidService

**File**: `app/Services/StudyRaidService.php`

Responsibilities:
- Generate unique invite code (8 chars alphanumeric)
- Validate content belongs to creator
- Calculate `team_score` = average semua participants' quiz scores
- Award XP bonus +50% ke semua participants
- Award special badge jika `team_score > 90%`
- Trigger broadcast events saat progress update / completion
- Create FeedEvent saat raid selesai

#### B. FocusDuelService

**File**: `app/Services/FocusDuelService.php`

Responsibilities:
- Calculate winner: higher `focus_integrity` wins
- Award coins (winner: +30, loser: +15) + XP
- Track `distraction_count` per player dari focus events
- Calculate `focus_integrity` = `(total_focused_time / total_duration) * 100`
- Trigger broadcast events untuk focus events real-time
- Create FeedEvent saat duel selesai
- Anti-toxic: no public W/L record

#### C. QuizArenaService

**File**: `app/Services/QuizArenaService.php`

Responsibilities:
- Generate quiz questions via Gemini API dari content
- Score per question: `base 1000 + speed_bonus (0–500)`
- Speed bonus formula: `max(0, 500 - (response_time_ms / time_per_question_ms * 500))`
- Track live scoreboard
- Determine final ranks
- Award coins: 🥇 +50, 🥈 +30, 🥉 +15; semua: +20 XP
- Broadcast question start + live score updates

#### D. LearningRelayService

**File**: `app/Services/LearningRelayService.php`

Responsibilities:
- AI split content jadi N equal sections (via Gemini)
- Assign sections ke participants berdasarkan join order
- Merge semua summaries setelah semua participant selesai
- Generate `combined_summary` via AI
- Create collaborative KnowledgeCard (`is_collaborative=true`)
- Award XP +40% ke semua participants
- Create FeedEvent saat relay selesai

#### E. StudyRoomService

**File**: `app/Services/StudyRoomService.php`

Responsibilities:
- Generate unique room_code (8 chars)
- Redis hash untuk real-time presence: `study_room:{id}:members`
- Cleanup inactive members (>10 min no activity)
- Pomodoro timer management: 25min study / 5min break cycles
- Broadcast phase changes
- +10% XP bonus untuk learning sessions di room
- XP tracking per room session

#### F. WeeklyChallengeService

**File**: `app/Services/WeeklyChallengeService.php`

Responsibilities:
- `recordContribution(userId, challengeId, value)` — Redis counter + DB update
- `checkAndComplete(challengeId)` — if `current_value >= goal_value`, mark complete + distribute rewards
- Reward distribution: coins + badge + profile frame
- Challenge types: `pages_read`, `focus_integrity`, `materials_completed`, `quiz_perfect`, `streak`

#### G. FeedEventService (FIX EXISTING)

**File**: `app/Services/FeedEventService.php`

Fix field mapping:
- `message` → incorporated into `event_data`
- `metadata` → `event_data`
- Tambah method-method baru:
  - `logRaidComplete(User, StudyRaid)`
  - `logDuelComplete(User, FocusDuel)`
  - `logChallengeComplete(User, CommunityChallenge)`
  - `logAchievementUnlocked(User, Achievement)`
  - `logRankUp(User, newRank)`
  - `logStreakMilestone(User, streakDays)`

### 4.3 Broadcasting (WebSocket)

#### config/broadcasting.php (BUAT BARU)

```php
return [
    'default' => env('BROADCAST_CONNECTION', 'reverb'),
    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST', '127.0.0.1'),
                'port' => env('REVERB_PORT', 8080),
                'scheme' => env('REVERB_SCHEME', 'http'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
        ],
    ],
];
```

#### routes/channels.php (BUAT BARU)

Channel authorization rules:

```php
// Private channels — user must be participant
Broadcast::channel('raid.{raidId}', fn (User $user, string $raidId) => /* user is raid participant */);
Broadcast::channel('duel.{duelId}', fn (User $user, string $duelId) => /* user is challenger or opponent */);
Broadcast::channel('arena.{arenaId}', fn (User $user, string $arenaId) => /* user is arena participant */);
Broadcast::channel('user.{userId}', fn (User $user, string $userId) => $user->id === $userId);

// Presence channel — study room
Broadcast::channel('room.{roomId}', fn (User $user, string $roomId) => /* user is room member, return user data */);
```

#### Broadcast Event Classes (15 total)

Semua harus dibuat di `app/Events/`:

**Study Raid Events:**
1. `RaidMemberProgress` — `private:raid.{raidId}` — data: `{participant_id, progress_percentage}`
2. `RaidChatMessage` — `private:raid.{raidId}` — data: `{user_id, user_name, message}`
3. `RaidCompleted` — `private:raid.{raidId}` — data: `{team_score, individual_scores[], rewards}`

**Focus Duel Events:**
4. `OpponentFocusEvent` — `private:duel.{duelId}` — data: `{event_type, distraction_count, timestamp}`
5. `DuelCompleted` — `private:duel.{duelId}` — data: `{winner_id, challenger_score, opponent_score, rewards}`

**Quiz Arena Events:**
6. `ArenaQuestionStart` — `private:arena.{arenaId}` — data: `{question, options[], timer_start, question_index}`
7. `ArenaScoreUpdate` — `private:arena.{arenaId}` — data: `{scores: [{user_id, total_score, correct_answers}]}`
8. `ArenaCompleted` — `private:arena.{arenaId}` — data: `{podium: [{rank, user_id, score}], rewards}`

**Study Room Events:**
9. `StudyRoomPresenceUpdate` — `presence:room.{roomId}` — data: `{member_id, action, current_material}`
10. `StudyRoomPomodoro` — `presence:room.{roomId}` — data: `{phase, duration, started_at}`
11. `StudyRoomReaction` — `presence:room.{roomId}` — data: `{user_id, emoji}`

**Personal Notifications:**
12. `XPAwarded` — `private:user.{userId}` — data: `{amount, source, new_total, level_up}`
13. `AchievementUnlocked` — `private:user.{userId}` — data: `{achievement_id, title, description, icon}`
14. `StreakAlert` — `private:user.{userId}` — data: `{streak_days, reminder}`
15. `ChallengeGoalReached` — `private:user.{userId}` — data: `{challenge_id, reward_coins, reward_badge}`

### 4.4 Jobs & Schedulers

#### A. ExpirePendingDuelsJob

**File**: `app/Jobs/ExpirePendingDuelsJob.php`

- Run: Scheduled setiap jam
- Logic: Set status 'expired' untuk duels yang pending > 24 jam
- `FocusDuel::where('status', 'pending')->where('expires_at', '<', now())->update(['status' => 'expired'])`

#### B. WeeklyChallengeResetJob

**File**: `app/Jobs/WeeklyChallengeResetJob.php`

- Run: Scheduled setiap Senin jam 00:00
- Logic: Close current challenge, create new challenge for the week
- Distribute rewards untuk challenge yang completed

#### C. CleanupInactiveRoomMembersJob

**File**: `app/Jobs/CleanupInactiveRoomMembersJob.php`

- Run: Scheduled setiap 5 menit
- Logic: Set `is_online = false` untuk members yang `last_active_at < now() - 10 minutes`
- Broadcast presence update untuk room yang affected

**Scheduler Registration** di `app/Console/Kernel.php` atau `routes/console.php`:
```php
Schedule::job(new ExpirePendingDuelsJob)->hourly();
Schedule::job(new WeeklyChallengeResetJob)->weeklyOn(1, '00:00');
Schedule::job(new CleanupInactiveRoomMembersJob)->everyFiveMinutes();
```

---

## 5. Frontend Requirements

### 5.1 Zustand Stores

#### A. socialStore.js

**File**: `frontend/src/stores/socialStore.js`

State & actions untuk Study Raid, Focus Duel, Quiz Arena, dan Learning Relay.

```
State:
- myRaids[], currentRaid, raidLobby
- myDuels[], currentDuel, pendingDuels[]
- myArenas[], currentArena, arenaLiveScore
- myRelays[], currentRelay

Actions:
- Raid: createRaid, joinRaid, startRaid, updateProgress, completeRaid, fetchMyRaids, fetchRaidResults
- Duel: challengeFriend, acceptDuel, declineDuel, startDuel, sendFocusEvent, completeDuel, fetchMyDuels
- Arena: createArena, joinArena, startArena, submitAnswer, fetchArenaResults
- Relay: createRelay, joinRelay, startRelay, submitSummary, submitQuiz, fetchRelayResults
```

#### B. friendStore.js

**File**: `frontend/src/stores/friendStore.js`

```
State:
- friends[], friendRequests[] (incoming + outgoing), searchResults[], loading, error

Actions:
- fetchFriends, fetchRequests, sendFriendRequest, acceptRequest, declineRequest, unfriend, searchUsers
```

#### C. feedStore.js

**File**: `frontend/src/stores/feedStore.js`

```
State:
- feedEvents[], page, hasMore, loading

Actions:
- fetchFeed(page), likeFeedEvent(eventId), refreshFeed
```

#### D. studyRoomStore.js

**File**: `frontend/src/stores/studyRoomStore.js`

```
State:
- publicRooms[], currentRoom, roomMembers[], pomodoroPhase, pomodoroTimer

Actions:
- fetchPublicRooms, createRoom, joinRoom, updatePresence, sendReaction, leaveRoom, closeRoom
```

#### E. challengeStore.js

**File**: `frontend/src/stores/challengeStore.js`

```
State:
- currentChallenge, myContribution, challengeHistory[], loading

Actions:
- fetchCurrentChallenge, fetchChallengeHistory, fetchChallengeProgress
```

### 5.2 WebSocket Service (Laravel Echo + Reverb)

**File**: `frontend/src/services/reverbService.js`

> **PENTING**: Proyek menggunakan Laravel Reverb, BUKAN Socket.IO. Package `socket.io-client` yang terinstall **tidak kompatibel** dengan Reverb. Gunakan **Laravel Echo + Pusher.js** sebagai client karena Reverb mengimplementasi Pusher protocol.

**Dependencies yang dibutuhkan**:
```bash
npm install laravel-echo pusher-js
```

**Dependencies yang bisa dihapus** (tidak kompatibel dengan Reverb):
```bash
npm uninstall socket.io-client
```

**Service architecture**:
```javascript
// reverbService.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function initEcho(token) {
    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT,
        wssPort: import.meta.env.VITE_REVERB_PORT,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
    return echoInstance;
}

export function getEcho() {
    return echoInstance;
}

export function disconnectEcho() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}
```

**Backend broadcasting auth route** perlu ditambahkan:
```php
// routes/api.php atau routes/web.php
Broadcast::routes(['middleware' => [SupabaseAuth::class]]);
```

**Environment variables** (`.env` frontend):
```
VITE_REVERB_APP_KEY=your-reverb-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### 5.3 Custom Hooks (Real-time)

#### A. useRaidSocket.js

```
- Subscribe ke `private:raid.{raidId}`
- Listen: RaidMemberProgress, RaidChatMessage, RaidCompleted
- Auto-update socialStore.raidLobby.progress
- Auto-navigate ke results saat RaidCompleted
- Cleanup: unsubscribe on unmount
```

#### B. useDuelSocket.js

```
- Subscribe ke `private:duel.{duelId}`
- Listen: OpponentFocusEvent, DuelCompleted
- Real-time update opponent's distraction count + focus status
- Auto-navigate ke results saat DuelCompleted
```

#### C. useArenaSocket.js

```
- Subscribe ke `private:arena.{arenaId}`
- Listen: ArenaQuestionStart, ArenaScoreUpdate, ArenaCompleted
- Display question + start timer on ArenaQuestionStart
- Live scoreboard update on ArenaScoreUpdate
- Show podium on ArenaCompleted
```

#### D. useStudyRoomSocket.js

```
- Subscribe ke `presence:room.{roomId}`
- Listen: here (initial members), joining, leaving
- Listen: StudyRoomPresenceUpdate, StudyRoomPomodoro, StudyRoomReaction
- Update member list, pomodoro timer, show floating reactions
```

#### E. useFeedSocket.js

```
- Subscribe ke `private:user.{userId}`
- Listen: new feed events from friends
- Prepend new events ke feedStore.feedEvents
```

#### F. useNotifications.js

```
- Subscribe ke `private:user.{userId}`
- Listen: XPAwarded, AchievementUnlocked, StreakAlert, ChallengeGoalReached
- Show toast notifications
- Update authStore.user XP/level if level_up
```

### 5.4 Halaman & Komponen — Perubahan yang Dibutuhkan

#### CommunityHubPage.jsx

**Current**: Render static activity cards + demo CommunityFeed
**Needed**:
- Fetch real feed via `feedStore.fetchFeed()`
- Fetch current challenge via `challengeStore.fetchCurrentChallenge()`
- Fetch friends online count via `friendStore.fetchFriends()`
- Show real stats (active raids count, pending duels, room count)
- Hook: `useNotifications()` untuk toast

#### StudyRaidsPage.jsx

**Current**: Full demo data — fake raids, fake participants, hardcoded progress
**Needed**:
- Replace semua demo data dengan `socialStore` actions
- `fetchMyRaids()` untuk daftar raids
- `createRaid()` flow: select content → CreateRaidModal → API call
- `joinRaid(code)` → redirect ke lobby
- Lobby: real participant list dari API, `useRaidSocket()` untuk real-time updates
- In-progress: real progress tracking, chat via WebSocket
- Complete: real results dari `fetchRaidResults()`

#### FocusDuelsPage.jsx

**Current**: Static duel UI, hardcoded focus percentages + timers
**Needed**:
- `fetchMyDuels()` untuk pending + active + past duels
- `challengeFriend()` flow: select friend → set duration → API call
- Accept/decline pending duels
- In-progress: `useDuelSocket()` untuk real-time opponent focus events
- Tab visibility API: `document.addEventListener('visibilitychange')` → `sendFocusEvent()`
- Results: real scores + rewards dari API

#### QuizArenaPage.jsx

**Current**: Static host/join UI, no game logic
**Needed**:
- `createArena()` + `joinArena(code)` flows
- Lobby: real participant list
- In-progress: `useArenaSocket()` untuk question delivery + live scoreboard
- Fullscreen question UI: 30s countdown, 4 answer buttons, speed feedback
- `submitAnswer()` per question
- Podium: animated results dari `fetchArenaResults()`

#### StudyRoomsPage.jsx

**Current**: Static room browser, hardcoded member list + pomodoro
**Needed**:
- `fetchPublicRooms()` untuk room browser (paginated)
- `createRoom()` + `joinRoom(code)` flows
- In-room: `useStudyRoomSocket()` untuk presence + pomodoro sync
- `updatePresence()` periodik (setiap 30 detik)
- Emoji reactions: `sendReaction()` + floating emoji display
- Pomodoro timer synced via WebSocket
- Music preset UI (lo-fi/classical/nature/silence) — audio playback lokal
- `leaveRoom()` on navigate away / unmount

#### LearningRelayPage.jsx

**Current**: Static how-it-works + hardcoded past relays
**Needed**:
- `createRelay()` flow: select content → split preview
- `joinRelay(code)` → get assigned section
- Section reading → summary writing UI
- `submitSummary()` for own section
- Progress: see which participants have completed
- Quiz phase: take quiz on full material
- `submitQuiz()` → results
- Results: combined summary + individual scores + collaborative KnowledgeCard

#### Komponen-komponen yang perlu direfactor:

| Komponen | Perubahan |
|---|---|
| CommunityFeed | Ganti demo fallback → `feedStore`, real API call, real like toggle |
| FriendsList | Ganti demo fallback → `friendStore`, real online status |
| AddFriendModal | Sudah call API — pastikan column name fix di backend |
| ChallengeDuelModal | Connect ke `socialStore.challengeFriend()` |
| DuelInProgress | Connect ke `useDuelSocket()`, real focus tracking via Visibility API |
| DuelResults | Display real data dari `socialStore.currentDuel` |
| PendingDuels | Fetch real pending duels, accept/decline via API |
| CreateRaidModal | Connect ke `socialStore.createRaid()`, content selector |
| RaidLobby | Real participant list + `useRaidSocket()` |
| RaidInProgress | Real progress + chat via WebSocket |
| RaidComplete | Real results dari API |
| StudyRoomBrowser | Real rooms dari `studyRoomStore.publicRooms` |
| StudyRoomView | Real presence via `useStudyRoomSocket()` |
| ChallengeWidget | Real data dari `challengeStore` |
| ChallengeCompleteBanner | Trigger dari WebSocket event |
| FriendRequestNotification | Real-time via `useNotifications()` |
| UserMiniCard | Real user data, online status dari presence |

---

## 6. Per-Feature Breakdown

### 6.1 Study Raid

**Flow**: Create → Share Code → Join (lobby) → Start → Read Material → Quiz → Complete → Results

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `study_raids`, `raid_participants` |
| Model | ✅ | `StudyRaid.php` with relationships |
| Controller | ❌ | 9 endpoint belum ada |
| Service | ❌ | Business logic belum ada |
| API Routes | ❌ | Belum terdaftar |
| Broadcast Events | ❌ | 3 events (Progress, Chat, Completed) |
| Frontend Store | ❌ | Raid state di `socialStore` |
| Frontend Hook | ❌ | `useRaidSocket` |
| Frontend Pages | ⚠️ | Ada tapi demo data |
| Frontend Components | ⚠️ | Ada tapi demo data |

### 6.2 Focus Duel

**Flow**: Challenge Friend → Accept → Start Timer → Study (track focus) → Time's Up → Results

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `focus_duels` |
| Model | ✅ | `FocusDuel.php` with relationships |
| Controller | ❌ | 7 endpoint belum ada |
| Service | ❌ | Focus integrity calculation belum ada |
| API Routes | ❌ | Belum terdaftar |
| Broadcast Events | ❌ | 2 events (FocusEvent, Completed) |
| Frontend Store | ❌ | Duel state di `socialStore` |
| Frontend Hook | ❌ | `useDuelSocket` |
| Frontend Pages | ⚠️ | Ada tapi demo data |
| Frontend Components | ⚠️ | Ada tapi demo data |

**Catatan khusus**: Butuh Page Visibility API integration di frontend untuk deteksi tab switch:
```javascript
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        socialStore.sendFocusEvent(duelId, 'tab_switch');
    } else {
        socialStore.sendFocusEvent(duelId, 'tab_restored');
    }
});
```

### 6.3 Quiz Arena

**Flow**: Create Room → Share Code → Join → Start → Questions (30s each) → Scoreboard → Podium

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `quiz_arenas`, `arena_participants` |
| Model | ✅ | `QuizArena.php` with relationships |
| Controller | ❌ | 5 endpoint belum ada |
| Service | ❌ | AI quiz generation + speed scoring belum ada |
| API Routes | ❌ | Belum terdaftar |
| Broadcast Events | ❌ | 3 events (QuestionStart, ScoreUpdate, Completed) |
| Frontend Store | ❌ | Arena state di `socialStore` |
| Frontend Hook | ❌ | `useArenaSocket` |
| Frontend Pages | ⚠️ | Ada tapi demo data |

**Catatan khusus**: QuizArenaService perlu integrasi dengan Gemini API untuk generate "game-show style" questions berdasarkan learning content.

### 6.4 Learning Relay

**Flow**: Create → Split Content (AI) → Join → Assign Sections → Read & Summarize → Merge → Quiz → Results

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `learning_relays`, `relay_participants` |
| Model | ✅ | `LearningRelay.php` with relationships |
| Controller | ❌ | 6 endpoint belum ada |
| Service | ❌ | AI content splitting + summary merging belum ada |
| API Routes | ❌ | Belum terdaftar |
| Broadcast Events | ❌ | Bisa pakai polling atau tambah relay-specific events |
| Frontend Store | ❌ | Relay state di `socialStore` |
| Frontend Pages | ⚠️ | Ada tapi demo data |

**Catatan khusus**: 
- AI integration untuk split content jadi N equal sections
- AI integration untuk merge summaries
- Creates collaborative KnowledgeCard

### 6.5 Study Room

**Flow**: Create/Browse → Join → Study Together → Pomodoro Sync → Reactions → Leave

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `study_rooms`, `study_room_members` |
| Model | ✅ | `StudyRoom.php` with relationships |
| Controller | ❌ | 7 endpoint belum ada |
| Service | ❌ | Redis presence, pomodoro sync belum ada |
| API Routes | ❌ | Belum terdaftar |
| Broadcast Events | ❌ | 3 events (Presence, Pomodoro, Reaction) |
| Frontend Store | ❌ | `studyRoomStore` |
| Frontend Hook | ❌ | `useStudyRoomSocket` |
| Frontend Pages | ⚠️ | Ada tapi demo data |
| Frontend Components | ⚠️ | Ada tapi demo data |

**Catatan khusus**:
- Presence channel (bukan private) untuk member join/leave awareness
- Redis hash untuk real-time presence tracking
- Pomodoro timer harus synced across all members
- Audio playback untuk music presets (lo-fi, classical, nature, silence) — file audio atau streaming

### 6.6 Weekly Community Challenge

**Flow**: View Current Challenge → Contribute via Regular Activity → Community Progress → Goal Reached → Rewards

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `community_challenges`, `challenge_contributions` |
| Model | ✅ | `CommunityChallenge.php` with relationships |
| Controller | ❌ | 3 endpoint belum ada |
| Service | ❌ | Contribution tracking, reward distribution belum ada |
| API Routes | ❌ | Belum terdaftar |
| Scheduled Job | ❌ | `WeeklyChallengeResetJob` belum ada |
| Frontend Store | ❌ | `challengeStore` |
| Frontend Components | ⚠️ | ChallengeWidget ada tapi demo data |

**Catatan khusus**:
- Contributions auto-tracked dari regular learning activity (tidak manual)
- Perlu hook points di SessionController (complete), quiz submissions, dll
- Challenge seeding: bisa manual atau auto-generated per minggu

### 6.7 Community Feed

**Flow**: Automatic Events → Feed Display → Like/Unlike

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `feed_events`, `feed_likes` |
| Model | ✅ | `FeedEvent.php` |
| Controller | ⚠️ BUG | `FeedController.php` — 4 bugs (lihat Section 3) |
| Service | ⚠️ BUG | `FeedEventService.php` — field mismatch |
| API Routes | ✅ | Sudah terdaftar di `api.php` |
| Frontend Components | ⚠️ | `CommunityFeed` ada, punya call API tapi fallback ke demo |
| Frontend Store | ❌ | `feedStore` belum ada |

**Perlu diperbaiki**:
1. Fix FeedController bugs (4 issues)
2. Fix FeedEventService field mapping
3. Buat feedStore
4. Integrasikan CommunityFeed component dengan feedStore

### 6.8 Friends System

**Flow**: Search User → Send Request → Accept/Decline → Friends List → Online Status

| Layer | Status | Detail |
|---|---|---|
| DB Tables | ✅ | `friendships` |
| Model | ✅ | `Friendship.php` |
| Controller | ⚠️ BUG | `FriendController.php` — column name mismatch |
| API Routes | ✅ | Sudah terdaftar di `api.php` |
| Frontend Components | ⚠️ | FriendsList + AddFriendModal ada, API calls tapi controller crash |
| Frontend Store | ❌ | `friendStore` belum ada |

**Perlu diperbaiki**:
1. Fix FriendController column names (requester_id/addressee_id)
2. Fix relationship names (requester/addressee)
3. Buat friendStore
4. Integrasikan components dengan friendStore

---

## 7. Database & Infrastructure

### 7.1 Tables — Semua Sudah Ada ✅

Tidak perlu migration baru. Semua 13 tabel sudah defined:

| Tabel | Migration |
|---|---|
| `study_raids` | ✅ |
| `raid_participants` | ✅ |
| `focus_duels` | ✅ |
| `quiz_arenas` | ✅ |
| `arena_participants` | ✅ |
| `learning_relays` | ✅ |
| `relay_participants` | ✅ |
| `study_rooms` | ✅ |
| `study_room_members` | ✅ |
| `community_challenges` | ✅ |
| `challenge_contributions` | ✅ |
| `friendships` | ✅ |
| `feed_events` + `feed_likes` | ✅ |

### 7.2 Redis Requirements

| Key Pattern | Purpose |
|---|---|
| `study_room:{id}:members` | Real-time presence hash |
| `study_room:{id}:pomodoro` | Pomodoro timer state |
| `challenge:{id}:contributions` | Fast contribution counter |
| `duel:{id}:focus` | Live focus event tracking |

Redis sudah dikonfigurasi untuk cache + queue + sessions. Perlu pastikan Redis juga jalan sebagai data store untuk presence.

### 7.3 Laravel Reverb Setup

**Status**: `config/reverb.php` ✅ sudah ada, tapi:
- `config/broadcasting.php` ❌ BELUM ADA
- `routes/channels.php` ❌ BELUM ADA
- `BroadcastServiceProvider` perlu di-register (atau pastikan `App\Providers\BroadcastServiceProvider` ada)

**Yang perlu dilakukan**:
1. Buat `config/broadcasting.php`
2. Buat `routes/channels.php` dengan channel authorization
3. Pastikan `BROADCAST_CONNECTION=reverb` di `.env`
4. Pastikan `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_APP_ID` di `.env`
5. Register broadcasting service provider di `bootstrap/providers.php`
6. Tambah broadcasting auth route

### 7.4 Frontend Dependencies

**Install**:
```bash
cd frontend
npm install laravel-echo pusher-js
```

**Uninstall** (tidak kompatibel dengan Reverb):
```bash
npm uninstall socket.io-client
```

**Environment variables** (`.env` frontend):
```
VITE_REVERB_APP_KEY=
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

---

## 8. Prioritas Implementasi

### Phase 1: Foundation & Bug Fixes (WAJIB DULUAN)

1. **Fix FriendController** — column name mismatch → crash
2. **Fix FeedController** — 4 bugs → crash
3. **Fix FeedEventService** — field mismatch → crash
4. **Setup Broadcasting**:
   - Buat `config/broadcasting.php`
   - Buat `routes/channels.php`
   - Register BroadcastServiceProvider
   - Broadcast auth route
5. **Frontend Foundation**:
   - Install `laravel-echo` + `pusher-js`
   - Buat `reverbService.js` (Echo client)
   - Buat `friendStore.js`
   - Buat `feedStore.js`
   - Connect CommunityFeed + FriendsList ke real API
6. **Buat `useNotifications` hook** — personal WebSocket channel

### Phase 2: Simpler Real-time Features

7. **Study Room** (most straightforward real-time):
   - StudyRoomController + StudyRoomService
   - Routes registration
   - `studyRoomStore.js`
   - `useStudyRoomSocket` hook
   - Refactor StudyRoomsPage + components
   - Broadcast events: Presence, Pomodoro, Reaction

8. **Focus Duel** (1v1, simpler than group):
   - FocusDuelController + FocusDuelService
   - Routes registration
   - Duel state di `socialStore.js`
   - `useDuelSocket` hook
   - Refactor FocusDuelsPage + components
   - Page Visibility API integration
   - Broadcast events: OpponentFocusEvent, DuelCompleted

9. **Weekly Challenge** (read-only, no real-time):
   - WeeklyChallengeController + WeeklyChallengeService
   - Routes registration
   - `challengeStore.js`
   - `WeeklyChallengeResetJob`
   - Refactor ChallengeWidget component

### Phase 3: Complex Group Features

10. **Study Raid** (group, multi-step):
    - StudyRaidController + StudyRaidService
    - Routes registration
    - Raid state di `socialStore.js`
    - `useRaidSocket` hook
    - Refactor StudyRaidsPage + components
    - Broadcast events: Progress, Chat, Completed
    - `ExpirePendingDuelsJob` (shared scheduler concept)

11. **Quiz Arena** (timed, competitive):
    - QuizArenaController + QuizArenaService
    - Routes registration
    - Arena state di `socialStore.js`
    - `useArenaSocket` hook
    - Refactor QuizArenaPage
    - Gemini AI quiz generation integration
    - Broadcast events: QuestionStart, ScoreUpdate, Completed

12. **Learning Relay** (most complex):
    - LearningRelayController + LearningRelayService
    - Routes registration
    - Relay state di `socialStore.js`
    - Refactor LearningRelayPage
    - Gemini AI integration: content splitting + summary merging
    - Collaborative KnowledgeCard creation

### Phase 4: Polish & Integration

13. Hook auto feed event creation ke semua social activities
14. `CleanupInactiveRoomMembersJob`
15. XP bonus integration (raid +50%, relay +40%, room +10%)
16. Achievement triggers dari social activities
17. End-to-end testing semua flows

---

> **Total estimasi file baru**: ~30 files (6 controllers, 6 services, 15 events, 3 jobs, 5 stores, 1 service, 6 hooks, 2 config files)  
> **Total file yang perlu di-fix**: 3 backend + 23 frontend (6 pages + 17 components)
