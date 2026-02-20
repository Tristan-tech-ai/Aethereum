# AETHEREUM — Development Checklist v2.0

> **Tech Stack:** Laravel 12 + React 18 + PostgreSQL + Redis + Recharts  
> **Timeline:** 8 Weeks (Competition)  
> **Last Updated:** February 2026  
> **Version:** 2.0 — Knowledge Profile System + Social Learning Modes  
> **Key Change:** Phase 5 (3D City Viewer) → Phase 5 (Knowledge Profile & Gamification System)

---


## Priority Legend

> ✅ **P0** — Must Have (MVP for Competition)  
> ⚠️ **P1** — Should Have (Enhances Experience)  
> 🔮 **P2** — Could Have (Post-Competition)  
> ❌ **P3** — Won't Have (Out of Scope)

---

## Phases Overview

| Phase | Fokus | Dev Utama | Week Target |
|-------|-------|-----------|-------------|
| Phase 0 | Pre-Development Setup | Semua | Week 0 |
| Phase 1 | Infrastructure & Environment | Sanjaya, Tristan | Week 1 |
| Phase 2 | Authentication & User Management | Bima, Candra | Week 1–2 |
| Phase 3 | Content Upload & AI Analysis | Bima, Arief | Week 2 |
| Phase 4 | Document Dungeon — Core Learning Flow | Bima, Candra | Week 3–4 |
| **Phase 5** | **Knowledge Profile & Gamification System** | **Candra, Bima** | **Week 4–5** |
| Phase 6 | Focus Coins Economy & Profile Shop | Bima, Candra | Week 5 |
| Phase 7 | Public Profile, Social Discovery & Feed | Candra, Dinda | Week 5–6 |
| Phase 8 | Social Learning Modes — Study Raid & Focus Duel | Bima, Dinda | Week 6 |
| Phase 9 | Social Learning Modes — Quiz Arena, Relay, Room, Challenge | Bima, Dinda | Week 7 |
| Phase 10 | Additional Learning Flows | Bima, Candra | Week 6–7 (if time) |
| Phase 11 | WebSocket & Real-Time | Arief, Dinda | Week 6 |
| Phase 12 | Security & Anti-Cheating | Arief, Bima | Week 7 |
| Phase 13 | Testing & QA | Eka, Semua | Week 7–8 |
| Phase 14 | Deployment & Competition Prep | Arief, Eka | Week 8 |

---

## Phase 0: Pre-Development Setup

### 0.1 Project Planning 
- [ ] Finalize & distribute team roles sesuai tabel di atas
- [ ] Set up Discord server dengan channels: #general, #backend, #frontend, #design, #bugs, #daily-standup
- [ ] Create project timeline with weekly milestones (Notion / Trello / GitHub Projects)
- [ ] Review PRD v2.0 dengan seluruh team members
- [ ] Identify P0 (MVP) features vs P1/P2
- [ ] Agree on code style guide (ESLint + Prettier for JS, PHP CS Fixer for Laravel)

### 0.2 Repository & Version Control 
- [ ] Create GitHub organization & repository (monorepo: `/backend`, `/frontend`)
- [ ] Set up branch strategy: `main`, `develop`, `feature/*`, `hotfix/*`
- [ ] Create `.gitignore` untuk Laravel + React (Vite)
- [ ] Write `README.md` dengan project overview, setup instructions, dan architecture diagram
- [ ] Set up PR template (description, checklist, screenshots)
- [ ] Enable branch protection on `main` (require PR + 1 reviewer)
- [ ] Create issue labels: `bug`, `feature`, `p0`, `p1`, `backend`, `frontend`, `ai`, `social`

### 0.3 Design Assets `[christian dan abi]`
- [ ] Finalize color palette & design tokens (dark theme, violet primary) → update `tailwind.config.js`
- [ ] Create icon set (Lucide React + custom emoji icons untuk subjects)
- [ ] Import typography (Google Fonts: Inter for body, Outfit/Space Grotesk for headings)
- [ ] Design wireframes di Figma untuk key screens:
  - [ ] Landing / Onboarding
  - [ ] Dashboard / Home
  - [ ] Content Upload Modal
  - [ ] Document Dungeon (reading + quiz)
  - [ ] **Knowledge Profile Page** (heatmap + cards + achievements) ← NEW
  - [ ] **Knowledge Card Component** (semua tier: Bronze/Silver/Gold/Diamond) ← NEW
  - [ ] **Social Hub** (raids, duels, rooms) ← NEW
  - [ ] Public Profile Page (shareable)
- [ ] Design Shareable Profile Card template (1200×630px)
- [ ] Create logo, favicon, & OG image assets
- [ ] ~~Source/create 3D building models~~ ← REMOVED

### 0.4 External Service Accounts `[tristan]`
- [ ] Google Cloud Console — Gemini 2.0 Flash API key (`GEMINI_API_KEY`)
- [ ] Google Cloud Console — OAuth 2.0 Client ID & Secret
- [ ] Jina Reader API — account & API key (web scraping)
- [ ] Vercel — account untuk frontend hosting
- [ ] Railway.app — account untuk backend hosting + PostgreSQL + Redis
- [ ] Email service (SendGrid / Mailgun) — verification emails
- [ ] ~~Meshy.ai~~ ← REMOVED (no 3D model generation needed)

---

## Phase 1: Infrastructure & Environment

### 1.1 Backend Setup (Laravel 12) `[snajaya]`
- [ ] Install Laravel 12 via Composer (`composer create-project laravel/laravel backend`)
- [ ] Configure `.env` (APP_KEY, APP_URL, debug settings)
- [ ] Install & configure PostgreSQL driver (`pdo_pgsql`)
- [ ] Set `DB_CONNECTION=pgsql` dan connect ke local / Railway PostgreSQL
- [ ] Install & configure Redis (`predis/predis`)
- [ ] Set `CACHE_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`
- [ ] Install Laravel Sanctum (`composer require laravel/sanctum`)
- [ ] Publish Sanctum config & migration
- [ ] Install Laravel Reverb (`composer require laravel/reverb`) untuk WebSocket social modes
- [ ] Install Socialite (`composer require laravel/socialite`) untuk Google OAuth
- [ ] Configure CORS (`config/cors.php`) untuk frontend origin
- [ ] Set up rate limiting middleware (60 req/min authenticated, 10/min guest)
- [ ] Create base API response trait (`ApiResponse`) — success, error, paginated formats
- [ ] Configure file storage (local untuk dev, S3-compatible untuk prod)
- [ ] Set up queue worker (`php artisan queue:work`)
- [ ] Create `HealthController` → `GET /api/health` (untuk deployment verification)

### 1.2 Frontend Setup (React 18 + Vite) `[sanjaya]`
- [ ] Create Vite React project (`npm create vite@latest frontend -- --template react`)
- [ ] Install core dependencies:
  - [ ] `react-router-dom` v6+
  - [ ] `zustand` (state management)
  - [ ] `axios` (HTTP client)
  - [ ] `tailwindcss` + `postcss` + `autoprefixer`
  - [ ] `recharts` (analytics charts & heatmap)
  - [ ] `react-hook-form` (forms)
  - [ ] `framer-motion` (animations)
  - [ ] `lucide-react` (icons)
  - [ ] `date-fns` (date utilities)
  - [ ] `socket.io-client` (WebSocket untuk social modes)
  - [ ] `react-markdown` (content rendering)
  - [ ] `html2canvas` (generate shareable profile card PNG)
  - [ ] ~~`@react-three/fiber`~~ ← REMOVED
  - [ ] ~~`three`~~ ← REMOVED
