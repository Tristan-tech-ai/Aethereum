# AETHEREUM — Development Checklist

> **Tech Stack:** Laravel 11 + React 18 + Three.js + PostgreSQL + Redis  
> **Timeline:** 8 Weeks (Competition)  
> **Last Updated:** February 2026

## 📌 Phases Overview
- [ ] **Phase 0:** Pre-Development Setup
- [ ] **Phase 1:** Infrastructure & Environment
- [ ] **Phase 2:** Authentication & User Management
- [ ] **Phase 3:** Content Upload & AI Analysis
- [ ] **Phase 4:** Document Dungeon — Core Learning Flow
- [ ] **Phase 5:** 3D City Viewer
- [ ] **Phase 6:** Focus Coins Economy & Shop
- [ ] **Phase 7:** Public City Profile & Social
- [ ] **Phase 8:** WebSocket & Real-Time
- [ ] **Phase 9:** Additional Learning Flows (P1)
- [ ] **Phase 10:** Gamification & Engagement
- [ ] **Phase 11:** Security & Anti-Cheating
- [ ] **Phase 12:** Testing & QA
- [ ] **Phase 13:** Deployment & Launch
- [ ] **Post-Launch Checklist**

---

## Phase 0: Pre-Development Setup

### 0.1 Project Planning
- [✅] Finalize team roles (Product Owner, Tech Lead, Frontend, Backend, 3D)
- [✅] Set up communication channel (Discord/Slack)
- [✅] Create project timeline with milestones per week
- [✅] Review PRD with all team members
- [✅] Identify P0 (MVP) features vs P1/P2

### 0.2 Repository & Version Control
- [✅] Create GitHub repository (monorepo or separate frontend/backend)
- [✅] Set up branch strategy (`main`, `develop`, `feature/*`, `hotfix/*`)
- [✅] Create `.gitignore` for Laravel + React
- [✅] Write `README.md` with project overview & setup instructions
- [✅] Set up PR template & code review rules
- [✅] Enable branch protection on `main`

### 0.3 Design Assets (christian dan abi)
- [ ] Finalize color palette & design tokens (Tailwind config)
- [ ] Create/source icon set (Lucide React)
- [ ] Import typography (Google Fonts: Inter/Outfit)
- [ ] Design wireframes for key screens (Figma)
  - [ ] Landing / Onboarding
  - [ ] Dashboard
  - [ ] Content Upload
  - [ ] Document Dungeon (reading + quiz)
  - [ ] 3D City Viewer
  - [ ] Profile & Public City
  - [ ] Decoration Shop
- [ ] Source/create 5–10 low-poly 3D building models (GLB format)
- [ ] Source/create 10 decoration models (trees, benches, fountains)
- [ ] Create logo & branding assets

### 0.4 External Service Accounts (tristan)
- [ ] Google Cloud Console — Gemini 2.0 Flash API key
- [ ] Google Cloud Console — OAuth 2.0 Client ID & Secret
- [ ] Jina Reader API — account & API key
- [ ] (Optional) Meshy.ai — account & API key for 3D generation
- [✅] Vercel — account for frontend hosting
- [✅] Railway.app — account for backend hosting + PostgreSQL + Redis
- [ ] Email service (SendGrid/Mailgun) — for verification emails

---

## Phase 1: Infrastructure & Environment

<<<<<<< HEAD
### 1.1 Backend Setup (Laravel)
- [✅] Install Laravel 12 via Composer (`composer create-project laravel/laravel`)
- [✅] Configure `.env` (APP_KEY, APP_URL, debug settings)
- [✅] Install & configure PostgreSQL driver (`pdo_pgsql`)
- [✅] Set `DB_CONNECTION=pgsql` and connect to local/Railway PostgreSQL
=======
### 1.1 Backend Setup (Laravel) (sanjaya)
- [ ] Install Laravel 11 via Composer (`composer create-project laravel/laravel`)
- [ ] Configure `.env` (APP_KEY, APP_URL, debug settings)
- [ ] Install & configure PostgreSQL driver (`pdo_pgsql`)
- [ ] Set `DB_CONNECTION=pgsql` and connect to local/Railway PostgreSQL
>>>>>>> 942a73261812410a9243d9d6ee08f18aada7d8a5
- [ ] Install & configure Redis (`predis/predis` or `phpredis`)
- [ ] Set `CACHE_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`
- [ ] Install Laravel Sanctum (`composer require laravel/sanctum`)
- [ ] Publish Sanctum config & migration
- [ ] Install Laravel Reverb for WebSocket (`composer require laravel/reverb`)
- [ ] Install Socialite for Google OAuth (`composer require laravel/socialite`)
- [ ] Configure CORS (`config/cors.php`) for frontend origin
- [ ] Set up rate limiting middleware (60 req/min authenticated)
- [ ] Create base API response trait/helper (success, error, paginated formats)
- [ ] Configure file storage (local for dev, S3-compatible for prod)
- [ ] Set up queue worker (`php artisan queue:work`)