- [ ] Configure Tailwind CSS dengan custom design tokens (dark theme, violet palette)
- [ ] Set up Axios instance dengan base URL, auth interceptor, 401 handler
- [ ] Set up React Router dengan full route structure
- [ ] Create folder structure:
  ```
  src/
  ├─ components/
  │   ├─ ui/           (Button, Input, Modal, Card...)
  │   ├─ profile/      (KnowledgeCard, Heatmap, LevelBadge...)
  │   ├─ social/       (RaidLobby, DuelView, ArenaRoom, StudyRoom...)
  │   ├─ learning/     (QuestMap, ReadingView, QuizBattle...)
  │   └─ layout/       (Navbar, Sidebar, Footer...)
  ├─ pages/            (Dashboard, Profile, Explore, Social, Library...)
  ├─ stores/           (authStore, profileStore, socialStore, contentStore)
  ├─ services/         (api.js, socketService.js)
  ├─ hooks/            (useAuth, useProfile, useSocialLearning...)
  └─ contexts/
  ```
- [ ] Set up environment variables (`VITE_API_URL`, `VITE_WS_URL`)

### 1.3 Database Schema `[tristan]`
- [ ] Create migration: `users` (UUID PK, email, password, username, avatar, bio, xp, level, rank, streak fields, privacy settings, OAuth, timestamps)
- [ ] Create migration: `learning_contents` (UUID, user FK, content info, AI analysis JSONB, structured_sections JSONB, status)
- [ ] Create migration: `learning_sessions` (UUID, user FK, content FK, session config, time tracking, focus metrics, quiz performance, rewards, status)
- [ ] Create migration: `quizzes` + `quiz_attempts` (quiz questions JSONB, attempts, scoring)
- [ ] Create migration: `user_wallets` + `coin_transactions` (balance, daily caps, transaction log)
- [ ] **NEW** Create migration: `knowledge_cards` (UUID, user FK, content FK, session FK, title, subject, mastery %, tier, summary_snippet, keywords JSONB, is_pinned, is_collaborative, collaborators JSONB, decay fields)
- [ ] **NEW** Create migration: `xp_events` (UUID, user FK, xp_amount, source, level_before, level_after, timestamps)
- [ ] **NEW** Create migration: `achievements` (id, name, description, icon, trigger_condition JSONB)
- [ ] **NEW** Create migration: `user_achievements` (user FK, achievement FK, awarded_at, is_featured)
- [ ] Create migration: `study_raids` (UUID, creator FK, content FK, invite_code, status, results)
- [ ] Create migration: `raid_participants` (raid FK, user FK, progress, quiz_score, rewards, status)
- [ ] Create migration: `focus_duels` (UUID, challenger FK, opponent FK, duration, status, results)
- [ ] **NEW** Create migration: `quiz_arenas` (UUID, host FK, content FK, room_code, config, status)
- [ ] **NEW** Create migration: `arena_participants` (arena FK, user FK, score, rank, rewards)
- [ ] **NEW** Create migration: `learning_relays` (UUID, creator FK, content FK, invite_code, status)
- [ ] **NEW** Create migration: `relay_participants` (relay FK, user FK, section_index, summary, quiz_score)
- [ ] **NEW** Create migration: `study_rooms` (UUID, creator FK, name, room_code, is_public, music_preset, pomodoro fields)
- [ ] **NEW** Create migration: `study_room_members` (room FK, user FK, presence data, current_material)
- [ ] **NEW** Create migration: `community_challenges` (UUID, title, challenge_type, goal_value, timing, rewards)
- [ ] **NEW** Create migration: `challenge_contributions` (challenge FK, user FK, contribution_value, reward_claimed)
- [ ] **NEW** Create migration: `friendships` (requester FK, addressee FK, status)
- [ ] **NEW** Create migration: `feed_events` (UUID, user FK, event_type, event_data JSONB, likes)
- [ ] **NEW** Create migration: `feed_likes` (event FK, user FK)
- [ ] ~~Create migration: `buildings`~~ ← REMOVED (replaced by knowledge_cards)
- [ ] ~~Create migration: `decorations`~~ ← REMOVED
- [ ] ~~Create migration: `city_visits`~~ ← REMOVED
- [ ] ~~Create migration: `building_likes`~~ ← REMOVED
- [ ] ~~Create migration: `building_comments`~~ ← REMOVED
- [ ] Run all migrations (`php artisan migrate`)
- [ ] Create database indexes (sesuai PRD v2.0 — idx_cards_pinned, idx_xp_events_date, dll)
- [ ] Create database triggers (update_user_last_learning, reset_coin_limits)
- [ ] Create Eloquent Models dengan relationships untuk semua tables
- [ ] Create Model Factories untuk semua tables (seeding & testing)
- [ ] Create Database Seeders (impressive demo data: profiles level 30+, multiple cards, active raids)

### 1.4 DevOps & CI/CD `[tristan]`
- [ ] Create `Dockerfile` untuk Laravel backend (PHP 8.3-alpine)
- [ ] Create `docker-compose.yml` untuk local dev (PHP, PostgreSQL, Redis)
- [ ] Set up GitHub Actions (`.github/workflows/deploy.yml`):
  - [ ] Frontend: `npm ci` → test → build → deploy to Vercel
  - [ ] Backend: `composer install` → test → deploy to Railway
- [ ] Create `vercel.json` (routes, caching config, SPA fallback)
- [ ] Set up environment variables pada Vercel & Railway
- [ ] Verify auto-deploy on push to `main`

---

## Phase 2: Authentication & User Management

### 2.1 Backend Auth `[tristan]`
- [ ] Create `AuthController` dengan methods: `register`, `login`, `logout`, `user`
- [ ] Implement email + password registration dengan validation
- [ ] Auto-create `UserWallet` on registration (100 coin welcome bonus)
- [ ] Auto-generate unique `username` dari name (e.g., "Andi Pratama" → "andi_pratama")
- [ ] Implement login dengan Sanctum token generation
- [ ] Implement logout (revoke token)
- [ ] Implement `GET /api/v1/auth/user` — return full profile + wallet + stats
- [ ] Set up Google OAuth via Socialite (redirect + callback)
- [ ] Implement email verification (P1)
- [ ] Implement password reset flow (P1)
- [ ] Create `ProfileController` — update name, bio, avatar, username, privacy settings, leaderboard opt-in toggle
- [ ] Add avatar upload (resize + crop to 256×256)
- [ ] Implement session persistence (7-day token expiry)

### 2.2 Frontend Auth `[christian]`
- [ ] Create `authStore` (Zustand) dengan `user`, `token`, `login`, `register`, `logout`, `loading`
- [ ] Create `api.js` — Axios instance dengan token injection & 401 handling
- [ ] Build Login page (email + password form, Google OAuth button)
- [ ] Build Register page (name, email, password, confirm password)
- [ ] Build Google OAuth redirect handler
- [ ] Implement protected routes (redirect ke login jika unauthenticated)
- [ ] Store token di `localStorage`, auto-check auth on app load
- [ ] Build Profile Settings page (name, username, bio, avatar upload, privacy toggles)
- [ ] Loading states & error handling untuk semua auth flows

### 2.3 Auth API Routes `[tristan]`
- [ ] `POST /api/v1/auth/register`
- [ ] `POST /api/v1/auth/login`
- [ ] `POST /api/v1/auth/logout`
- [ ] `GET /api/v1/auth/user`
- [ ] `GET /api/v1/auth/google/redirect`
- [ ] `GET /api/v1/auth/google/callback`
- [ ] `PUT /api/v1/auth/profile`
- [ ] `POST /api/v1/auth/avatar`
- [ ] `PATCH /api/v1/auth/settings` (privacy, leaderboard opt-in, weekly_goal)

---

## Phase 3: Content Upload & AI Analysis

### 3.1 Backend — Content Upload `[sanjaya]`
- [ ] Create `ContentController` dengan upload / url / list / show / delete methods
- [ ] `POST /api/v1/content/upload` — handle multipart (PDF, image, PPTX)
  - [ ] Validate file type & size (max 20MB)
  - [ ] Store file ke disk (local dev) / S3 (prod)
  - [ ] Create `learning_contents` record dengan status `processing`
  - [ ] Dispatch `AnalyzeContentJob` to queue
- [ ] `POST /api/v1/content/url` — handle YouTube & web article URLs
  - [ ] Validate URL format & detect content type
  - [ ] Create record & dispatch job
- [ ] `GET /api/v1/content/{id}` — return content dengan status (polling)
- [ ] `GET /api/v1/content` — list user's contents (paginated, filterable by subject/type)
- [ ] `DELETE /api/v1/content/{id}` — delete content + related files + cards

### 3.2 Backend — AI Services `[tristan]`
- [ ] Create `GeminiService` — wrapper untuk Gemini 2.0 Flash API
  - [ ] `analyzeContent(text, contentType)` — classify & structure content
  - [ ] `generateQuiz(section, difficulty, numQuestions)` — create quiz questions
  - [ ] `validateSummary(original, userSummary)` — score user's summary
  - [ ] **NEW** `generateKnowledgeCardMeta(title, summary, quizTopics)` — subject_icon, color, keywords
  - [ ] **NEW** `generateArenaQuestions(content, numQuestions)` — fun, game-show style questions
  - [ ] Error handling, retry logic (max 3), rate limit awareness
- [ ] Create `YouTubeService`
  - [ ] `getTranscript(videoUrl)` — extract transcript
  - [ ] `extractKeyMoments(transcript)` — identify checkpoints via Gemini
  - [ ] `extractVideoId(url)` — parse YouTube URL
- [ ] Create `WebScraperService`
  - [ ] `extractArticle(url)` — clean text via Jina Reader API
  - [ ] `fallbackScrape(url)` — basic HTML scraping fallback
- [ ] Create `ContentAnalysisService` — orchestrator
  - [ ] Route ke extractor berdasarkan content type
  - [ ] Extract text dari PDF (`smalot/pdfparser`)
  - [ ] Send ke Gemini untuk analysis
  - [ ] Parse response → update `learning_contents`
  - [ ] Set status ke `ready` atau `failed`

### 3.3 Backend — Queue Jobs `[sanjaya]`
- [ ] Create `AnalyzeContentJob` — async AI processing
  - [ ] Extract text by content type
  - [ ] Call `ContentAnalysisService`
  - [ ] Update content status & structured_sections
  - [ ] Handle failures gracefully (retry 3x, then mark failed)
- [ ] Create `GenerateQuizJob` — background quiz creation per section
- [ ] **NEW** Create `ProcessKnowledgeCardJob` — after session complete: create card, award XP, check achievements

### 3.4 Frontend — Content Upload `christian dan abi`
- [ ] Build Upload Modal/Page:
  - [ ] Drag-and-drop zone untuk files (PDF, image, PPTX)
  - [ ] URL input field (YouTube / web article) dengan auto-detection
  - [ ] Title input (optional, auto-filled by AI)
  - [ ] Upload progress indicator
- [ ] Build Content Library page:
  - [ ] Grid/list view of user's contents
  - [ ] Status badges: processing / ready / failed
  - [ ] Filter by subject category, content type
  - [ ] Delete option
- [ ] Implement polling untuk processing status (setiap 3 detik hingga `ready`)
- [ ] Build content detail view (sections, metadata, estimated duration)

---

## Phase 4: Document Dungeon — Core Learning Flow

### 4.1 Backend — Learning Sessions `[sanjaya]`
- [ ] Create `LearningFlowService`
  - [ ] `selectFlow(content)` — route to correct flow based on content type
  - [ ] `configureDocumentDungeon(content)` — config untuk PDF flow
- [ ] Create `SessionController`
  - [ ] `POST /api/v1/sessions/start` — create session, return content + first section
  - [ ] `PATCH /api/v1/sessions/{id}/progress` — update section, send focus events
  - [ ] `POST /api/v1/sessions/{id}/quiz-attempt` — submit & grade quiz
  - [ ] `POST /api/v1/sessions/{id}/validate-summary` — AI validate user summary
  - [ ] `POST /api/v1/sessions/{id}/complete` — finish session, trigger `ProcessKnowledgeCardJob`
- [ ] Create `FocusTrackerService`
  - [ ] Calculate `focus_integrity` dari distraction events
  - [ ] Track `tab_switches`, `distraction_count`, `active_time`
- [ ] Create `QuizGeneratorService`
  - [ ] Generate quiz via Gemini jika belum ada
  - [ ] Grade quiz attempt & calculate score
  - [ ] Pass/fail threshold: 70%

### 4.2 Backend — Knowledge Card & XP System `tristan`
- [ ] Create `KnowledgeProfileService`
  - [ ] `processSessionCompletion(session)` — orchestrate card + XP + achievements
  - [ ] `calculateMastery(session)` — weighted: quiz 40% + focus 30% + summary 30%
  - [ ] `determineTier(mastery)` — Bronze/Silver/Gold/Diamond
  - [ ] `awardXP(user, breakdown)` — update xp, check level up, store xp_event
  - [ ] `checkLevelUp(user)` — update level, rank, trigger celebration event
  - [ ] `checkAchievements(user, session, card)` — auto-award earned badges
- [ ] Create `CoinEconomyService`
  - [ ] `awardSessionCoins(session)` — calculate & award coins
  - [ ] Coin formula: `base(10) + focusBonus + quizBonus + streakMultiplier`
  - [ ] Enforce daily cap (500 coins/day)
  - [ ] Create transaction record, update wallet balance
- [ ] Create `StreakService`
  - [ ] Update `current_streak` on daily learning
  - [ ] Update `longest_streak` if exceeded
  - [ ] Reset streak if day missed (check daily via scheduler)
  - [ ] Handle streak freeze usage
  - [ ] Award streak milestone rewards (coins + badges at 7/30/90/365 days)
- [ ] Create `AchievementService`
  - [ ] Seed achievement definitions (`achievements` table)
  - [ ] `checkAndAward(user, trigger, context)` — check all applicable achievements
  - [ ] Create `user_achievements` record
  - [ ] Dispatch feed event (rank up, achievement earned)

### 4.3 Frontend — Document Dungeon Flow `christian dan abi`
- [ ] Build **Quest Map** component
  - [ ] Visual section layout (5–7 sections sebagai nodes)
  - [ ] Section states: locked / current / completed
  - [ ] Progress bar (sections completed / total)
  - [ ] Section click → enter reading interface
- [ ] Build **Reading Interface** component
  - [ ] Clean markdown rendering (`react-markdown`)
  - [ ] Focus timer display (countdown / countup)
  - [ ] Focus health indicator (3 hearts — lose 1 per tab switch)
  - [ ] Tab switch detection (`visibilitychange` event)
  - [ ] Warning overlay on distraction
  - [ ] "I'm Done Reading" button (visible after min reading time)
  - [ ] Send focus events to backend periodically (every 30s)
- [ ] Build **Quiz / Guardian Battle** component
  - [ ] Question display dengan multiple choice options
  - [ ] Question navigation (1/5, 2/5...)
  - [ ] Timer per question (2 min)
  - [ ] Answer selection dengan visual feedback
  - [ ] Submit quiz → show results (pass/fail animation)
  - [ ] Detailed feedback per wrong answer
  - [ ] Retry button jika fail (cooldown 5 min)