### 1.2 Frontend Setup (React + Vite) (sanjaya)
- [ ] Create Vite React project (`npm create vite@latest frontend -- --template react`)
- [ ] Install core dependencies:
  - [ ] `react-router-dom` (v6+)
  - [ ] `zustand` (state management)
  - [ ] `axios` (HTTP client)
  - [ ] `@react-three/fiber` + `@react-three/drei` (3D)
  - [ ] `three` (Three.js)
  - [ ] `tailwindcss` + `postcss` + `autoprefixer`
  - [ ] `react-hook-form` (forms)
  - [ ] `framer-motion` (animations)
  - [ ] `lucide-react` (icons)
  - [ ] `date-fns` (dates)
  - [ ] `socket.io-client` (WebSocket)
  - [ ] `react-markdown` (content rendering)
- [ ] Configure Tailwind CSS (`tailwind.config.js`, design tokens)
- [ ] Set up Axios instance with base URL, auth interceptor, error handling
- [ ] Set up React Router with route structure
- [ ] Create folder structure: `components/`, `pages/`, `stores/`, `services/`, `3d/`, `hooks/`, `contexts/`
- [ ] Set up environment variables (`VITE_API_URL`, `VITE_WS_URL`)

### 1.3 Database Schema (sanjaya)
- [ ] Create migration: `users` table (UUID PK, email, password, name, avatar, bio, gamification fields, city settings, OAuth, timestamps)
- [ ] Create migration: `learning_contents` table (UUID, user FK, content info, AI analysis results, structured_sections JSONB, status, timestamps)
- [ ] Create migration: `buildings` table (UUID, user FK, content FK, identity, level/progress, grid position, quality metrics, social, model ref, timestamps)
- [ ] Create migration: `learning_sessions` table (UUID, user FK, content FK, building FK, session config, time tracking, focus metrics, quiz performance, rewards, status)
- [ ] Create migration: `quizzes` table (UUID, content FK, section index, difficulty, questions JSONB, stats, AI gen info)
- [ ] Create migration: `quiz_attempts` table (UUID, user FK, quiz FK, session FK, answers JSONB, score, pass/fail)
- [ ] Create migration: `user_wallets` table (user FK PK, balance, totals, daily/weekly limits)
- [ ] Create migration: `coin_transactions` table (UUID, user FK, amount, balance_after, type, source, related entities, metadata JSONB)
- [ ] Create migration: `decorations` table (UUID, user FK, info, grid position, model, purchase info)
- [ ] Create migration: `study_raids` table (UUID, creator FK, content FK, config, scheduling, status, results)
- [ ] Create migration: `raid_participants` table (composite PK, role, performance, rewards, status)
- [ ] Create migration: `focus_duels` table (UUID, challenger FK, opponent FK, config, status, results, rewards)
- [ ] Create migration: `city_visits` table (UUID, visitor FK, owner FK, details)
- [ ] Create migration: `building_likes` table (composite PK)
- [ ] Create migration: `building_comments` table (UUID, user FK, building FK, comment, threading)
- [ ] Run all migrations (`php artisan migrate`)
- [ ] Create database indexes (per PRD specifications)
- [ ] Create database triggers (update_user_last_learning, reset_coin_limits, update_building_likes_count)
- [ ] Create Eloquent Models with relationships for all tables
- [ ] Create Model Factories for all tables (seeding & testing)
- [ ] Create Database Seeders (demo data for competition)

### 1.4 DevOps & CI/CD (tristan)
- [ ] Create `Dockerfile` for Laravel backend
- [ ] Create `docker-compose.yml` for local dev (PHP, PostgreSQL, Redis)
- [ ] Set up GitHub Actions workflow (`.github/workflows/deploy.yml`)
  - [ ] Frontend: npm ci → test → build → deploy to Vercel
  - [ ] Backend: composer install → test → deploy to Railway
- [ ] Create `vercel.json` with routes & caching config
- [ ] Create `railway.json` / `Procfile` for backend deployment
- [ ] Set up environment variables on Vercel & Railway
- [ ] Verify auto-deploy on push to `main`

---

## Phase 2: Authentication & User Management (tristan)

### 2.1 Backend Auth 
- [ ] Create `AuthController` with methods: `register`, `login`, `logout`, `user`
- [ ] Implement email + password registration with validation
- [ ] Auto-create `UserWallet` on registration (100 coin welcome bonus)
- [ ] Implement login with Sanctum token generation
- [ ] Implement logout (revoke token)
- [ ] Implement `GET /user` — return user + wallet + stats
- [ ] Set up Google OAuth flow via Socialite
  - [ ] Redirect to Google
  - [ ] Handle callback — create or login user
  - [ ] Store `google_id` on user