- [ ] Build **Summary Creation** component
  - [ ] Textarea (min 100 chars)
  - [ ] "Check with AI" button → AI feedback (completeness, accuracy, clarity)
  - [ ] Missing concepts list
  - [ ] "Submit & Complete" button (only jika AI approved)
- [ ] Build **Session Complete / Reward** screen (see Phase 5.4)

---

## Phase 5: Knowledge Profile & Gamification System ← *(Replaces Phase 5: 3D City Viewer)*

> **Catatan:** Phase ini menggantikan seluruh Phase 5 (3D City Viewer) dari versi sebelumnya.  
> Three.js, React Three Fiber, GLB models, shader, LOD, impostor, grid system — **semua dihapus.**

### 5.1 Backend — Knowledge Profile `sanjaya`
- [ ] Buat `ProfileController`
  - [ ] `GET /api/v1/profile/me` — full profile (user, wallet, pinned cards, achievements, heatmap summary)
  - [ ] `GET /api/v1/profile/{username}` — public profile (403 jika private)
  - [ ] `GET /api/v1/profile/me/heatmap` — learning activity data 52 weeks × 7 days
  - [ ] `GET /api/v1/profile/me/cards` — all cards (paginated, filter by tier/subject/pinned)
  - [ ] `POST /api/v1/profile/me/cards/{id}/pin` — pin card (max 6)
  - [ ] `DELETE /api/v1/profile/me/cards/{id}/pin` — unpin card
  - [ ] `GET /api/v1/profile/me/achievements` — all unlocked achievements
  - [ ] `GET /api/v1/profile/me/xp-history` — XP event log (for charts)
  - [ ] `POST /api/v1/profile/me/share-card/generate` — generate shareable card PNG
- [ ] Buat `KnowledgeCardController`
  - [ ] Card detail endpoint
  - [ ] Card likes / unlike
  - [ ] Card integrity decay scheduler (`artisan cards:decay-integrity`, daily)
- [ ] Buat `LeaderboardController`
  - [ ] `GET /api/v1/leaderboards/focus` — Focus Champions (weekly, opt-in)
  - [ ] `GET /api/v1/leaderboards/knowledge` — Knowledge Collectors (weekly)
  - [ ] `GET /api/v1/leaderboards/streak` — Streak Warriors (rolling)
  - [ ] `GET /api/v1/leaderboards/quiz` — Quiz Masters (weekly)
  - [ ] `GET /api/v1/leaderboards/subject/{subject}` — per-subject
  - [ ] Materialized views / Redis sorted sets untuk leaderboard performance
  - [ ] Scheduled weekly reset setiap Senin via artisan scheduler

### 5.2 Frontend — Learning Heatmap `abi`
- [ ] Build `LearningHeatmap` component
  - [ ] 52 columns (weeks) × 7 rows (days) CSS grid
  - [ ] Color intensity: 5 levels (none → low → medium → high → max)
  - [ ] Tooltip on hover: date, session count, total minutes
  - [ ] View toggle: 3 months / 6 months / 1 year
  - [ ] Responsive (collapsible on mobile)
  - [ ] Legend (color scale)
- [ ] Hook `useHeatmapData` — fetch & transform backend data ke 52×7 grid format
- [ ] CSS variables untuk heat colors (matching brand dark theme)

### 5.3 Frontend — XP & Level System `christian`
- [ ] Build `LevelBadge` component
  - [ ] Circular progress ring (CSS or SVG)
  - [ ] Current level number di tengah
  - [ ] Rank name dan rank color sesuai level
  - [ ] XP progress bar (current / next level)
  - [ ] Rank icon (emoji) displayed prominently
- [ ] Build `XPNotification` — animated popup saat XP diterima
  - [ ] "+20 XP — Section Complete!"
  - [ ] Floating animation, auto-dismiss 3s
- [ ] Build `LevelUpCelebration` — full-screen animation saat level naik
  - [ ] Confetti / particle burst (Framer Motion)
  - [ ] New level number displayed
  - [ ] Rank-up announcement jika rank berubah
- [ ] Build `XPHistoryChart` — line chart (Recharts) XP per hari, 30/90 hari
- [ ] Hook `useXPSystem` — real-time XP tracking, optimistic updates

### 5.4 Frontend — Knowledge Cards `abi dan christian`
- [ ] Build `KnowledgeCard` component (semua variants)
  - [ ] **Bronze:** amber border, no glow
  - [ ] **Silver:** gray border, subtle silver glow
  - [ ] **Gold:** yellow border, animated shimmer glow (CSS keyframe)
  - [ ] **Diamond:** gradient border (purple/blue/pink), sparkle particles (CSS)
  - [ ] Card contents: subject icon, title, category, mastery %, tier badge, quiz/focus/time stats
  - [ ] Hover: scale-105, deeper glow
  - [ ] Click: expand to full card detail modal
- [ ] Build `KnowledgeCardGrid` — 2/3/6 column responsive grid
  - [ ] Pin card interaction (drag to pin, or context menu)
  - [ ] Pin indicator (📌 icon on pinned cards)
  - [ ] "View All" pagination / infinite scroll
- [ ] Build `CardDetailModal`
  - [ ] Full card info
  - [ ] Full summary text
  - [ ] Keywords chips
  - [ ] Timeline (created date, last reviewed)
  - [ ] "Review This Material" button (restart session)
  - [ ] Like button + count
- [ ] Build `SessionCompleteScreen` (reward display setelah session selesai)
  - [ ] Animated card reveal (card flips in from nothing)
  - [ ] Card tier reveal animation (Bronze → Silver → Gold → Diamond suspense)
  - [ ] XP breakdown display
  - [ ] Coins earned
  - [ ] New achievements (jika ada)
  - [ ] Streak update
  - [ ] CTAs: "Share Profile" / "Continue Learning" / "View Profile"

### 5.5 Frontend — Streak System `christian`
- [ ] Build `StreakDisplay` component
  - [ ] Flame icon 🔥 + streak number
  - [ ] Streak status: active / at-risk (belajar hari ini?) / broken
  - [ ] Weekly goal progress bar (X/5 days this week)
  - [ ] Streak freeze button (jika tersedia)
- [ ] Build `StreakMilestoneModal` — celebration saat 7/30/90/365 hari
  - [ ] Achievement badge reveal
  - [ ] Coins reward display
  - [ ] "Share your streak!" CTA
- [ ] Streak reminder logic: jika belum belajar hari ini, tampilkan warning di navbar

### 5.6 Frontend — Achievement Badges `abi`
- [ ] Build `AchievementBadge` component
  - [ ] Locked state (grayscale, blurred)
  - [ ] Unlocked state (full color, glowing)
  - [ ] Tooltip: achievement name + description + unlocked date
- [ ] Build `AchievementGrid` — gallery semua badges (locked/unlocked)
  - [ ] Filter by category (learning / social / streak / special)
- [ ] Build `AchievementUnlockAnimation`
  - [ ] Slide-in notification dari kanan: "Achievement Unlocked: Quiz Master! 💯"
  - [ ] Auto-dismiss setelah 5s, click untuk detail

### 5.7 Frontend — Learning Analytics Dashboard `tristan`
- [ ] Build `AnalyticsDashboard` tab di Profile page:
  - [ ] **Overview cards:** total sessions, total XP, avg focus integrity, materials completed
  - [ ] **XP Progress Chart** (Recharts LineChart) — 30/90 hari XP trend
  - [ ] **Subject Breakdown** (Recharts PieChart) — distribusi materials per subject
  - [ ] **Focus Integrity Trend** (Recharts AreaChart) — per week
  - [ ] **Best Study Hours** (Recharts custom heatmap) — hour-of-day vs day-of-week
  - [ ] **Quiz Performance** (Recharts BarChart) — avg score per subject
  - [ ] Date range selector (1W / 1M / 3M / All Time)

### 5.8 Frontend — Shareable Profile Card `abi dan christian`
- [ ] Build `ProfileCardGenerator` — canvas-based PNG generator
  - [ ] Template 1200×630px dengan brand design
  - [ ] Contains: avatar, username, rank badge, level, top 3 cards mini-view, streak, heatmap summary bricks
  - [ ] Using `html2canvas` untuk capture DOM → PNG
- [ ] Build `ShareModal`
  - [ ] Preview profile card
  - [ ] Download PNG button
  - [ ] Share buttons: copy link, WhatsApp, Twitter, Instagram (download + manual share)
- [ ] Backend: `POST /api/v1/profile/me/share-card/generate` → store PNG, return URL

---

## Phase 6: Focus Coins Economy & Profile Shop

### 6.1 Backend — Economy `[tristan]`
- [ ] `GET /api/v1/wallet` — current balance, totals, daily limit info
- [ ] `GET /api/v1/wallet/transactions` — paginated transaction history
- [ ] `GET /api/v1/shop/items` — list available profile items (frames, colors, icons)
- [ ] `POST /api/v1/shop/items/purchase` — buy item, deduct coins
- [ ] `POST /api/v1/profile/me/equip` — equip purchased item (frame, color, etc.)
- [ ] Implement coin earning sources: focus session, perfect quiz, daily login, streak milestones, raid/duel/arena completion
- [ ] Implement spending: profile frames, username colors, exclusive badges, profile customizations
- [ ] ~~Decoration shop~~ ← REPLACED by profile customization shop

### 6.2 Frontend — Economy `[christian]`
- [ ] Build `WalletDisplay` (header/navbar coin balance dengan coin icon)
- [ ] Build `TransactionHistory` page (paginated log dengan source labels)
- [ ] Build **Profile Shop** page (replaces Decoration Shop):
  - [ ] Category tabs: Profile Frames / Username Colors / Exclusive Icons / Special Titles
  - [ ] Item cards dengan preview, name, cost
  - [ ] Equipped indicator
  - [ ] Purchase flow dengan confirmation modal
  - [ ] Insufficient balance warning

---

## Phase 7: Public Profile, Social Discovery & Community Feed

### 7.1 Backend — Social Discovery `sanjaya`
- [ ] Create `ExploreController`
  - [ ] `GET /api/v1/explore/trending` — users dengan most XP gained week ini
  - [ ] `GET /api/v1/explore/rising-stars` — new users dengan high XP growth rate
  - [ ] `GET /api/v1/explore/hall-of-sages` — all Sage-rank users
  - [ ] `GET /api/v1/explore/by-subject/{subject}` — top learners per subject (public profile only)
- [ ] Create `FeedController`
  - [ ] `GET /api/v1/feed` — community feed (friends + global, reverse chronological)
  - [ ] `POST /api/v1/feed/{id}/like` — like a feed event
  - [ ] Auto-create feed events dari: rank up, achievement unlock, streak milestone, raid/challenge complete
- [ ] Create `FriendController`
  - [ ] `POST /api/v1/friends/request/{username}` — send friend request
  - [ ] `POST /api/v1/friends/accept/{id}` — accept
  - [ ] `POST /api/v1/friends/decline/{id}` — decline
  - [ ] `DELETE /api/v1/friends/{id}` — unfriend
  - [ ] `GET /api/v1/friends` — friends list dengan online/learning status
  - [ ] `GET /api/v1/friends/requests` — pending friend requests
- [ ] Create `SearchController`
  - [ ] `GET /api/v1/users/search?q={query}` — search by username, name
- [ ] Track profile visits (`profile_visits` table or Redis counter)

### 7.2 Frontend — Explore Page `abi dan christian`
- [ ] Build `ExplorePage`
  - [ ] **Trending Learners** section — top 10 cards dengan XP earned this week
  - [ ] **Rising Stars** section — new users, animated growth indicator
  - [ ] **Hall of Sages** — showcase of elite users
  - [ ] **Top by Subject** — tabs per subject dengan top 5 learners
  - [ ] Search bar → navigate ke search results
- [ ] Build `UserMiniCard` — compact user preview (avatar, username, level, rank, top subject)
  - [ ] "Add Friend" button
  - [ ] "Challenge to Duel" button
  - [ ] Click → navigate to public profile

### 7.3 Frontend — Community Feed `christian`
- [ ] Build `CommunityFeed` component (used in Social Hub page)
  - [ ] Feed timeline (reverse chrono)
  - [ ] Per event type: custom icon + message template
    - [ ] 🎓 Rank-up event
    - [ ] 🏅 Achievement unlocked event
    - [ ] 🔥 Streak milestone event
    - [ ] ⚔️ Raid completed event
    - [ ] 🎯 Challenge contributed event
    - [ ] 💎 Diamond card earned event
  - [ ] Like button per event (❤️ + count)
  - [ ] Load more / infinite scroll
- [ ] Feed notification dot di navbar jika ada unread events

### 7.4 Frontend — Friends System `abi`
- [ ] Build `FriendsList` page / sidebar
  - [ ] Online indicator (green dot)
  - [ ] "Currently learning: [material name]" status
  - [ ] Mini-profile popover on hover
  - [ ] Quick action buttons: Challenge Duel / Invite to Raid
- [ ] Build `FriendRequest` notifications (badge on navbar)
- [ ] Build `AddFriendModal` — search + send request

---

## Phase 8: Social Learning Modes — Study Raid & Focus Duel (P0)

### 8.1 Backend — Study Raid `tristan`
- [ ] Create `StudyRaidController`
  - [ ] `POST /api/v1/raids/create` — create raid dengan content_id + max_participants
  - [ ] `POST /api/v1/raids/{code}/join` — join via invite code
  - [ ] `GET /api/v1/raids/{id}` — get raid detail dengan participants
  - [ ] `POST /api/v1/raids/{id}/start` — start (creator only, min 2 participants)
  - [ ] `PATCH /api/v1/raids/{id}/progress` — update progress % per participant
  - [ ] `POST /api/v1/raids/{id}/quiz-complete` — submit quiz result
  - [ ] `POST /api/v1/raids/{id}/complete` — mark self as done
  - [ ] `GET /api/v1/raids/{id}/results` — team score, individual scores, rewards
  - [ ] `GET /api/v1/raids/my-raids` — active + past raids
  - [ ] Calculate team_score = avg of all participants' quiz scores
  - [ ] Award XP bonus +50% to all participants
  - [ ] Award special badge jika team_score > 90%
- [ ] Create `StudyRaidService`
  - [ ] Validate content belongs to creator
  - [ ] Generate unique invite code (8 chars)
  - [ ] Broadcast progress updates to all participants via Reverb

### 8.2 Backend — Focus Duel `sanjaya`
- [ ] Create `FocusDuelController`
  - [ ] `POST /api/v1/duels/challenge` — challenge user by username, set duration
  - [ ] `POST /api/v1/duels/{id}/accept` — accept challenge
  - [ ] `POST /api/v1/duels/{id}/decline` — decline
  - [ ] `POST /api/v1/duels/{id}/start` — both players confirm ready
  - [ ] `PATCH /api/v1/duels/{id}/focus-event` — send tab switch / restore events (server timestamps)
  - [ ] `POST /api/v1/duels/{id}/complete` — both players submit final score
  - [ ] `GET /api/v1/duels/my-duels` — active + past duels
  - [ ] Calculate winner: higher focus_integrity wins
  - [ ] Award coins (winner: +30, loser: +15) + XP
  - [ ] Auto-expire pending challenges after 24h (scheduler)
  - [ ] Anti-toxic: no public W/L record, only `total_duels_completed`