- [ ] Implement email verification (P1)
- [ ] Implement password reset flow (P1)
- [ ] Create `ProfileController` — update name, bio, avatar, privacy settings
- [ ] Add avatar upload with image processing (resize, crop)
- [ ] Implement session persistence (7-day token expiry)

### 2.2 Frontend Auth
- [ ] Create `AuthContext` (React Context) with `user`, `login`, `register`, `logout`, `loading`
- [ ] Create `api.js` service — Axios instance with token injection & 401 handling
- [ ] Build Login page (email + password form, Google OAuth button)
- [ ] Build Register page (name, email, password, confirm password)
- [ ] Build Google OAuth redirect handler
- [ ] Implement protected routes (redirect to login if unauthenticated)
- [ ] Store token in `localStorage`, auto-check auth on app load
- [ ] Build Profile edit page (name, bio, avatar upload, privacy toggle)
- [ ] Add loading states & error handling for all auth flows

### 2.3 Auth API Routes
- [ ] `POST /api/v1/auth/register`
- [ ] `POST /api/v1/auth/login`
- [ ] `POST /api/v1/auth/logout`
- [ ] `GET /api/v1/auth/user`
- [ ] `GET /api/v1/auth/google/redirect`
- [ ] `GET /api/v1/auth/google/callback`
- [ ] `PUT /api/v1/auth/profile`
- [ ] `POST /api/v1/auth/avatar`

---

## Phase 3: Content Upload & AI Analysis (sanjaya)

### 3.1 Backend — Content Upload
- [ ] Create `ContentController` with upload/url/list/show methods
- [ ] `POST /api/v1/content/upload` — handle multipart file upload (PDF, image, PPTX)
  - [ ] Validate file type & size (max 20MB)
  - [ ] Store file to disk (local dev) / S3 (prod)
  - [ ] Create `learning_contents` record with status `processing`
  - [ ] Dispatch `AnalyzeContentJob` to queue
- [ ] `POST /api/v1/content/url` — handle YouTube & web article URLs
  - [ ] Validate URL format
  - [ ] Detect content type (youtube / web_article)
  - [ ] Create record & dispatch job
- [ ] `GET /api/v1/content/{id}` — return content with status (polling)
- [ ] `GET /api/v1/content` — list user's contents (paginated, filterable)
- [ ] `DELETE /api/v1/content/{id}` — delete content & related files

### 3.2 Backend — AI Services
- [ ] Create `GeminiService` — wrapper for Gemini 2.0 Flash API
  - [ ] `analyzeContent(text, contentType)` — classify & structure content
  - [ ] `generateQuiz(section, difficulty, numQuestions)` — create quiz questions
  - [ ] `validateSummary(original, userSummary)` — score user's summary
  - [ ] `validateDecorationPrompt(prompt)` — check prompt appropriateness
  - [ ] Error handling, retry logic, rate limit awareness
- [ ] Create `YouTubeService`
  - [ ] `getTranscript(videoUrl)` — extract transcript via API
  - [ ] `extractKeyMoments(transcript)` — identify checkpoints with Gemini
  - [ ] `extractVideoId(url)` — parse YouTube URL
- [ ] Create `WebScraperService`
  - [ ] `extractArticle(url)` — clean text via Jina Reader API
  - [ ] `fallbackScrape(url)` — basic HTML scraping fallback
- [ ] Create `ContentAnalysisService` — orchestrator
  - [ ] Route to correct extractor based on content type
  - [ ] Extract text from PDF (using `smalot/pdfparser` or similar)
  - [ ] Send text to Gemini for analysis
  - [ ] Parse response → update `learning_contents` record
  - [ ] Set status to `ready` or `failed`

### 3.3 Backend — Queue Jobs
- [ ] Create `AnalyzeContentJob` — async AI processing
  - [ ] Extract text based on content type
  - [ ] Call `ContentAnalysisService`
  - [ ] Update content status & structured_sections
  - [ ] Handle failures gracefully (retry 3x, then mark failed)
- [ ] Create `GenerateQuizJob` — background quiz creation
  - [ ] Generate quiz for each section of content
  - [ ] Store in `quizzes` table

### 3.4 Frontend — Content Upload
- [ ] Build Upload page/modal with:
  - [ ] Drag-and-drop zone for files (PDF, image, PPTX)
  - [ ] URL input field (YouTube / web article)
  - [ ] Content type auto-detection
  - [ ] Title input (optional, auto-filled by AI)
  - [ ] Upload progress indicator
- [ ] Build Content Library page
  - [ ] Grid/list view of user's contents
  - [ ] Status indicators (processing/ready/failed)
  - [ ] Filter by subject category, content type
  - [ ] Delete content option