### 8.3 Frontend — Study Raid UI `christian`
- [ ] Build `CreateRaidModal`
  - [ ] Select content dari library
  - [ ] Set max participants (2–5)
  - [ ] Copy invite code / share link
- [ ] Build `RaidLobby`
  - [ ] List of participants dengan avatar + status
  - [ ] "Start Raid" button (creator, min 2 players)
  - [ ] Invite code display (copyable)
  - [ ] Leave button
- [ ] Build `RaidInProgress` view
  - [ ] **Shared progress bar** (team % completion)
  - [ ] **Individual progress per member** (nama + %)
  - [ ] Team chat sidebar (text only, persistent)
  - [ ] Timer (jika ada duration limit)
  - [ ] My learning content embedded (same reading interface as Document Dungeon)
- [ ] Build `RaidComplete` screen
  - [ ] Team score display
  - [ ] Individual scores + XP earned
  - [ ] Achievement check (>90% team score)
  - [ ] "Share Result" button

### 8.4 Frontend — Focus Duel UI `abi`
- [ ] Build `ChallengeDuelModal`
  - [ ] Select friend / enter username
  - [ ] Choose duration: 25min / 50min / 90min
  - [ ] Send challenge CTA
- [ ] Build `PendingDuels` notification (in Social Hub)
  - [ ] Accept / Decline buttons
  - [ ] Challenger info + duration
- [ ] Build `DuelInProgress` view
  - [ ] My focus timer + health hearts
  - [ ] Opponent status panel:
    - [ ] Green: "Focused 💪" / Red: "Distracted! 💀"
    - [ ] Distraction count: "Opponent switched tabs 3x"
  - [ ] Real-time update via WebSocket
- [ ] Build `DuelResults` screen
  - [ ] Winner announcement (tasteful, not rubbing it in)
  - [ ] Both scores displayed
  - [ ] "Good Game!" mutual prompt
  - [ ] XP + coins earned

---

## Phase 9: Social Learning Modes — Quiz Arena, Learning Relay, Study Room, Weekly Challenge (P1)

### 9.1 Backend — Quiz Arena `tristan`
- [ ] Create `QuizArenaController`
  - [ ] `POST /api/v1/arena/create` — create room dengan content_id, max_players, question_count
  - [ ] `POST /api/v1/arena/{code}/join` — join by room code
  - [ ] `POST /api/v1/arena/{id}/start` — start (host only, min 2)
  - [ ] `POST /api/v1/arena/{id}/answer` — submit answer dengan timestamp (speed scoring)
  - [ ] `GET /api/v1/arena/{id}/results` — final scoreboard
- [ ] `QuizArenaService`
  - [ ] Generate "game-show style" questions via Gemini
  - [ ] Score: base 1000 + speed bonus (0–500 based on response time)
  - [ ] Broadcast question start, live scoreboard updates via Reverb
  - [ ] Award coins: 🥇 +50, 🥈 +30, 🥉 +15; all: +20 XP

### 9.2 Backend — Learning Relay `tristan`
- [ ] Create `LearningRelayController`
  - [ ] `POST /api/v1/relay/create` — create + auto-split content into N sections
  - [ ] `POST /api/v1/relay/{code}/join` — join + get assigned section
  - [ ] `POST /api/v1/relay/{id}/start` — start relay
  - [ ] `POST /api/v1/relay/{id}/summary` — submit section summary
  - [ ] `POST /api/v1/relay/{id}/quiz` — submit quiz answers (full material)
  - [ ] `GET /api/v1/relay/{id}/results` — combined summary + individual results
- [ ] `LearningRelayService`
  - [ ] AI split material into N equal sections
  - [ ] Merge all summaries after everyone finishes
  - [ ] Create shared `KnowledgeCard` with `is_collaborative=true` + collaborators list
  - [ ] Award XP +40% to all participants

### 9.3 Backend — Study Room `sanjaya`
- [ ] Create `StudyRoomController`
  - [ ] `POST /api/v1/rooms/create` — create room (name, public/private, music, capacity)
  - [ ] `GET /api/v1/rooms/public` — browse public rooms (paginated)
  - [ ] `POST /api/v1/rooms/{code}/join` — join room
  - [ ] `PATCH /api/v1/rooms/{id}/presence` — update my material + last_active
  - [ ] `POST /api/v1/rooms/{id}/react` — send emoji reaction (broadcast via WS)
  - [ ] `POST /api/v1/rooms/{id}/leave` — leave room
  - [ ] `DELETE /api/v1/rooms/{id}` — close room (creator only)
- [ ] `StudyRoomService`
  - [ ] Redis hash untuk real-time presence data
  - [ ] Cleanup inactive members (>10min no activity)
  - [ ] Pomodoro timer sync (broadcast phase changes via Reverb)
  - [ ] Award +10% XP bonus for sessions done inside Study Room

### 9.4 Backend — Weekly Community Challenge `sanjaya`
- [ ] Create `WeeklyChallengeController`
  - [ ] `GET /api/v1/challenges/current` — current week's challenge + progress
  - [ ] `GET /api/v1/challenges/history` — past challenges + user participation
  - [ ] `GET /api/v1/challenges/{id}/progress` — detailed community progress
  - [ ] Auto-track contributions via events (session complete, quiz perfect, etc.)
- [ ] `WeeklyChallengeService`
  - [ ] `recordContribution(userId, challengeId, value)` — Redis counter + DB
  - [ ] `checkAndComplete(challengeId)` — if goal reached, mark complete, distribute rewards
  - [ ] Seed weekly challenge data (manual curated atau auto-generated)
  - [ ] Schedule: new challenge setiap Senin pagi (`WeeklyChallengeResetJob`)

### 9.5 Frontend — Quiz Arena UI `christian`
- [ ] Build `CreateArenaModal` (content, players, question count)
- [ ] Build `ArenaLobby` (list players, room code, start button)
- [ ] Build `ArenaGame` view:
  - [ ] Full-screen question display
  - [ ] Countdown timer bar (30s, color changes red as time runs out)
  - [ ] 4 answer options (A/B/C/D)
  - [ ] Speed indicator ("Fast!" if answered in < 5s)
  - [ ] Live scoreboard sidebar (updates every answer)
- [ ] Build `ArenaPodium` screen:
  - [ ] 🥇🥈🥉 podium animation
  - [ ] All players scores
  - [ ] XP + coins breakdown

### 9.6 Frontend — Learning Relay UI `christian`
- [ ] Build `CreateRelayModal` (content, max participants)
- [ ] Build `RelayLobby` (invite code, assigned sections per person)
- [ ] Build `RelayInProgress` (my assigned section only + progress tracker of team)
- [ ] Build `RelaySummaryPhase` (read all teammates' summaries before quiz)
- [ ] Build `RelayResults` (combined summary, individual scores, shared card reveal)

### 9.7 Frontend — Study Room UI `abi`
- [ ] Build `StudyRoomBrowser` (list public rooms dengan capacity, subject tag, music type)
- [ ] Build `StudyRoomView`
  - [ ] Participant list (nama + current material + timer)
  - [ ] Pomodoro timer (shared, shows phase: study/break)
  - [ ] Emoji reaction bar (🔥❤️👍👊) — reactions float across screen briefly
  - [ ] Music player (lo-fi stream or preset, mute toggle)
  - [ ] My status update (input: "Currently studying...")
  - [ ] Leave room button

### 9.8 Frontend — Weekly Challenge UI `abi`
- [ ] Build `ChallengeWidget` di Dashboard/Homepage
  - [ ] Challenge title + description
  - [ ] Community progress bar (X of Y goal)
  - [ ] "Your contribution: Z pages / sessions / etc."
  - [ ] Time remaining (Monday reset countdown)
- [ ] Build `ChallengePage` (full detail, leaderboard of top contributors, rewards preview)
- [ ] Build `ChallengeCompleteBanner` (celebration jika goal tercapai — broadcast ke semua active users)

---

## Phase 10: Additional Learning Flows (P1)

### 10.1 Interactive Theater (YouTube) `tristan dan christian`
- [ ] YouTube embedded player dengan API controls
- [ ] Auto-pause pada checkpoint timestamps (dari Gemini analysis)
- [ ] Treasure chest questions saat video pause
- [ ] Transcript sidebar alongside video
- [ ] Progress tracking per checkpoint
- [ ] Complete → Knowledge Card created (same as Document Dungeon)

### 10.2 Scout & Conquer (Web Articles) `[sanjaya dan abi`
- [ ] Clean reader view via Jina Reader API
- [ ] Progressive reveal (sections unlocked sequentially)
- [ ] Inline annotation tools (highlight, note)
- [ ] Per-section quizzes
- [ ] Complete → Knowledge Card

### 10.3 Visual Quest (Images/Infographics) `sanjaya dan abi`
- [ ] Interactive hotspot system (click zones on image)
- [ ] OCR text extraction (Tesseract.js client-side)
- [ ] Guided exploration flow
- [ ] Quiz validation

### 10.4 Presentation Arena (PPT) `tristan dan christian`
- [ ] Slide-by-slide guided walkthrough
- [ ] Speaker notes display
- [ ] Per-slide comprehension checks
- [ ] Summary creation at end

---

## Phase 11: WebSocket & Real-Time

### 11.1 Backend — Laravel Reverb `tristan dan sanjaya`
- [ ] Configure Laravel Reverb WebSocket server
- [ ] Define broadcasting channels:
  - [ ] `private:raid.{raidId}` — raid progress + chat
  - [ ] `private:duel.{duelId}` — duel focus events
  - [ ] `private:arena.{arenaId}` — quiz questions, live scoreboard
  - [ ] `presence:room.{roomId}` — study room presence (join/leave/update)
  - [ ] `private:user.{userId}` — personal notifications
- [ ] Create Broadcast Events:
  - [ ] `RaidMemberProgress` (participant_id, progress %)
  - [ ] `RaidChatMessage` (user, message)
  - [ ] `RaidCompleted` (team_score, individual_scores)
  - [ ] `OpponentFocusEvent` (event_type: tab_switch/restored, distraction_count)
  - [ ] `DuelCompleted` (winner_id, scores, rewards)
  - [ ] `ArenaQuestionStart` (question, options, timer_start)
  - [ ] `ArenaScoreUpdate` (all player scores live)
  - [ ] `ArenaCompleted` (final podium)
  - [ ] `StudyRoomPresenceUpdate` (member presence changes)
  - [ ] `StudyRoomPomodoro` (phase, duration)
  - [ ] `StudyRoomReaction` (user, emoji)
  - [ ] `XPAwarded` (amount, source, new_total, level_up?)
  - [ ] `AchievementUnlocked` (achievement data)
  - [ ] `StreakAlert` (daily reminder)
  - [ ] `ChallengeGoalReached` (challenge_id, reward data)
- [ ] WebSocket authentication via Sanctum


### 11.2 Frontend — Socket.io Client `christian dan abi`
- [ ] Set up Socket.io client dengan auth token
- [ ] Create `socketService.js` — singleton connection manager
- [ ] Auto-reconnection logic dengan exponential backoff
- [ ] Hooks:
  - [ ] `useRaidSocket(raidId)` — raid events
  - [ ] `useDuelSocket(duelId)` — duel events
  - [ ] `useArenaSocket(arenaId)` — arena events
  - [ ] `useStudyRoomSocket(roomId)` — presence events
  - [ ] `useUserNotifications()` — XP, achievements, alerts
- [ ] Fallback ke HTTP polling jika WebSocket gagal
- [ ] Disconnect on unmount (prevent memory leaks)

---

## Phase 12: Security & Anti-Cheating `sanjaya dan tristan`

### 12.1 Input Validation & Security 
- [ ] Server-side validation pada semua API endpoints (Laravel FormRequests)
- [ ] XSS prevention (sanitize user inputs — summaries, bio, chat)
- [ ] SQL injection prevention (parameterized queries via Eloquent)
- [ ] CSRF protection (Sanctum)
- [ ] File upload validation (type, size, virus scan)
- [ ] Rate limiting pada semua endpoints
- [ ] CORS restricted ke frontend domain only

### 12.2 Anti-Cheat Measures 
- [ ] Tab switch detection (`visibilitychange`) → reduces focus integrity
- [ ] Minimum reading time validation server-side (based on section word count)
- [ ] Quiz randomization (shuffle questions & options setiap attempt)
- [ ] Quiz cooldown (5-min cooldown sebelum retry)
- [ ] Focus session duration validation (server timestamp vs client)
- [ ] Coin earning daily/weekly caps (500/day)
- [ ] Summary quality check (min 100 chars + AI coherence score ≥40%)
- [ ] XP earning caps per session
- [ ] **Raid:** Each participant graded independently — no score sharing
- [ ] **Duel:** Focus integrity calculated server-side dari real tab events
- [ ] **Arena:** Answer submission timestamp validated server-side

### 12.3 Data Privacy 
- [ ] Privacy policy page
- [ ] Profile public/private toggle (default: public)
- [ ] Leaderboard opt-in toggle (default: off)
- [ ] User data export endpoint
- [ ] Account deletion flow (cascade all user data)

---

## Phase 13: Testing & QA `semua anggota, tristan, sanjaya, abi, christian`

### 13.1 Backend Tests (PHPUnit) 
- [ ] **Unit Tests:**
  - [ ] `KnowledgeProfileServiceTest` — mastery calculation, tier determination, XP award, level up
  - [ ] `AchievementServiceTest` — trigger conditions, award logic, no duplicates
  - [ ] `StreakServiceTest` — increment, reset, freeze, milestone rewards
  - [ ] `CoinEconomyServiceTest` — earn, spend, daily cap, insufficient balance
  - [ ] `FocusTrackerServiceTest` — integrity calculation from tab events
  - [ ] `GeminiServiceTest` — mock API responses for all prompt types
  - [ ] ~~`BuildingConstructionServiceTest`~~ ← REMOVED
- [ ] **Feature/Integration Tests:**
  - [ ] Auth flow (register → login → profile → logout)
  - [ ] Content upload & AI processing flow
  - [ ] Complete learning session flow → Knowledge Card created + XP awarded
  - [ ] Coin economy flow (earn → purchase → balance)
  - [ ] Study Raid flow (create → join → start → complete → rewards)
  - [ ] Focus Duel flow (challenge → accept → start → focus events → complete → winner)
  - [ ] Quiz Arena flow (create → join → start → answers → scoreboard)
  - [ ] Learning Relay flow (create → join → sections → summaries → quiz → shared card)
  - [ ] Study Room flow (create → join → presence → leave)
  - [ ] Weekly Challenge contribution tracking
  - [ ] Leaderboard opt-in + weekly reset
  - [ ] Achievement unlocking conditions
  - [ ] Public profile access (public vs private)

### 13.2 Frontend Tests (Jest + React Testing Library) 
- [ ] Component tests:
  - [ ] `KnowledgeCard` — tier rendering, mastery bar, hover states
  - [ ] `LearningHeatmap` — grid rendering, intensity levels, tooltips
  - [ ] `LevelBadge` — XP progress, rank color, level number
  - [ ] `AchievementBadge` — locked/unlocked states
  - [ ] `FocusTimer` — start, tab detection, heart loss
  - [ ] `QuizBattle` — answer selection, submit, pass/fail
  - [ ] `SummaryCreation` — input, AI validation, submit
  - [ ] `DuelInProgress` — opponent status display
- [ ] Integration tests:
  - [ ] Auth flow (login → dashboard)
  - [ ] Upload → library → start session → card revealed
  - [ ] Profile page rendering (heatmap + cards + achievements)

### 13.3 E2E Tests (Cypress) 
- [ ] Full learning flow (upload → learn → quiz → summary → card revealed → XP gained)
- [ ] Auth flow (register → login → profile setup → logout)
- [ ] Knowledge Profile flow (pin card, view achievements, heatmap)
- [ ] Social flow (send duel challenge → accept → complete)
- [ ] Study Raid flow (create → invite → start → progress → complete)
- [ ] Public profile flow (share link → visit → view cards)
- [ ] Shop flow (view items → purchase → equip)

### 13.4 Performance Testing 
- [ ] Lighthouse audit (target score >90 — no Three.js, jauh lebih mudah!)
- [ ] Profile page render time (<500ms)
- [ ] Heatmap render time (<100ms untuk 52×7 grid)
- [ ] API response time (<200ms untuk most endpoints)
- [ ] AI response time (<10s untuk content analysis)
- [ ] WebSocket latency (<100ms untuk social mode events)
- [ ] Load testing (100 concurrent users, terutama Study Room presence)

### 13.5 Cross-Browser & Device Testing 
- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop + iOS)
- [ ] Edge (Desktop)
- [ ] Android Chrome
- [ ] Test pada low-end device (2GB RAM) — harus tetap smooth tanpa WebGL