- [ ] Implement polling for processing status
- [ ] Build content detail view (show structured sections, metadata)

---

## Phase 4: Document Dungeon — Core Learning Flow (tristan)

### 4.1 Backend — Learning Sessions
- [ ] Create `LearningFlowService`
  - [ ] `selectFlow(content)` — route content type to correct flow
  - [ ] `generateFlowConfig(content, flowType)` — build room/section config
  - [ ] `configureDocumentDungeon(content)` — specific config for PDF flow
- [ ] Create `SessionController`
  - [ ] `POST /api/v1/sessions/start` — create session, return content + first quiz
  - [ ] `PATCH /api/v1/sessions/{id}/progress` — update section, focus events
  - [ ] `POST /api/v1/sessions/{id}/quiz-attempt` — submit & grade quiz
  - [ ] `POST /api/v1/sessions/{id}/validate-summary` — AI validate user summary
  - [ ] `POST /api/v1/sessions/{id}/complete` — finish session, award rewards
- [ ] Create `FocusTrackerService`
  - [ ] Calculate `focus_integrity` from distraction events
  - [ ] Track `tab_switches`, `distraction_count`, `active_time`
- [ ] Create `QuizGeneratorService`
  - [ ] Generate quiz via Gemini if not pre-generated
  - [ ] Grade quiz attempt & calculate score
  - [ ] Determine pass/fail (threshold: 70%)

### 4.2 Backend — Rewards & Building System
- [ ] Create `CoinEconomyService`
  - [ ] `awardSessionCoins(session)` — calculate & award coins
  - [ ] Coin formula: `base(10) + focusBonus + quizBonus + streakMultiplier`
  - [ ] Enforce daily cap (500 coins/day) & weekly cap
  - [ ] Create transaction record
  - [ ] Update wallet balance
- [ ] Create `BuildingConstructionService`
  - [ ] `createOrUpdateBuilding(session)` — find existing or create new
  - [ ] Calculate `construction_progress_added` based on session performance
  - [ ] Update building level (0→1→2→3→4→5 at 0/20/40/60/80/100%)
  - [ ] Calculate `integrity_score` (weighted: quiz 40%, focus 30%, time 30%)
  - [ ] Auto-find grid position for new buildings
  - [ ] Store user summary as `knowledge_artifact`
- [ ] Create `StreakService`
  - [ ] Update `current_streak` on daily learning
  - [ ] Update `longest_streak` if exceeded
  - [ ] Reset streak if day missed

### 4.3 Frontend — Document Dungeon Flow
- [ ] Build **Quest Map** component
  - [ ] Visual room/section layout (5–7 rooms)
  - [ ] Room states: locked, current, completed
  - [ ] Progress bar (rooms completed / total)
  - [ ] Room click → enter reading interface
- [ ] Build **Reading Interface** component
  - [ ] Clean markdown rendering (`react-markdown`)
  - [ ] Focus timer display (countdown or countup)
  - [ ] Focus health hearts (3 hearts, lose 1 per distraction)
  - [ ] Tab switch detection (`visibilitychange` event)
  - [ ] Warning overlay on distraction
  - [ ] "I'm Done Reading" button
  - [ ] Send focus events to backend periodically
- [ ] Build **Guardian Battle / Quiz** component
  - [ ] Question display with multiple choice options
  - [ ] Question navigation (1/5, 2/5, etc.)
  - [ ] Timer per question (2 min)
  - [ ] Answer selection with visual feedback
  - [ ] Submit quiz → show results
  - [ ] Pass animation / Fail animation with retry
  - [ ] Detailed feedback for wrong answers
- [ ] Build **Summary Creation** component
  - [ ] Textarea for user's summary (min 100 chars)
  - [ ] "Check with AI" button → shows AI feedback
  - [ ] Completeness, Accuracy, Clarity scores
  - [ ] Missing concepts list
  - [ ] "Submit & Complete" button (only if AI approves)
- [ ] Build **Session Complete / Reward** screen
  - [ ] Coins earned display with animation
  - [ ] Building progress update visualization
  - [ ] Building level-up celebration (if applicable)
  - [ ] "View City" / "Continue Learning" CTAs

---

## Phase 5: 3D City Viewer (Tristan)

### 5.1 Core Three.js Scene
- [ ] Build `CityScene` component with React Three Fiber Canvas
  - [ ] Camera setup (isometric perspective, FOV 45)
  - [ ] Lighting (ambient + directional with shadows)
  - [ ] Sky component & fog
  - [ ] WebGL config (antialias, high-performance)
- [ ] Build **Grid System** (`GridPlane`)
  - [ ] 10x10 starting grid with visual guidelines
  - [ ] Ground plane with shadow receiver
  - [ ] Grid cell highlighting on hover