---

## Phase 14: Deployment & Competition Prep `semua anggota, tristan, sanjaya, abi, christian`

### 14.1 Pre-Launch Checklist `[Arief + Eka]`
- [ ] Semua P0 features working end-to-end
- [ ] Demo data seeded:
  - [ ] 3 demo users (level 30+, multiple cards, active streaks)
  - [ ] Mix of Bronze/Silver/Gold/Diamond cards
  - [ ] Active Study Raid dengan 3 participants
  - [ ] Recent community feed events
  - [ ] Weekly Challenge in progress (60% to goal)
- [ ] Demo user account ready untuk presentation
- [ ] Semua environment variables set di production
- [ ] Database migrations run di production
- [ ] HTTPS/SSL verified
- [ ] CORS configuration verified
- [ ] Error monitoring set up (Sentry atau similar)
- [ ] Queue worker running di production
- [ ] WebSocket server running (Reverb) di production

### 14.2 Competition Prep (Week 8) `[Eka + Semua]`
- [ ] Code freeze (2 hari sebelum demo)
- [ ] Bug bash — fix all critical/high bugs
- [ ] Demo script written dan rehearsed oleh seluruh team
- [ ] Backup demo video recorded (jika live demo gagal)
- [ ] Fallback slides prepared
- [ ] FAQ prepared (10+ anticipated judge questions):
  - [ ] "Kenapa tidak 3D city lagi?" → Performance risk too high, Knowledge Profile lebih kaya fitur
  - [ ] "Bagaimana prevent cheating?" → Server-side validation, tab tracking, quiz randomization
  - [ ] "Bagaimana AI digunakan?" → Content analysis, quiz gen, summary validation, card metadata
  - [ ] "Scaling untuk ribuan users?" → Redis caching, queue workers, horizontal scaling
  - [ ] "Monetization plan?" → Focus Coins premium bundles, educator dashboard, API
- [ ] Practice Q&A session (simulasi 10 menit dari judges)
- [ ] Test demo pada venue internet / equipment jika memungkinkan

### 14.3 Production Deployment `[Arief]`
- [ ] Deploy backend ke Railway (verify health check `/api/health`)
- [ ] Deploy frontend ke Vercel (verify SPA routing)
- [ ] Verify PostgreSQL connection & migrations
- [ ] Verify Redis connection
- [ ] Verify Gemini API connectivity
- [ ] Verify Google OAuth flow end-to-end
- [ ] Verify file upload & AI processing pipeline
- [ ] Verify WebSocket (Reverb) connectivity dan all event types
- [ ] Verify shareable profile card generation
- [ ] Run smoke tests pada production

---

## Post-Launch Checklist

### Monitor & Maintain 
- [ ] Monitor error rates & server health (Railway logs)
- [ ] Monitor API response times
- [ ] Monitor Gemini API usage (free tier: 1500 req/day)
- [ ] Monitor Redis memory usage
- [ ] Monitor PostgreSQL size (Railway free: 500MB)
- [ ] Collect user feedback
- [ ] Fix reported bugs

### Future Enhancements (P1/P2) `[Semua]`
- [ ] Additional learning flows (Interactive Theater, Scout & Conquer, Visual Quest, Presentation Arena)
- [ ] Quiz Arena full implementation
- [ ] Learning Relay full implementation
- [ ] Study Room ambient mode
- [ ] Weekly Community Challenge auto-generation
- [ ] Native mobile app (React Native)
- [ ] Educator dashboard (class management, student tracking)
- [ ] Advanced analytics (learning velocity, retention curves)
- [ ] AI-powered study plan generator
- [ ] Subject Communities (forums per topic)
- [ ] Integration dengan Notion, Google Classroom
- [ ] Multi-language support (Bahasa Indonesia + English + others)

---

## Checklist Removed Items (vs Checklist v1.0)

> Berikut adalah semua items yang **dihapus** dari checklist sebelumnya karena tidak relevan di v2.0:

### ~~Phase 5: 3D City Viewer~~ (SELURUHNYA DIHAPUS)
- ~~Build `CityScene` component (React Three Fiber Canvas)~~
- ~~Camera setup (isometric perspective, FOV 45)~~
- ~~Build `GridPlane` (10×10 grid, shadow receiver)~~
- ~~Isometric Camera Controls (pan, zoom, rotation)~~
- ~~Build `Building` component (GLB model loading)~~
- ~~Building State Shader (wireframe → solid construction)~~
- ~~Building Construction Animation (particle effects, GSAP)~~
- ~~Source/build 5–10 building archetypes (GLB models)~~
- ~~Build `Decoration` component~~
- ~~Create 10 decoration models (trees, benches, fountains)~~
- ~~LOD System (Level of Detail, impostor sprites)~~
- ~~Instanced Meshes (performance optimization)~~
- ~~Texture Atlasing~~
- ~~Frustum Culling (sector-based)~~
- ~~Mesh Merging (static objects)~~
- ~~Draco Compression (GLB models)~~
- ~~City UI Overlay (Building Info Card, City Stats Dashboard)~~
- ~~Zoom Lock (daily learning required)~~
- ~~Grayscale Penalty (city turns gray if idle)~~
- ~~`BuildingConstructionService` (create, update, level-up, grid)~~
- ~~`BuildingPlacement` UI (ghost preview, valid/invalid placement)~~
- ~~Building Relocation (drag-and-drop)~~
- ~~Integrity Decay Artisan command~~
- ~~`BuildingConstructionServiceTest`~~
- ~~AI 3D custom decoration generator~~
- ~~Meshy.ai / Rodin API integration~~

---

> **Priority Legend:**  
> ✅ **P0** — Must Have (MVP for Competition)  
> ⚠️ **P1** — Should Have (Enhances Experience)  
> 🔮 **P2** — Could Have (Post-Competition)  
> ❌ **P3** — Won't Have (Out of Scope)
>
> **Developer Legend:**  