- [ ] Implement **Isometric Camera Controls**
  - [ ] Pan (mouse drag / touch drag)
  - [ ] Zoom (scroll / pinch)
  - [ ] Rotation (optional, limited angles)
  - [ ] Smooth transitions (lerp)
  - [ ] Bounds clamping (don't go out of city)

### 5.2 Building Rendering
- [ ] Build `Building` component
  - [ ] Load GLB model via `GLTFLoader` + Draco compression
  - [ ] Position on grid (grid_x * 2, 0, grid_y * 2)
  - [ ] Apply rotation
  - [ ] Click handler → show building info card
  - [ ] Hover effect (glow/outline)
- [ ] Implement **Building State Shader**
  - [ ] Construction progress (wireframe → solid from bottom-up)
  - [ ] Integrity score → brightness mapping
  - [ ] Active building glow (studied today)
  - [ ] Time uniform for animation
- [ ] Implement **Building Construction Animation**
  - [ ] Smooth progress bar animation (GSAP/spring)
  - [ ] Particle effects during construction
  - [ ] Progress hologram above building (HTML overlay)
- [ ] Build 5–10 building archetypes (low-poly GLB models)
  - [ ] `Crystal_Observatory` (Mathematics)
  - [ ] `Tech_Tower` (Computer Science)
  - [ ] `Ancient_Library` (Literature/History)
  - [ ] `Bio_Dome` (Biology/Science)
  - [ ] `Forge_Factory` (Engineering)
  - [ ] (Additional archetypes as needed)

### 5.3 Decorations
- [ ] Build `Decoration` component
  - [ ] Load GLB model
  - [ ] Position on grid
  - [ ] Smaller scale than buildings (1x1 or 2x2)
- [ ] Create 10 stock decoration models
  - [ ] Trees (oak, cherry blossom, pine)
  - [ ] Benches, fountains, statues
  - [ ] Street lights, flower beds

### 5.4 Performance Optimization
- [ ] Implement **LOD System** (Level of Detail)
  - [ ] High detail: <20 units from camera (full GLB)
  - [ ] Medium detail: 20–50 units (simplified geometry)
  - [ ] Low detail: >50 units (impostor sprites)
- [ ] Implement **Frustum Culling** (sector-based)
  - [ ] Divide grid into sectors
  - [ ] Only render sectors visible to camera
- [ ] Implement **Mesh Instancing** for repeated building types
- [ ] Implement **Texture Atlasing** (single texture for multiple buildings)
- [ ] Implement **Draco Compression** for GLB loading
- [ ] Implement **Mobile Optimizations**
  - [ ] Detect mobile/low-end devices
  - [ ] Reduce shadow map size, max visible buildings
  - [ ] Lower pixel ratio, disable post-processing
  - [ ] Adjust LOD distances
- [ ] Build **Performance Monitor** (dev-only FPS, draw calls, triangles)
- [ ] Implement auto-quality reduction when FPS < 30

### 5.5 City UI Overlay
- [ ] Build **Building Info Card** (click building → popup)
  - [ ] Topic name, subject category
  - [ ] Building level & progress bar
  - [ ] Integrity score
  - [ ] Knowledge artifact (user summary)
  - [ ] Last studied date
  - [ ] Likes count & like button
  - [ ] Comments section
- [ ] Build **City Stats Dashboard** (overlay on city view)
  - [ ] Total buildings, total decorations
  - [ ] Grid size, city expansion info
  - [ ] Quick stats (hours, streak, tier)
- [ ] Implement **Zoom Lock** (can't zoom detail until daily learning done)
- [ ] Implement **Grayscale Penalty** (city turns gray if idle >24h)

---

## Phase 6: Focus Coins Economy & Shop

### 6.1 Backend — Economy (sanjaya)
- [ ] `GET /api/v1/wallet` — current balance, totals, daily limit info
- [ ] `GET /api/v1/wallet/transactions` — paginated transaction history
- [ ] `GET /api/v1/shop/decorations` — list available decorations with costs
- [ ] `POST /api/v1/shop/decorations/purchase` — buy decoration, deduct coins
- [ ] `POST /api/v1/shop/decorations/custom-generate` — AI 3D gen (P1)
- [ ] `POST /api/v1/decorations/{id}/place` — place decoration on grid
- [ ] `POST /api/v1/decorations/{id}/relocate` — move decoration
- [ ] `DELETE /api/v1/decorations/{id}` — remove decoration
- [ ] Implement coin earning sources: focus session, quiz perfect score, daily login, streak bonus
- [ ] Implement spending: decorations, land expansion, custom 3D generation

### 6.2 Frontend — Economy (christian dan abi)
- [ ] Build **Wallet Display** (header/navbar coin balance)
- [ ] Build **Transaction History** page
- [ ] Build **Decoration Shop** page
  - [ ] Category tabs (Trees, Benches, Fountains, Statues, Custom)
  - [ ] Item cards with preview, name, cost
  - [ ] Purchase button with confirmation
  - [ ] Insufficient balance warning
- [ ] Build **AI Custom Decoration Generator** (P1)
  - [ ] Prompt input field
  - [ ] Cost display (1000 coins)
  - [ ] Generation progress indicator
  - [ ] Preview result & confirm placement
- [ ] Build **Building Placement Mode** for decorations
  - [ ] Ghost preview on grid hover
  - [ ] Valid/invalid placement color (green/red)
  - [ ] Click to place, confirm
  - [ ] Drag to relocate existing decorations

---

## Phase 7: Public City Profile & Social

### 7.1 Backend — Public Profile (Tristan)
- [ ] `GET /api/v1/city/my-city` — authenticated user's full city data
- [ ] `GET /api/v1/city/user/{user_id}` — public city (403 if private)
- [ ] `POST /api/v1/buildings/{id}/relocate` — reposition building
- [ ] `POST /api/v1/buildings/{id}/like` — like a building
- [ ] `DELETE /api/v1/buildings/{id}/like` — unlike
- [ ] `POST /api/v1/buildings/{id}/comments` — add comment
- [ ] `GET /api/v1/buildings/{id}/comments` — list comments
- [ ] City visit tracking (create `city_visits` record)
- [ ] Generate shareable city link (`/city/{user_id}` or slug)

### 7.2 Frontend — Public Profile (Christian)
- [ ] Build **Public City View** page (shareable URL)
  - [ ] User profile header (name, avatar, bio, tier, stats)
  - [ ] 3D city viewer (read-only)
  - [ ] Building list sidebar
  - [ ] Visit counter
- [ ] Build **Building Detail Modal** (public view)
  - [ ] Building info + knowledge artifact
  - [ ] Like button with count
  - [ ] Comments list & add comment form
- [ ] Build **City Rearrange Mode** (owner only)
  - [ ] Enable drag-and-drop building relocation
  - [ ] Snap to grid, collision detection
  - [ ] Save layout button

### 7.3 Backend — Social Features (P1) (sanjaya)
- [ ] **Focus Duels**
  - [ ] `POST /api/v1/duels/challenge` — send challenge
  - [ ] `POST /api/v1/duels/{id}/accept` — accept challenge
  - [ ] `POST /api/v1/duels/{id}/decline` — decline
  - [ ] `POST /api/v1/duels/{id}/start` — begin duel
  - [ ] `GET /api/v1/duels/my-duels` — list active duels
  - [ ] Calculate winner based on focus integrity scores
  - [ ] Award coins (30 winner, 15 loser)
  - [ ] Auto-expire after 24h if not accepted
- [ ] **Study Raids**
  - [ ] `POST /api/v1/raids/create` — create raid
  - [ ] `POST /api/v1/raids/{id}/join` — join raid (with invite code)
  - [ ] `GET /api/v1/raids/available` — list public raids
  - [ ] `POST /api/v1/raids/{id}/start` — start raid
  - [ ] Track per-participant progress
  - [ ] Calculate team score on completion
- [ ] **Leaderboards**
  - [ ] `GET /api/v1/leaderboards/focus-integrity` — weekly top 100
  - [ ] `GET /api/v1/leaderboards/subject/{subject}` — per-subject
  - [ ] `GET /api/v1/stats/personal` — personal stats dashboard
  - [ ] Materialized views for leaderboard performance
  - [ ] Scheduled refresh (hourly)

### 7.4 Frontend — Social Features (P1) (abi)
- [ ] Build **Focus Duel** UI
  - [ ] Challenge friend modal
  - [ ] Pending duels list
  - [ ] Duel in-progress view (show opponent's focus status via WebSocket)
  - [ ] Duel results screen (winner/loser)
- [ ] Build **Study Raids** UI
  - [ ] Create raid form
  - [ ] Browse available raids
  - [ ] Raid lobby (waiting for participants)
  - [ ] Raid in-progress (shared progress, chat)
  - [ ] Raid completion results
- [ ] Build **Leaderboard** pages
  - [ ] Focus integrity (weekly)
  - [ ] By subject category
  - [ ] Your rank highlight
- [ ] Build **Personal Stats Dashboard**
  - [ ] Overview stats (hours, buildings, sessions, streak)
  - [ ] By-subject breakdown
  - [ ] Weekly activity chart
  - [ ] Focus trend (improvement %)

---

## Phase 8: WebSocket & Real-Time

### 8.1 Backend — Laravel Reverb (Tristan)
- [ ] Configure Laravel Reverb WebSocket server
- [ ] Define broadcasting channels:
  - [ ] `private:session.{sessionId}` — focus events
  - [ ] `private:duel.{duelId}` — duel progress
  - [ ] `private:raid.{raidId}` — raid updates & chat
  - [ ] `private:user.{userId}` — notifications
- [ ] Create broadcast events:
  - [ ] `SessionProgressUpdated`
  - [ ] `OpponentDistracted`
  - [ ] `RaidMemberUpdate`
  - [ ] `BuildingCompleted`
  - [ ] `DecorationReady`
  - [ ] `DuelChallengeReceived`
- [ ] Implement WebSocket authentication (via Sanctum)

### 8.2 Frontend — Socket.io (Christian)
- [ ] Set up Socket.io client connection with auth token
- [ ] Implement auto-reconnection logic
- [ ] Listen for real-time events:
  - [ ] Session progress (duels/raids)
  - [ ] Opponent distraction alerts
  - [ ] Raid member joined/completed/left
  - [ ] Building completed celebration
  - [ ] Custom decoration ready notification
- [ ] Emit events:
  - [ ] Join session, focus events, raid chat messages
- [ ] Fallback to HTTP polling if WebSocket fails

---

## Phase 9: Additional Learning Flows (P1) (tristan dan Christian)

### 9.1 Interactive Theater (YouTube)
- [ ] YouTube embedded player with API controls
- [ ] Auto-pause at checkpoint timestamps
- [ ] Treasure chest questions at key moments
- [ ] Transcript display alongside video
- [ ] Progress tracking per checkpoint

### 9.2 Scout & Conquer (Web Articles)
- [ ] Clean reader view (extract via Jina Reader)
- [ ] Progressive reveal (sections unlocked sequentially)
- [ ] Inline annotation tools
- [ ] Per-section quizzes

### 9.3 Visual Quest (Images/Infographics)
- [ ] Interactive hotspot system on images
- [ ] OCR text extraction (Tesseract.js client-side)
- [ ] Guided exploration flow
- [ ] Knowledge validation quiz

### 9.4 Presentation Arena (PPT)
- [ ] Slide-by-slide guided walkthrough
- [ ] Speaker notes display
- [ ] Per-slide comprehension checks
- [ ] Summary creation at end

---

## Phase 10: Gamification & Engagement (abi dan sanjaya)

### 10.1 Mastery Tier System (P1)
- [ ] Define tier thresholds: Novice → Apprentice → Scholar → Expert → Master
- [ ] Calculate tier based on total_learning_hours + buildings + integrity
- [ ] Tier badge display on profile
- [ ] Tier-based perks (larger grid, more daily coins, etc.)

### 10.2 Achievements & Streaks (P1)
- [ ] Define achievement list (First Completion, 7-Day Streak, 10 Buildings, etc.)
- [ ] Track & award achievements automatically
- [ ] Achievement notification popup
- [ ] Achievement showcase on profile
- [ ] Learning streak tracking with rewards (unlock new land at 7 days)

### 10.3 Anti-Gimmick Safeguards
- [ ] Implement zoom lock (daily learning required)
- [ ] Implement grayscale penalty (idle >24h)
- [ ] Implement fog of war (new land behind streak)
- [ ] Implement integrity decay (1%/month if not reviewed, min 50%)
- [ ] Schedule `buildings:decay-integrity` Artisan command (daily at 00:00)

---

## Phase 11: Security & Anti-Cheating (tristan dan sanjaya)

### 11.1 Input Validation & Security
- [ ] Server-side validation on all API endpoints (Laravel FormRequests)
- [ ] XSS prevention (sanitize user inputs, comments, summaries)
- [ ] SQL injection prevention (parameterized queries via Eloquent)
- [ ] CSRF protection (Sanctum SPA cookie mode or token-based)
- [ ] File upload validation (type, size, virus scan)
- [ ] Rate limiting on all endpoints (60/min auth, 10/min guest)
- [ ] CORS restricted to frontend domain only

### 11.2 Anti-Cheat Measures
- [ ] Tab switch detection (visibilitychange API)
- [ ] Minimum reading time validation (server-side)
- [ ] Quiz randomization (shuffle questions & options)
- [ ] Quiz cooldown (prevent rapid retake)
- [ ] Focus session duration validation (server timestamp vs client)
- [ ] Coin earning daily/weekly caps
- [ ] Summary length & quality minimum thresholds

### 11.3 Data Privacy
- [ ] Privacy policy page
- [ ] City public/private toggle
- [ ] User data export capability
- [ ] Account deletion flow

---

## Phase 12: Testing & QA

### 12.1 Backend Tests (PHPUnit) (Tristan dan Sanjaya)
- [ ] **Unit Tests:**
  - [ ] `CoinEconomyServiceTest` — earn, spend, daily cap, insufficient balance
  - [ ] `BuildingConstructionServiceTest` — create, update, level-up, integrity
  - [ ] `FocusTrackerServiceTest` — integrity calculation
  - [ ] `StreakServiceTest` — increment, reset, longest
  - [ ] `GeminiServiceTest` — mock API responses
  - [ ] `ContentAnalysisServiceTest` — text extraction, parsing
- [ ] **Feature/Integration Tests:**
  - [ ] Auth flow (register → login → profile → logout)
  - [ ] Content upload & processing flow
  - [ ] Complete learning session flow (start → read → quiz → summary → complete)
  - [ ] Coin economy flow (earn → purchase → balance)
  - [ ] Building creation & update flow
  - [ ] Social features (duel challenge → accept → complete)
  - [ ] Public city access (public vs private)

### 12.2 Frontend Tests (Jest + React Testing Library) (Christian dan abi)
- [ ] Component tests:
  - [ ] FocusTimer — start, pause, tab detection, health
  - [ ] QuizBattle — answer selection, submit, scoring
  - [ ] SummaryCreation — input, AI validation, submit
  - [ ] UploadModal — file drag-drop, URL input
  - [ ] WalletDisplay — balance, transactions
- [ ] Integration tests:
  - [ ] Auth flow (login → dashboard)
  - [ ] Upload → library → start session
  - [ ] City rendering (Canvas)

### 12.3 E2E Tests (Cypress) (Sanjaya)
- [ ] Full learning flow (upload → learn → quiz → city)
- [ ] Auth flow (register → login → profile)
- [ ] Shop flow (view → purchase → place)
- [ ] Public city flow (share link → visit → like → comment)

### 12.4 Performance Testing (Tristan)
- [ ] Lighthouse audit (target score >90)
- [ ] 3D performance test on mobile (target 60 FPS)
- [ ] API response time testing (<200ms for most endpoints)
- [ ] AI response time testing (<10s for content analysis)
- [ ] Load testing (100 concurrent users)

### 12.5 Cross-Browser & Device Testing (Sanjaya)
- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop + iOS)
- [ ] Edge (Desktop)
- [ ] Android Chrome
- [ ] Test on low-end device (4 CPU cores, 2GB RAM)

---

## Phase 13: Deployment & Launch (barengan)

### 13.1 Pre-Launch Checklist
- [ ] All P0 features working end-to-end
- [ ] Demo data seeded (impressive city with 20+ buildings)
- [ ] Demo user account ready for presentation
- [ ] All environment variables set on production
- [ ] Database migrations run on production
- [ ] HTTPS/SSL verified on all domains
- [ ] CORS configuration verified
- [ ] Error monitoring set up (Sentry or similar)
- [ ] Application logging configured
- [ ] Queue worker running on production
- [ ] WebSocket server running on production

### 13.2 Competition Prep (Week 8)
- [ ] Code freeze (2 days before demo)
- [ ] Bug bash — fix all critical/high bugs
- [ ] Demo script written & rehearsed
- [ ] Backup demo video recorded (in case of live failure)
- [ ] Fallback slides prepared
- [ ] FAQ prepared (anticipated judge questions)
- [ ] Practice Q&A session
- [ ] Test demo on venue internet/equipment if possible

### 13.3 Production Deployment
- [ ] Deploy backend to Railway (verify health check `/api/health`)
- [ ] Deploy frontend to Vercel (verify SPA routing)
- [ ] Verify database connection & migrations
- [ ] Verify Redis connection
- [ ] Verify Gemini API connectivity
- [ ] Verify Google OAuth flow end-to-end
- [ ] Verify file upload & AI processing pipeline
- [ ] Verify 3D city rendering on production
- [ ] Verify WebSocket connectivity
- [ ] Run smoke tests on production

---

## Post-Launch Checklist

### Monitor & Maintain
- [ ] Monitor error rates & server health
- [ ] Monitor API response times
- [ ] Monitor AI API usage (free tier limits: 1500 req/day)
- [ ] Monitor database size (Railway free: 500MB)
- [ ] Collect user feedback
- [ ] Fix reported bugs

### Future Enhancements (P1/P2)
- [ ] Additional learning flows (YouTube, Article, Image, PPT)
- [ ] Co-op Study Raids (full implementation)
- [ ] AI custom 3D decoration generator
- [ ] Mastery tier system with perks
- [ ] Achievement badges
- [ ] Community challenges (weekly events)
- [ ] Featured cities showcase
- [ ] Offline mode (IndexedDB caching)
- [ ] Native mobile app (React Native)
- [ ] Educator dashboard
- [ ] Multi-language support
- [ ] Third-party integrations (Notion, Google Classroom)

---

> **Priority Legend:**  
> ✅ P0 — Must Have (MVP for Competition)  
> ⚠️ P1 — Should Have (Enhances Experience)  
> 🔮 P2 — Could Have (Post-Competition)  
> ❌ P3 — Won't Have (Out of Scope)
