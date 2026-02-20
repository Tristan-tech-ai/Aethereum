# AETHEREUM: Knowledge Empire
## Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** February 2026  
**Competition:** FICPACT CUP 2026  
**Theme:** Ficpact Playground  
**Subtema:** Interactive Edutainment  
**Tech Stack:** Laravel 12 + React 18 + PostgreSQL + Redis + Chart.js/Recharts

---

## Document Control

| Role | Name | Contact |
|------|------|---------|
| Product Owner | [Your Name] | [Email] |
| Tech Lead | [Your Name] | [Email] |
| Designer | [Your Name / Team] | [Email] |
| Document Status | **APPROVED FOR DEVELOPMENT** | |

**Change Log:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 10, 2026 | Initial PRD (3D City System) | Product Team |
| 2.0 | Feb 20, 2026 | Major Redesign: Replace 3D City → Knowledge Profile System + Social Learning Modes | Product Team |

**Alasan Redesign v2.0:**
> Sistem 3D City (Three.js) terlalu berat untuk di-develop dan di-run dalam timeframe kompetisi. Diganti dengan Knowledge Profile System yang ringan (pure CSS/SVG/Chart.js) namun tetap engaging, dilengkapi Social Learning Modes yang lebih kaya fitur sosial.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Philosophy](#2-product-vision--philosophy)
3. [Target Users & Personas](#3-target-users--personas)
4. [Core Features & Specifications](#4-core-features--specifications)
5. [Knowledge Profile System](#5-knowledge-profile-system)
6. [Social Discovery & Visibility](#6-social-discovery--visibility)
7. [Social Learning Modes](#7-social-learning-modes)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [API Specifications](#10-api-specifications)
11. [AI Integration Strategy](#11-ai-integration-strategy)
12. [Adaptive Learning Flows](#12-adaptive-learning-flows)
13. [UX/UI Design System](#13-uxui-design-system)
14. [Security & Anti-Cheating](#14-security--anti-cheating)
15. [Development Roadmap](#15-development-roadmap)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment Plan](#17-deployment-plan)
18. [Success Metrics & KPIs](#18-success-metrics--kpis)
19. [Risk Management](#19-risk-management)
20. [Competition Strategy](#20-competition-strategy)
21. [Appendices](#21-appendices)

---

## 1. Executive Summary

### 1.1 Product Overview

**AETHEREUM** adalah platform pembelajaran interaktif berbasis web yang mengubah cara orang belajar dengan mentransformasi konten edukatif apapun (PDF, Video, URL, Image, PPT) menjadi structured learning journey yang divisualisasikan melalui **Knowledge Profile System** — sebuah profil pengetahuan yang dinamis, sosial, dan penuh gamifikasi.

**Core Innovation (v2.0):**
- **BYOC (Bring Your Own Content):** User upload materi mereka sendiri, bukan terbatas pada konten platform
- **Adaptive Learning Flows:** Setiap tipe konten punya flow pembelajaran yang berbeda dan optimal
- **Knowledge Profile:** Progress belajar divisualisasikan melalui Learning Heatmap, XP/Level, Knowledge Cards, dan Achievement Badges
- **Social Learning Hub:** 6 mode belajar sosial — Study Raid, Focus Duel, Quiz Arena, Learning Relay, Study Room, Weekly Challenge
- **AI-Driven Everything:** Dari analisis konten, quiz generation, sampai summary validation

**One-Line Pitch:**
> "Build Your Knowledge Empire - Transform any learning material into an interactive adventure and grow your Knowledge Profile with every concept you master."

### 1.2 The Problem (Hidden Pain Points)

**Primary Pain:**
> "The Illusion of Progress & Social Loneliness in Learning"

People feel productive because they "read a lot" but information doesn't stick. They know they should learn, but lack a system, motivation, visual proof of progress, and social accountability.

**Specific Pains:**

1. **Shallow Learning (90% Retention Loss):** Read articles/watch videos but forget within 24 hours
2. **No Tangible Progress:** Progress bars don't motivate, no shareable proof of learning
3. **Social Isolation:** Studying alone is boring and demotivating
4. **Content Overwhelm:** 100+ bookmarked articles never get read
5. **Platform Lock-in:** Limited to content provided by platform

### 1.3 The Solution

**AETHEREUM** menyelesaikan dengan 5 core innovations:

1. **Content Orchestration:** Upload PDF/YouTube/URL → AI pecah jadi structured sections dengan learning path optimal
2. **Active Learning Enforcement:** Focus timer + distraction detection + comprehension validation (must pass quiz)
3. **Knowledge Profile System:** Every completed material = Knowledge Card, XP, Level, Rank, dan posisi di Heatmap
4. **Social Learning Modes:** 6 mode belajar bareng dari cooperative sampai competitive yang anti-toxic
5. **Focus Coins Economy:** Earned dari disiplin fokus → digunakan untuk boost profile, frame, dan badges eksklusif

### 1.4 Unique Value Proposition

| Aspect | Traditional Learning Apps | AETHEREUM |
|--------|--------------------------|-----------|
| **Content Source** | Limited to platform | ANY content (BYOC) |
| **Progress Visual** | Progress bars, badges | Knowledge Heatmap + Cards + Level |
| **Learning Mode** | Passive (read/watch) | Active (quests, challenges) |
| **Social Layer** | None or basic | 6 social learning modes |
| **Tech Innovation** | Standard web app | AI orchestration + gamified profile |
| **Retention** | Low (boring) | High (addictive profile building) |

### 1.5 Target Competition Success

Berdasarkan kriteria FICPACT CUP 2026:

| Kriteria | Bobot | AETHEREUM Strategy | Target Score |
|----------|-------|-------------------|--------------|
| **Kreativitas & Inovasi** | 20% | AI + Adaptive flows + Social Learning Modes | 18/20 |
| **Fungsionalitas** | 20% | Full working MVP dengan core features | 18/20 |
| **Kesesuaian Solusi** | 15% | Clear pain points + Data-driven solution | 13/15 |
| **User Experience** | 15% | Mobile-first, beautiful UI, gamified UX | 13/15 |
| **Presentasi & Video** | 20% | Story-driven demo: transformation journey | 17/20 |
| **Dokumentasi** | 10% | Comprehensive PRD + Technical docs | 9/10 |
| **TOTAL** | 100% | | **88/100** |

---

## 2. Product Vision & Philosophy

### 2.1 Vision Statement

> "To transform solitary learning into a collaborative adventure where every piece of knowledge becomes a building block of a thriving digital knowledge empire — visible, shareable, and celebrated."

### 2.2 Mission

Membuat belajar menjadi:
- **Engaging:** Seperti bermain RPG game, bukan seperti mengerjakan PR
- **Accountable:** Social pressure yang positif, bukan toxic competition
- **Personalized:** User kontrol 100% konten yang mereka pelajari
- **Shareable:** Knowledge Profile sebagai portfolio pengetahuan yang bisa dipamerkan

### 2.3 Core Principles (v2.0)

#### **Principle 1: Learning First, Profile Second**
> "Knowledge Cards adalah **reaksi**, bukan aksi. Profile adalah **bukti**, bukan tujuan."

**Implementation:**
- Tidak ada XP tanpa validated learning activity
- Streak breaks jika user idle >24h
- Heatmap shows real activity, not vanity metrics

#### **Principle 2: Proof of Work, Not Proof of Wealth**
> "Every Knowledge Card must be earned through validated learning."

**Implementation:**
- Cards cannot be bought with money
- No shortcuts atau cheat codes
- Integrity score reflects actual learning quality

#### **Principle 3: Adaptive, Not Prescriptive**
> "Different content types deserve different learning experiences."

**Implementation:**
- PDF → Document Dungeon (structured reading)
- YouTube → Interactive Theater (active watching)
- Article → Scout & Conquer (progressive reading)
- Image → Visual Quest (interactive exploration)
- PPT → Presentation Arena (guided learning)

#### **Principle 4: Collaborative, Not (Toxically) Competitive**
> "Success measured by community growth dan personal growth."

**Implementation:**
- 6 social learning modes: cooperative + friendly competitive + ambient
- No public W/L records (only total completed)
- Opt-in weekly leaderboards, reset tiap minggu
- Community challenges dengan collective goals

#### **Principle 5: Performant by Design**
> "Lightweight beats heavy. Pure CSS/SVG beats WebGL."

**Implementation:**
- Tidak ada Three.js / WebGL overhead
- Pure CSS animations untuk heatmap & cards
- Chart.js/Recharts untuk analytics
- <2s initial load time
- Works on low-end mobile (3G connection)

### 2.4 The Learning Loop (v2.0)

```
┌──────────────────────────────────────────────────────┐
│              CORE ENGAGEMENT LOOP (v2.0)              │
└──────────────────────────────────────────────────────┘

[1] User uploads content
         ↓
[2] AI analyzes & structures content
         ↓
[3] User enters focus session
         ↓
[4] Active learning (reading + annotations)
         ↓
[5] Comprehension validation (quiz)
         ↓
[6] Knowledge Card created → XP + Coins awarded
         ↓
[7] Profile grows (Heatmap, Level, Rank, Cards)
         ↓
[8] Social validation (shareable profile, community feed)
         ↓
[9] Dopamine hit → Friend sees profile → Viral loop
         ↓
[Back to 1] — User wants more cards, higher level
```

---

## 3. Target Users & Personas

### 3.1 Primary Persona: "Andi — The Ambitious Student"

**Demographics:** Age 19-24, College student (CS/Engineering), Urban Indonesia, High tech literacy

**Pain Points:**
- "Saya punya 50+ PDF lecture notes tapi belum dibaca semua"
- "Susah fokus, selalu buka Instagram tengah-tengah belajar"
- "Rasanya sudah belajar banyak tapi tidak ada yang bisa ditunjukkan"
- "Belajar sendirian membosankan, butuh teman tapi sulit koordinasi"

**How AETHEREUM v2.0 Helps:**
- Upload PDF kuliah → Transformed into engaging quest
- Focus timer → Social accountability via duels dengan teman
- Knowledge Profile → Visual proof of progress to show parents/friends
- Study Raids + Quiz Arena → Belajar bareng teman secara seru

**User Journey (v2.0):**
```
DISCOVERY:
- Friend shares Knowledge Profile card di Instagram
- "Wah level 42 Scholar? Itu game apa?"
- Friend: "Bukan game, ini profil belajar gue!"
- Andi: "Wait, keren banget..."

ONBOARDING:
- Sign up with Google
- Tutorial: "Let's earn your first Knowledge Card"
- Upload PDF "Data Structures"
- AI: "Found 5 key sections, ready to conquer them?"
- Complete first section → Card earned, XP +20
- Andi: "Oh wow, THIS is cool!"

HABIT FORMATION:
- Day 2: Uploads another PDF (wants more cards + XP)
- Day 3: Challenges friend to Focus Duel
- Day 7: 7-day streak milestone — special badge unlocked
- Day 14: Level 15 Scholar → Profile looks impressive
- Day 30: Pin 6 best cards, share profile card to Instagram

MASTERY:
- Month 2: 30+ knowledge cards, Level 40+
- Joins Study Raids regularly
- Participates in Weekly Community Challenge
- Invites more friends (viral loop)
```

**Quote:**
> "Dulu belajar cuma demi nilai. Sekarang gue belajar demi level naik dan profile makin keren. And somehow, IPK gue naik tanpa terasa stressful."

### 3.2 Secondary Persona: "Budi — The Self-Learner Professional"

**Demographics:** Age 25-35, Working professional, Middle class, Very tech-savvy

**Pain Points:**
- "100+ bookmarked articles, never read"
- "Started 5 online courses, finished 0"
- "Hard to stay consistent after work"

**How AETHEREUM Helps:**
- BYOC → Can learn from curated bookmarks
- Short sessions (25min) → Fits into busy schedule
- Knowledge Profile → Shows continuous learning to recruiters
- Study Room → Ambient co-working feel tanpa pressure

### 3.3 Tertiary Persona: "Siti — The Competitive Learner"

**Demographics:** Age 16-22, High school / Early college, Goal: Ace exam / Get scholarship

**Pain Points:**
- "Too much material, overwhelmed"
- "Don't know if I'm ahead or behind peers"
- "Traditional studying is boring"

**How AETHEREUM Helps:**
- Upload exam prep materials
- Quiz Arena untuk review bareng sebelum ujian
- Subject-specific leaderboards (Math, Physics, etc.)
- Weekly Community Challenge untuk feel of togetherness

### 3.4 Anti-Persona (NOT Target User)
- Kids under 14 (requires self-motivation)
- People who hate gamification
- People looking for passive learning only
- People with zero tech literacy

---

## 4. Core Features & Specifications

### 4.1 Feature Priority Matrix

```
┌────────────────────────────────────────────────────────┐
│                MVP (P0) — MUST HAVE                    │
│            (For Competition Demo)                      │
└────────────────────────────────────────────────────────┘

✅ User Authentication (Email + Google OAuth)
✅ Content Upload (PDF, YouTube URL, Web URL)
✅ AI Content Analysis & Classification
✅ Document Dungeon Flow (Primary learning path)
✅ Focus Timer dengan Distraction Detection
✅ AI-Generated Quizzes
✅ Knowledge Profile System:
   ✅ XP & Level System (1-100)
   ✅ Learning Heatmap (GitHub-style, 52 weeks)
   ✅ Knowledge Cards (per completed material)
   ✅ Streak System (daily streak + milestones)
   ✅ Rank System (6 ranks)
✅ Focus Coins Economy (earn & spend)
✅ Social Learning — Study Raid (P0)
✅ Social Learning — Focus Duel (P0)
✅ Public Knowledge Profile (shareable link)
✅ Shareable Profile Card (auto-generated PNG/SVG)

┌────────────────────────────────────────────────────────┐
│            POST-MVP (P1) — SHOULD HAVE                 │
└────────────────────────────────────────────────────────┘

⚠️ Interactive Theater (YouTube adaptive flow)
⚠️ Scout & Conquer (Article progressive reading)
⚠️ Visual Quest (Image/infographic learning)
⚠️ Presentation Arena (PPT guided learning)
⚠️ Achievement Badges System (full set)
⚠️ Learning Analytics Dashboard (Charts)
⚠️ Social Discovery — Explore Page (Trending Learners, etc.)
⚠️ Community Feed (Timeline)
⚠️ Friends System (Add friend, mini-profile)
⚠️ Safe Leaderboards (Opt-in, Weekly Reset)
⚠️ Social Learning — Quiz Arena (2-8 players)
⚠️ Social Learning — Learning Relay
⚠️ Social Learning — Study Room (Virtual co-working)
⚠️ Social Learning — Weekly Community Challenge
⚠️ Search & Subject Communities

┌────────────────────────────────────────────────────────┐
│            FUTURE (P2) — COULD HAVE                    │
└────────────────────────────────────────────────────────┘

🔮 Native Mobile App (iOS/Android)
🔮 Offline Mode (IndexedDB caching)
🔮 Voice Input for Quizzes
🔮 Educator Dashboard (for teachers)
🔮 Third-party integrations (Notion, Google Classroom)
🔮 Multi-Language Support

┌────────────────────────────────────────────────────────┐
│            OUT OF SCOPE (P3) — WON'T HAVE              │
└────────────────────────────────────────────────────────┘

❌ 3D City Viewer / Three.js rendering (replaced by Knowledge Profile)
❌ 3D Building Construction System (replaced by Knowledge Cards)
❌ 3D Decoration Shop (replaced by Profile Frames/Badges)
❌ Ranked Competitive Mode (too toxic)
❌ Paid Premium Features (against competition spirit)
❌ VR Mode
❌ Blockchain/NFT
```

---

## 5. Knowledge Profile System

### 5.1 📊 Learning Heatmap (GitHub-style)

**Concept:** Grid 52 minggu × 7 hari, setiap cell menunjukkan intensity aktivitas belajar hari tersebut.

**Technical Implementation:**
- Pure CSS grid + SVG, zero JS dependency untuk render
- Color intensity: `#ebedf0` (none) → `#9be9a8` → `#40c463` → `#30a14e` → `#216e39` (max)
- Tooltip on hover: "Feb 20 — 3 sessions, 2h 15m"
- Weekly/monthly/yearly view toggle

**Data Sources untuk intensity:**
- Jumlah sesi belajar hari itu
- Total focus time (menit)
- Quiz scores rata-rata

**XP Awarded:** +15 bonus jika study >2 sesi dalam sehari (consistency bonus)

---

### 5.2 🏆 XP & Level System

**Level Range:** 1 – 100

**XP Sources:**

| Activity | XP Awarded |
|----------|------------|
| Selesaikan 1 section | +20 XP |
| Lulus quiz (≥70%) | +30 XP |
| Perfect quiz (100%) | +50 XP |
| Submit summary | +25 XP |
| Focus integrity ≥90% (bonus) | +15 XP |
| Daily login | +10 XP |
| Complete full material | +100 XP |
| Study Raid selesai | +50% XP bonus |
| Focus Duel menang | +30 XP bonus |
| Focus Duel kalah (tetap belajar) | +10 XP |
| Weekly Challenge contribution | +25 XP |

**XP Curve (Logarithmic):**
```
Level 1  → 100 XP
Level 5  → 500 XP total
Level 10 → 1,500 XP total
Level 20 → 5,000 XP total
Level 50 → 25,000 XP total
Level 100→ 100,000 XP total
```

**Formula:** `XP_needed(level) = round(100 * (level^1.5))`

**Level Display:** Progress bar di profile header dengan current XP / XP to next level

---

### 5.3 🎖️ Rank System (Milestone-Based)

| Rank | Level Range | Badge Icon | Badge Name | Perks |
|------|-------------|-----------|-----------|-------|
| 🌱 **Seedling** | 1–5 | Tunas | Baru mulai tumbuh | Basic profile |
| 📗 **Learner** | 6–15 | Buku | Gemar membaca | Profile frame unlock |
| 📘 **Scholar** | 16–30 | Scroll | Penggali ilmu | Custom username color |
| 🔬 **Researcher** | 31–50 | Mikroskop | Pemikir kritis | Explore page featured |
| 🎓 **Expert** | 51–75 | Toga Wisuda | Ahli di bidangnya | Hall of Sages eligible |
| 🏛️ **Sage** | 76–100 | Pilar Kuil | Penjaga kebijaksanaan | Special Sage badge, top leaderboard |

**Rank-Up Celebration:** Full-screen animation + notification ke Community Feed + Achievement badge

---

### 5.4 📚 Knowledge Cards (Pengganti Buildings)

**Concept:** Setiap materi yang berhasil diselesaikan (lulus quiz + submit summary) menghasilkan 1 Knowledge Card.

**Card Contents:**
- Judul materi
- Subject category (icon + color-coded)
- Mastery % (rata-rata quiz score)
- Focus Integrity score
- Summary snippet (user's own words)
- Completion date
- Time invested (menit)

**Card Tiers berdasarkan Mastery %:**

| Tier | Mastery | Card Style |
|------|---------|-----------|
| 🥉 Bronze | 70–79% | Bronze border, simple |
| 🥈 Silver | 80–89% | Silver border, subtle glow |
| 🥇 Gold | 90–99% | Gold border, animated glow |
| 💎 Diamond | 100% (perfect) | Diamond gradient, sparkle effect |

**Profile Pin System:**
- User bisa pin 6 card terbaik di profil publik mereka
- Unpinned cards masuk ke "Knowledge Vault" (lihat semua)
- Cards diurutkan by subject, date, atau mastery

**Card Integrity Decay:**
- Jika materi tidak di-review selama 90 hari → mastery % turun 5%/bulan (min 50%)
- Mendorong user untuk review kembali

---

### 5.5 🔥 Streak System

**Daily Streak:** Login + minimal 1 completed section per hari

**Streak Freeze:** 1x per minggu (gunakan untuk skip 1 hari tanpa break streak)

**Weekly Goal:** Default 5 hari/minggu (bisa dikustomisasi: 3/5/7)

**Streak Milestones & Rewards:**

| Milestone | Reward |
|-----------|--------|
| 🔥 7 days | "Week Warrior" badge + 100 coins |
| 🔥🔥 30 days | "Monthly Master" badge + 300 coins + profile frame |
| 🔥🔥🔥 90 days | "Quarter Champion" badge + 1000 coins + special rank color |
| 🔥🔥🔥🔥 365 days | "Year Legend" badge + 5000 coins + exclusive "Eternal Flame" title |

**Streak Display:**
- Flame icon di profile header dengan streak count
- "Best streak: X days" sebagai permanent record

---

### 5.6 🏅 Achievement Badges

**Personal Milestone Badges:**

| Badge | Nama | Trigger |
|-------|------|---------|
| 🚀 | First Steps | Complete first learning session |
| 📖 | Bookworm | Complete 10 materials |
| 🧠 | Knowledge Seeker | Complete 50 materials |
| 💯 | Quiz Master | Score 100% on 10 quizzes |
| 🔥 | Hot Streak | Achieve 30-day streak |
| 🌍 | Polymath | Complete materials in 5+ different subjects |
| ⚔️ | Raid Veteran | Complete 10 Study Raids |
| 🥊 | Duel Champion | Win 10 Focus Duels |
| 🏟️ | Arena Hero | Win a Quiz Arena match |
| 🏃 | Relay Runner | Complete 5 Learning Relays |
| 🤝 | Social Learner | Join 20 Study Rooms |
| 🌟 | Community Hero | Contribute to 5 Weekly Challenges |
| 💎 | Perfectionist | Earn 5 Diamond cards |
| 👑 | Knowledge Emperor | Reach Level 100 |

**Badges ditampilkan di:**
- Profile page (pinned top 3 featured)
- Profile card (auto-generated share image)
- Community feed (badge earned = feed event)

---

### 5.7 📈 Learning Analytics Dashboard

**Sections:**
1. **Overview Stats:** Total sessions, total XP, avg focus integrity, materials completed
2. **XP Progress Chart:** Line chart 30/90/365 hari
3. **Subject Breakdown:** Pie chart / bar chart by subject
4. **Focus Integrity Trend:** Line chart per week
5. **Best Study Hours:** Heatmap by hour-of-day vs day-of-week
6. **Quiz Performance:** Per subject, trend improvement

**Tech:** Recharts (React component library, lightweight)

---

### 5.8 👤 Public Profile + Shareable Profile Card

**Public Profile Page (`/profile/{username}`):**
- Header: avatar, name, rank badge, level, streak
- Pinned Knowledge Cards (6 max)
- Learning Heatmap (last 52 weeks)
- Achievement Badges showcase
- Stats: total materials, hours, avg mastery

**Auto-Generated Shareable Profile Card (PNG/SVG):**
- Format: 1200×630px (Open Graph standard)
- Contains: username, rank, level, top 3 cards, streak, heatmap summary
- Generated via HTML Canvas / html2canvas
- "Share to Instagram / Twitter / WhatsApp" buttons
- Available at: `/api/v1/profile/share-card.png`

---

## 6. Social Discovery & Visibility

### 6.1 🌐 Explore Page

**Sections:**

1. **Trending Learners** — Users dengan most XP gained minggu ini
2. **Rising Stars** — Users baru dengan growth rate tertinggi
3. **Hall of Sages** — Semua user yang sudah mencapai Rank Sage
4. **Top by Subject** — Leaderboard per-subjek (opt-in)
5. **Featured Knowledge Cards** — Cards dengan mastery 100% yang dipilih editorial

---

### 6.2 📢 Community Feed

**Timeline Events (reverse chronological):**
- "Andi naik ke Rank Scholar! 🎓"
- "Budi mendapat badge 'Quiz Master'! 💯"
- "Siti menyelesaikan Study Raid dengan team score 95%! ⚔️"
- "Arief mencapai 30-day streak! 🔥"
- "Community Challenge 'Read-a-thon' tercapai! 🎉 All participants +100 coins"

**Interaction:** Like (❤️) + komentar singkat pada feed events

---

### 6.3 👥 Friends System

**Features:**
- Add friend via username / invite link
- View friend's online/learning status ("Learning Data Structures...")
- Mini-profile card on hover
- "Challenge to Focus Duel" shortcut
- "Invite to Study Raid" shortcut
- Friend activity on Community Feed

---

### 6.4 🏆 Safe Leaderboards (Opt-in, Weekly Reset)

| Leaderboard | Metric | Reset |
|-------------|--------|-------|
| ⚡ Focus Champions | Highest avg focus integrity | Weekly |
| 📚 Knowledge Collectors | Most materials completed | Weekly |
| 🔥 Streak Warriors | Longest active streak | Rolling |
| 💯 Quiz Masters | Most perfect quiz scores | Weekly |
| 🔬 Subject Boards | XP per subject | Weekly |

**Anti-toxic Rules:**
- Semua leaderboard opt-in (default: off)
- Weekly reset (no permanent dominance)
- No public "loser" shaming
- Top 100 only (no exact rank displayed if >100)

---

### 6.5 🔗 Shareable Profile Card

Auto-generated PNG/SVG setelah setiap rank-up atau milestone besar.

---

### 6.6 🔎 Search & Subject Communities

**Search:** Cari user by username, subject by keyword

**Subject Communities (P1):**
- Public community per subject (Mathematics, CS, Physics, etc.)
- Shared resources, top learners in that subject
- Subject-specific Weekly Challenges

---

## 7. Social Learning Modes

> **Design Principle:** Semua mode dirancang "fun first, educational second" — tapi tetap memvalidasi pembelajaran yang sungguh-sungguh.

---

### Mode 1: ⚔️ Study Raid (P0 — MVP)

**Konsep:** Belajar bareng 2–5 orang secara real-time, seperti dungeon raid di game RPG.

**Cara Kerja:**
1. Creator pilih materi yang sudah di-upload, set durasi & max peserta
2. Share invite code / link ke teman
3. Semua peserta belajar materi yang **sama** secara bersamaan
4. **Shared progress bar** — progress gabungan semua anggota
5. Live chat sidebar untuk diskusi (text only)
6. Di akhir, semua peserta quiz bareng
7. Team score = rata-rata semua anggota
8. If team score >90% → special bonus reward

**Rewards:**
- XP bonus +50% karena belajar bareng
- "Raid Veteran" achievement setelah 10 raids
- Special badge jika team score >90%

**UI Elements:**
- Lobby waiting room dengan avatar peserta (emoji-based)
- Real-time progress indicators per member (nama + % progress)
- Chat bubble sidebar
- Celebration animation saat raid selesai
- Team scoreboard hasil akhir

**Anti-cheat:** Setiap peserta harus pass quiz masing-masing (tidak bisa copy)

---

### Mode 2: 🥊 Focus Duel (P0 — MVP)

**Konsep:** Tantang teman untuk adu fokus — siapa yang bisa belajar paling disiplin.

**Cara Kerja:**
1. Kirim challenge ke teman (pilih durasi: 25 / 50 / 90 menit)
2. Teman accept → countdown 3, 2, 1... mulai!
3. Keduanya belajar materi **masing-masing** (berbeda boleh)
4. Focus integrity dilacak: tab switch = damage
5. Selesai → bandingkan focus score
6. Yang lebih fokus menang!

**Rewards:**
- Winner: +30 coins, +20 XP bonus
- Loser: +15 coins, +10 XP (tetap dapat karena belajar!)
- "Duel Champion" achievement setelah 10 wins

**Anti-toxic Rules:**
- Tidak ada W/L record publik
- Hanya "Total Duels Completed" yang terlihat di profil
- Emphasis: "both players learn" bukan "someone loses"
- Post-duel: mutual "Good Game!" prompt

**Real-time via WebSocket:**
- Lihat status opponent (fokus / terdistraksi)
- Visual: "Your opponent switched tabs! 💪 You're winning!"

---

### Mode 3: 🧠 Quiz Arena (P1)

**Konsep:** 2–8 pemain menjawab quiz dari materi yang sama secara live — seperti Kahoot! tapi dari materi sendiri.

**Cara Kerja:**
1. Host pilih materi yang sudah diproses AI
2. AI generate 10–15 quiz questions dari materi tersebut
3. Semua pemain join via room code
4. Pertanyaan muncul satu per satu, timer 30 detik
5. Lebih cepat jawab benar = lebih banyak poin (speed bonus)
6. Live scoreboard selama game
7. Podium 🥇🥈🥉 di akhir

**Scoring:**
```
Base correct answer: 1000 poin
Speed bonus: +0–500 poin (max jika jawab dalam 3 detik)
Streak bonus: +100 per consecutive correct
```

**Rewards:**
- Semua peserta: +20 XP (karena review materi)
- 🥇 +50 coins, 🥈 +30 coins, 🥉 +15 coins
- "Arena Champion" achievement setelah menang 5x
- Weekly Quiz Arena leaderboard

**Kenapa seru:** Kompetitif dalam konteks review, adrenaline-pumping, bagus untuk belajar bareng sebelum ujian.

---

### Mode 4: 🏃 Learning Relay (P1)

**Konsep:** Bagi materi panjang ke beberapa orang — setiap orang belajar 1 bagian, lalu "pass the baton".

**Cara Kerja:**
1. Creator upload materi panjang (misal: textbook 7 chapter)
2. AI pecah jadi N sections (sesuai jumlah peserta)
3. Invite 2–7 teman, assign 1 section per orang
4. Setiap orang belajar section mereka + tulis summary
5. Setelah semua selesai, summary digabung jadi ringkasan lengkap
6. Semua peserta quiz dari **seluruh** materi (baca summary teman)
7. Tim sukses jika semua lulus quiz!

**Rewards:**
- XP bonus +40% untuk setiap peserta
- "Relay Runner" achievement
- **Shared Knowledge Card** yang muncul di profil semua peserta (co-authored)

**Accountability Mechanism:** Jika 1 orang belum selesai, seluruh tim tidak bisa lanjut ke quiz → mendorong semua orang bertanggung jawab

---

### Mode 5: 📖 Study Room (P1)

**Konsep:** Ruang belajar virtual yang selalu buka — join kapan saja, belajar bareng dalam "hening yang nyaman."

**Cara Kerja:**
1. Buat atau join Study Room (public atau private, max 20 orang)
2. Setiap orang belajar materi **masing-masing**
3. Tampilan: daftar peserta + apa yang sedang mereka pelajari + timer mereka
4. Ambient presence — tahu ada orang lain juga sedang belajar
5. Komunikasi minimal: emoji reactions only (🔥❤️👍) untuk tidak distract
6. Shared Pomodoro timer: 25min belajar / 5min break
7. Optional: soft lo-fi music background (built-in player)

**Rewards:**
- XP bonus +10% selama belajar di Study Room
- "Social Learner" achievement
- Streak bonus jika rutin join Study Room (3+ hari berturut-turut)

**Kenapa seru:** Simulasi "belajar di perpustakaan bareng teman," social accountability tanpa pressure, low friction.

---

### Mode 6: 🎯 Weekly Community Challenge (P1)

**Konsep:** Challenge mingguan untuk seluruh komunitas — collective goal yang dikerjakan bersama.

**Contoh Challenges:**

| Week | Challenge | Community Goal | Reward |
|------|-----------|---------------|--------|
| 1 | "Read-a-thon" | 10.000 halaman total | All: +100 coins |
| 2 | "Focus Fortress" | 500 user capai 90%+ focus integrity | Exclusive badge |
| 3 | "Subject Sprint: Math" | 200 materi Math diselesaikan | Math-themed profile frame |
| 4 | "Quiz Mania" | 1.000 quiz perfect scores | "Quiz Legend" title |
| 5 | "Streak Army" | 100 user capai 7-day streak | Community milestone badge |

**Cara Kerja:**
1. Challenge otomatis muncul setiap Senin (auto-generated atau curated)
2. Progress bar komunitas terlihat di homepage dan Explore page
3. Setiap kontribusi user terlihat ("You contributed 5 pages to the Read-a-thon!")
4. Jika goal tercapai → semua yang berkontribusi dapat reward eksklusif
5. Hall of Fame untuk challenge completions

**Kenapa seru:** FOMO positif, rasa kebersamaan, reward eksklusif hanya dari event ini.

---

### Social Learning Modes Summary

| Mode | Players | Materi | Sifat | Priority |
|------|---------|--------|-------|----------|
| ⚔️ Study Raid | 2-5 | Sama | Cooperative | P0 (MVP) |
| 🥊 Focus Duel | 2 | Berbeda | Competitive (friendly) | P0 (MVP) |
| 🧠 Quiz Arena | 2-8 | Sama | Competitive (fun) | P1 |
| 🏃 Learning Relay | 2-7 | Dibagi | Cooperative | P1 |
| 📖 Study Room | 2-20 | Berbeda | Ambient | P1 |
| 🎯 Weekly Challenge | All | Varied | Community | P1 |

---

## 8. Technical Architecture

### 8.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                               │
│                   (Browser/Mobile Web)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  React SPA (Vite Build)                                         │
│  ├─ React 18.2+ (UI Components)                                 │
│  ├─ Recharts / Chart.js (Analytics & Heatmap)                   │
│  ├─ Zustand (State Management)                                  │
│  ├─ React Router v6 (Navigation)                                │
│  ├─ Tailwind CSS (Styling)                                      │
│  ├─ Framer Motion (Animations)                                  │
│  ├─ Axios (HTTP Client)                                         │
│  └─ Socket.io Client (WebSocket — Study Raids, Duels, Arena)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Laravel 12 (PHP 8.3+)                                          │
│  ├─ RESTful API Routes                                          │
│  ├─ Laravel Sanctum (Authentication)                            │
│  ├─ Laravel Reverb (WebSocket Server)                           │
│  ├─ Rate Limiting Middleware                                    │
│  └─ CORS Configuration                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│                  (Business Logic Services)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Laravel Services:                                              │
│  ├─ ContentAnalysisService (AI orchestration)                   │
│  ├─ LearningFlowService (adaptive routing)                      │
│  ├─ KnowledgeProfileService (XP, Level, Rank, Cards)            │
│  ├─ CoinEconomyService (transactions)                           │
│  ├─ QuizGeneratorService (AI quiz creation)                     │
│  ├─ FocusTrackerService (session monitoring)                    │
│  ├─ StreakService (streak tracking & rewards)                   │
│  ├─ AchievementService (badge awarding)                         │
│  ├─ SocialLearningService (raids, duels, arena, relay, room)    │
│  ├─ ProfileCardService (shareable PNG generation)               │
│  └─ LeaderboardService (weekly rankings)                        │
│                                                                 │
│  Laravel Jobs (Queue Workers):                                  │
│  ├─ AnalyzeContentJob (async AI processing)                     │
│  ├─ GenerateQuizJob (background quiz creation)                  │
│  ├─ ProcessKnowledgeCardJob (card creation & XP award)          │
│  ├─ SendNotificationJob (user notifications)                    │
│  └─ WeeklyChallengeResetJob (Monday reset)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PostgreSQL 15+ (Primary Database)                              │
│  ├─ Users, Authentication, Profile                              │
│  ├─ Learning Content, Sessions                                  │
│  ├─ Knowledge Cards, XP Events                                  │
│  ├─ Quizzes, Quiz Attempts                                      │
│  ├─ Coin Transactions, Wallets                                  │
│  ├─ Achievements, Streaks                                       │
│  └─ Social Features (Raids, Duels, Arena, Relay, Rooms)         │
│                                                                 │
│  Redis 7+ (Cache & Real-time)                                   │
│  ├─ Session cache                                               │
│  ├─ User online status + Study Room presence                    │
│  ├─ Leaderboard rankings (sorted sets)                          │
│  ├─ Active social learning sessions                             │
│  ├─ Weekly Challenge progress counters                          │
│  └─ WebSocket pub/sub channels                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI & ML Services:                                              │
│  ├─ Google Gemini 2.0 Flash (Content analysis, quiz gen)        │
│  ├─ YouTube Transcript API (Video transcript extraction)        │
│  └─ Tesseract.js Client-side (OCR for images)                   │
│                                                                 │
│  Third-Party:                                                   │
│  ├─ Google OAuth                                                │
│  ├─ Jina Reader API (Web scraping)                              │
│  └─ Email Service (SendGrid / Mailgun)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Technology Stack Detail

**Frontend Stack:**

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Framework** | React | 18.2+ | Component-based, large ecosystem |
| **Build Tool** | Vite | 5.0+ | Fast HMR, optimized production builds |
| **Charts/Heatmap** | Recharts | 2.x | Declarative, lightweight, great for analytics |
| **State Management** | Zustand | 4.4+ | Lightweight (<1KB), simple API |
| **Routing** | React Router | 6.21+ | De facto standard for React SPAs |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, rapid development |
| **HTTP Client** | Axios | 1.6+ | Promise-based, interceptors for auth |
| **WebSocket** | Socket.io Client | 4.6+ | Real-time communication for social modes |
| **Animations** | Framer Motion | 10.18+ | Declarative animations |
| **Canvas** | html2canvas | 1.4+ | Generate shareable profile card PNG |
| **Icons** | Lucide React | 0.303+ | Beautiful, consistent icon set |

> **Note:** Three.js / React Three Fiber / @react-three/drei **dihapus** dari stack. Tidak diperlukan lagi.

**Backend Stack:**

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Framework** | Laravel | 12.x | Competition requirement, batteries-included |
| **Language** | PHP | 8.3+ | JIT compiler performance |
| **Database** | PostgreSQL | 15+ | ACID compliance, JSONB support |
| **Cache/Queue** | Redis | 7.2+ | Leaderboards (sorted sets), WebSocket pub/sub |
| **WebSocket** | Laravel Reverb | 1.x | Official Laravel WebSocket for social modes |
| **Authentication** | Laravel Sanctum | 4.x | SPA authentication |
| **Queue Worker** | Laravel Queue | — | Async AI calls |

---

## 9. Database Schema

### 9.1 Users Table (Updated)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL, -- for public profile URL
    avatar_url VARCHAR(500),
    bio TEXT,
    
    -- Gamification (Knowledge Profile)
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    rank VARCHAR(50) DEFAULT 'Seedling', -- Seedling|Learner|Scholar|Researcher|Expert|Sage
    
    -- Streak
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    streak_freeze_available BOOLEAN DEFAULT true,
    last_learning_date DATE,
    weekly_goal INTEGER DEFAULT 5, -- days per week
    
    -- Stats
    total_xp_ever INTEGER DEFAULT 0,
    total_learning_hours INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_knowledge_cards INTEGER DEFAULT 0,
    
    -- Privacy
    is_profile_public BOOLEAN DEFAULT true,
    show_on_leaderboard BOOLEAN DEFAULT false,
    
    -- OAuth
    google_id VARCHAR(255) UNIQUE,
    
    -- Timestamps
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_users_leaderboard ON users(show_on_leaderboard, xp) WHERE show_on_leaderboard = true;
```

### 9.2 Knowledge Cards Table (Replaces Buildings)

```sql
CREATE TABLE knowledge_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_contents(id) ON DELETE SET NULL,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
    
    -- Card Identity
    title VARCHAR(500) NOT NULL,
    subject_category VARCHAR(100) NOT NULL,
    subject_icon VARCHAR(50), -- emoji or icon name
    subject_color VARCHAR(7), -- hex color for category
    
    -- Mastery Metrics
    mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage BETWEEN 0 AND 100),
    quiz_avg_score DECIMAL(5,2),
    focus_integrity DECIMAL(5,2),
    time_invested INTEGER DEFAULT 0, -- minutes
    
    -- Card Tier
    tier VARCHAR(20) DEFAULT 'Bronze', -- Bronze|Silver|Gold|Diamond
    
    -- Content
    summary_snippet TEXT, -- user's summary (first 300 chars)
    keywords JSONB, -- key concepts from the material
    
    -- Social
    is_pinned BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    likes INTEGER DEFAULT 0,
    
    -- Co-authored (Learning Relay)
    is_collaborative BOOLEAN DEFAULT false,
    collaborators JSONB, -- array of user_ids for relay cards
    
    -- Integrity Decay
    last_reviewed_at TIMESTAMP,
    integrity_decay_rate DECIMAL(3,2) DEFAULT 0.05, -- 5% per month after 90 days
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_user ON knowledge_cards(user_id);
CREATE INDEX idx_cards_category ON knowledge_cards(subject_category);
CREATE INDEX idx_cards_tier ON knowledge_cards(tier);
CREATE INDEX idx_cards_pinned ON knowledge_cards(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_cards_public ON knowledge_cards(is_public) WHERE is_public = true;
```

### 9.3 XP Events Table

```sql
CREATE TABLE xp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event Details
    xp_amount INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'section_complete'|'quiz_pass'|'quiz_perfect'|'summary'|'daily_login'|'raid_bonus'|'duel_win'|etc.
    description TEXT,
    
    -- Related Entities
    session_id UUID,
    social_session_id UUID, -- raid/duel/arena/relay id
    
    -- Snapshot (user's level before this event)
    level_before INTEGER,
    level_after INTEGER,
    xp_before INTEGER,
    xp_after INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id);
CREATE INDEX idx_xp_events_date ON xp_events(user_id, created_at);
```

### 9.4 Achievement Badges Table

```sql
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY, -- 'first_steps'|'bookworm'|'quiz_master'|etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji
    category VARCHAR(50), -- 'learning'|'social'|'streak'|'special'
    trigger_condition JSONB -- condition config for auto-awarding
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) REFERENCES achievements(id),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT false, -- featured on profile
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

### 9.5 Social Learning Tables (Updated)

```sql
-- Study Raids (Updated, no content requirement for builder)
CREATE TABLE study_raids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_contents(id) ON DELETE SET NULL,
    
    -- Config
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    max_participants INTEGER DEFAULT 5 CHECK (max_participants BETWEEN 2 AND 5),
    duration_minutes INTEGER, -- null = open-ended
    
    -- Status
    status VARCHAR(50) DEFAULT 'lobby', -- 'lobby'|'active'|'completed'|'abandoned'
    
    -- Results
    team_score DECIMAL(5,2), -- average score of all participants
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE raid_participants (
    raid_id UUID REFERENCES study_raids(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'creator'|'member'
    
    -- Performance
    progress_percentage INTEGER DEFAULT 0,
    quiz_score DECIMAL(5,2),
    focus_integrity DECIMAL(5,2),
    
    -- Rewards
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting'|'learning'|'completed'|'left'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    PRIMARY KEY (raid_id, user_id)
);

-- Focus Duels (Unchanged)
CREATE TABLE focus_duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Config
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (25, 50, 90)),
    
    -- Results
    challenger_focus_integrity DECIMAL(5,2),
    opponent_focus_integrity DECIMAL(5,2),
    winner_id UUID REFERENCES users(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending'|'accepted'|'active'|'completed'|'declined'|'expired'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP -- auto-expire 24h
);

-- Quiz Arena (NEW)
CREATE TABLE quiz_arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_contents(id) ON DELETE SET NULL,
    
    -- Config
    room_code VARCHAR(6) UNIQUE NOT NULL,
    max_players INTEGER DEFAULT 8 CHECK (max_players BETWEEN 2 AND 8),
    question_count INTEGER DEFAULT 10,
    time_per_question INTEGER DEFAULT 30, -- seconds
    
    -- Status
    status VARCHAR(50) DEFAULT 'lobby', -- 'lobby'|'active'|'completed'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE arena_participants (
    arena_id UUID REFERENCES quiz_arenas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Results
    total_score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    final_rank INTEGER,
    
    -- Rewards
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    
    PRIMARY KEY (arena_id, user_id)
);

-- Learning Relay (NEW)
CREATE TABLE learning_relays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_contents(id) ON DELETE SET NULL,
    
    -- Config
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    max_participants INTEGER DEFAULT 7 CHECK (max_participants BETWEEN 2 AND 7),
    
    -- Status
    status VARCHAR(50) DEFAULT 'lobby', -- 'lobby'|'active'|'summary'|'quiz'|'completed'
    
    -- Results
    combined_summary TEXT, -- merged summaries
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE relay_participants (
    relay_id UUID REFERENCES learning_relays(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Assignment
    section_index INTEGER NOT NULL, -- which section this person is responsible for
    section_content TEXT,
    
    -- Progress
    section_summary TEXT, -- their summary of their section
    section_completed BOOLEAN DEFAULT false,
    quiz_score DECIMAL(5,2),
    
    -- Rewards
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    
    PRIMARY KEY (relay_id, user_id)
);

-- Study Rooms (NEW)
CREATE TABLE study_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Config
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room_code VARCHAR(8) UNIQUE,
    is_public BOOLEAN DEFAULT true,
    max_capacity INTEGER DEFAULT 20,
    music_preset VARCHAR(50) DEFAULT 'lofi', -- 'lofi'|'classical'|'nature'|'silence'
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active'|'closed'
    current_pomodoro_phase VARCHAR(20) DEFAULT 'study', -- 'study'|'break'
    pomodoro_started_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE study_room_members (
    room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Presence
    is_online BOOLEAN DEFAULT true,
    current_material VARCHAR(500), -- what they're studying
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- XP earned in this session
    xp_earned INTEGER DEFAULT 0,
    
    PRIMARY KEY (room_id, user_id)
);

-- Weekly Community Challenges (NEW)
CREATE TABLE community_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Challenge Config
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50), -- 'pages_read'|'focus_integrity'|'materials_completed'|'quiz_perfect'|'streak'
    subject_filter VARCHAR(100), -- null = all subjects
    goal_value INTEGER NOT NULL, -- target number
    
    -- Timing
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    
    -- Progress
    current_value INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    
    -- Rewards
    reward_coins INTEGER DEFAULT 100,
    reward_badge_id VARCHAR(50),
    reward_frame VARCHAR(50), -- profile frame name
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_contributions (
    challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contribution_value INTEGER DEFAULT 0, -- how much this user contributed
    reward_claimed BOOLEAN DEFAULT false,
    
    PRIMARY KEY (challenge_id, user_id)
);
```

### 9.6 Friends System Table

```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending'|'accepted'|'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
```

### 9.7 Community Feed Table

```sql
CREATE TABLE feed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event
    event_type VARCHAR(50) NOT NULL, -- 'rank_up'|'achievement'|'streak_milestone'|'raid_complete'|'challenge_complete'
    event_data JSONB, -- flexible data
    
    -- Social
    likes INTEGER DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_likes (
    event_id UUID REFERENCES feed_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_feed_events_date ON feed_events(created_at DESC);
CREATE INDEX idx_feed_events_user ON feed_events(user_id);
```

---

## 10. API Specifications

### 10.1 API Design Principles

- **RESTful:** Resource-based URLs, HTTP verbs for actions
- **Versioning:** `/api/v1/` prefix
- **Authentication:** Bearer token (Laravel Sanctum)
- **Response Format:** Consistent JSON structure
- **Rate Limiting:** 60 req/min authenticated

### 10.2 Knowledge Profile Endpoints

```
GET  /api/v1/profile/me                          — My full profile
GET  /api/v1/profile/{username}                  — Public profile
PUT  /api/v1/profile/me                          — Update profile
GET  /api/v1/profile/me/heatmap                  — Learning heatmap data (52w)
GET  /api/v1/profile/me/cards                    — All knowledge cards
GET  /api/v1/profile/me/cards/pinned             — Pinned cards (max 6)
POST /api/v1/profile/me/cards/{id}/pin           — Pin a card
DELETE /api/v1/profile/me/cards/{id}/pin         — Unpin a card
GET  /api/v1/profile/me/achievements             — All achievements
GET  /api/v1/profile/me/xp-history              — XP event log
GET  /api/v1/profile/me/share-card              — Get shareable card PNG URL
POST /api/v1/profile/me/share-card/generate     — Regenerate share card
```

**GET /api/v1/profile/me — Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "andi_cs",
      "name": "Andi Pratama",
      "avatar_url": "/avatars/andi.jpg",
      "bio": "CS Student | Building my knowledge empire",
      "xp": 4250,
      "level": 22,
      "rank": "Scholar",
      "xp_to_next_level": 750,
      "current_streak": 14,
      "longest_streak": 30,
      "streak_freeze_available": true,
      "total_knowledge_cards": 18,
      "total_learning_hours": 87,
      "is_profile_public": true
    },
    "wallet": {
      "current_balance": 1250,
      "total_earned": 4500
    },
    "pinned_cards": [ /* array of 6 cards */ ],
    "featured_achievements": [ /* top 3 */ ],
    "recent_heatmap": [ /* last 7 days */ ]
  }
}
```

### 10.3 Social Learning Endpoints

**Study Raid Endpoints:**
```
POST /api/v1/raids/create          — Create raid (with content_id)
POST /api/v1/raids/{code}/join     — Join by invite code
GET  /api/v1/raids/{id}            — Get raid details
POST /api/v1/raids/{id}/start      — Start raid (creator only)
POST /api/v1/raids/{id}/progress   — Update my progress
POST /api/v1/raids/{id}/complete   — Mark my part as complete
GET  /api/v1/raids/my-raids        — My active & past raids
```

**Focus Duel Endpoints:**
```
POST /api/v1/duels/challenge        — Challenge user by username
POST /api/v1/duels/{id}/accept      — Accept challenge
POST /api/v1/duels/{id}/decline     — Decline
POST /api/v1/duels/{id}/start       — Start duel (both must confirm)
PATCH /api/v1/duels/{id}/focus-event — Send tab-switch or focus event
POST /api/v1/duels/{id}/complete    — Complete duel
GET  /api/v1/duels/my-duels        — My active & past duels
```

**Quiz Arena Endpoints:**
```
POST /api/v1/arena/create           — Create arena room
POST /api/v1/arena/{code}/join      — Join by room code
POST /api/v1/arena/{id}/start       — Start (host only)
POST /api/v1/arena/{id}/answer      — Submit answer for a question
GET  /api/v1/arena/{id}/results     — Final scoreboard
```

**Learning Relay Endpoints:**
```
POST /api/v1/relay/create           — Create relay
POST /api/v1/relay/{code}/join      — Join by invite code
POST /api/v1/relay/{id}/start       — Start relay
POST /api/v1/relay/{id}/summary     — Submit my section summary
POST /api/v1/relay/{id}/quiz        — Submit quiz answers
GET  /api/v1/relay/{id}/results     — Combined summary & results
```

**Study Room Endpoints:**
```
POST /api/v1/rooms/create           — Create room
GET  /api/v1/rooms/public           — Browse public rooms
POST /api/v1/rooms/{code}/join      — Join room
PATCH /api/v1/rooms/{id}/presence   — Update my status (material, active)
POST /api/v1/rooms/{id}/react       — Send emoji reaction
POST /api/v1/rooms/{id}/leave       — Leave room
```

**Weekly Challenge Endpoints:**
```
GET  /api/v1/challenges/current     — Get this week's challenge
GET  /api/v1/challenges/history     — Past challenges + user participation
GET  /api/v1/challenges/{id}/progress — Detailed community progress
```

### 10.4 Social Discovery Endpoints

```
GET  /api/v1/explore/trending       — Trending learners this week
GET  /api/v1/explore/rising-stars   — New users with high growth
GET  /api/v1/explore/hall-of-sages  — All Sage-rank users
GET  /api/v1/explore/by-subject/{subject} — Top learners by subject
GET  /api/v1/feed                   — Community feed (friends + global)
GET  /api/v1/leaderboards/focus     — Focus Champions (opt-in)
GET  /api/v1/leaderboards/knowledge — Knowledge Collectors
GET  /api/v1/leaderboards/streak    — Streak Warriors
GET  /api/v1/leaderboards/quiz      — Quiz Masters
GET  /api/v1/leaderboards/subject/{sub} — Subject leaderboard
POST /api/v1/friends/request/{username}  — Send friend request
POST /api/v1/friends/accept/{id}    — Accept request
GET  /api/v1/friends                — My friends list
GET  /api/v1/users/search?q={query} — Search users
```

### 10.5 WebSocket Events (Laravel Reverb)

**Channels:**
```javascript
// Raid real-time
echo.private(`raid.${raidId}`)
  .listen('RaidMemberProgress', (e) => { /* member progress update */ })
  .listen('RaidCompleted', (e) => { /* raid finished */ })
  .listenForWhisper('raid-chat', (e) => { /* chat message */ });

// Focus Duel real-time
echo.private(`duel.${duelId}`)
  .listen('OpponentFocusEvent', (e) => { /* tab switch or focus restored */ })
  .listen('DuelCompleted', (e) => { /* duel results */ });

// Quiz Arena real-time
echo.private(`arena.${arenaId}`)
  .listen('ArenaQuestionStart', (e) => { /* next question */ })
  .listen('ArenaScoreUpdate', (e) => { /* live scoreboard */ })
  .listen('ArenaCompleted', (e) => { /* final results */ });

// Study Room presence
echo.join(`room.${roomId}`)
  .here((users) => { /* current members */ })
  .joining((user) => { /* new member joined */ })
  .leaving((user) => { /* member left */ })
  .listenForWhisper('reaction', (e) => { /* emoji reaction */ });

// Personal notifications
echo.private(`user.${userId}`)
  .listen('XPAwarded', (e) => { /* xp + level up notification */ })
  .listen('AchievementUnlocked', (e) => { /* badge earned */ })
  .listen('StreakAlert', (e) => { /* reminder to keep streak */ })
  .listen('RaidInvite', (e) => { /* invited to raid */ });
```

---

## 11. AI Integration Strategy

### 11.1 AI Services Overview

| Service | Purpose | Cost | Rate Limit |
|---------|---------|------|------------|
| **Google Gemini 2.0 Flash** | Content analysis, quiz gen, summary validation | Free (1500 req/day) | 60 RPM |
| **YouTube Transcript API** | Video transcript extraction | Free | Unlimited |
| **Tesseract.js** | OCR (client-side) | Free | Unlimited |

### 11.2 Gemini Integration

Seluruh integrasi AI sama dengan PRD v1.0, dengan tambahan:

**Knowledge Card Metadata Generation Prompt:**
```
System: You are an educational content metadata specialist.

Task: Given this learning session data, generate Knowledge Card metadata:
- subject_category: (e.g., "Computer_Science", "Mathematics", "Physics")
- subject_icon: (single relevant emoji)
- subject_color: (hex color appropriate for this subject)
- keywords: array of 5-10 key concepts from the material
- card_title: concise, engaging title for the card

Material Title: {title}
Summary: {user_summary}
Quiz Topics: {quiz_topics}

Output ONLY valid JSON.
```

### 11.3 Quiz Arena Question Generation

Untuk Quiz Arena, AI generate pertanyaan yang lebih "game-like":

```
System: You are creating live quiz questions for an educational game show.

Requirements:
- Questions must be answerable within 30 seconds
- Include some trick/distractor questions
- Mix difficulty (30% easy, 50% medium, 20% hard)
- Make it FUN — engaging phrasing, not dry academic questions
- num_questions: {n} questions from this material

Output format: Same JSON as standard quiz generation.
```

---

## 12. Adaptive Learning Flows

*Seluruh flow sama seperti PRD v1.0 (Document Dungeon, Interactive Theater, Scout & Conquer, Visual Quest, Presentation Arena) — tidak ada perubahan pada core learning mechanics.*

### 12.1 Reward Output per Flow (Updated)

Setelah selesai learning session, outputnya:

**Sebelumnya (v1.0):** Building construction progress + coins
**Sekarang (v2.0):** Knowledge Card creation + XP + coins

```php
// app/Services/KnowledgeProfileService.php
class KnowledgeProfileService
{
    public function processSessionCompletion(LearningSession $session): array
    {
        $user = $session->user;
        
        // 1. Create Knowledge Card
        $mastery = $this->calculateMastery($session);
        $tier = $this->determineTier($mastery);
        
        $card = KnowledgeCard::create([
            'user_id' => $user->id,
            'content_id' => $session->content_id,
            'session_id' => $session->id,
            'title' => $session->content->title,
            'subject_category' => $session->content->subject_category,
            'mastery_percentage' => $mastery,
            'quiz_avg_score' => $session->quiz_score,
            'focus_integrity' => $session->focus_integrity,
            'time_invested' => $session->actual_duration,
            'tier' => $tier,
            'summary_snippet' => substr($session->summary, 0, 300),
            'keywords' => $session->content->keywords,
        ]);
        
        // 2. Award XP
        $xpBreakdown = $this->calculateXP($session);
        $this->awardXP($user, $xpBreakdown);
        
        // 3. Check level up
        $levelUp = $this->checkLevelUp($user);
        
        // 4. Check achievements
        $newAchievements = $this->checkAchievements($user, $session, $card);
        
        // 5. Update streak
        $streakResult = $this->updateStreak($user);
        
        // 6. Award coins
        $coins = $this->coinEconomy->awardSessionCoins($session);
        
        return [
            'card' => $card,
            'xp_breakdown' => $xpBreakdown,
            'level_up' => $levelUp,
            'new_achievements' => $newAchievements,
            'streak' => $streakResult,
            'coins_earned' => $coins,
        ];
    }
    
    private function calculateMastery(LearningSession $session): int
    {
        // Weighted: quiz 40%, focus 30%, summary 30%
        $quizScore = $session->quiz_score ?? 0;
        $focusScore = $session->focus_integrity ?? 0;
        $summaryScore = $session->summary_score ?? 0;
        
        return round(($quizScore * 0.4) + ($focusScore * 0.3) + ($summaryScore * 0.3));
    }
    
    private function determineTier(int $mastery): string
    {
        return match(true) {
            $mastery === 100 => 'Diamond',
            $mastery >= 90  => 'Gold',
            $mastery >= 80  => 'Silver',
            default         => 'Bronze',
        };
    }
}
```

---

## 13. UX/UI Design System

### 13.1 Design Philosophy

- **Dark-first:** Dark mode as default (feels premium, reduces eye strain for night studying)
- **Vibrant accents:** Purple/violet gradient sebagai primary brand color
- **Gamified without childish:** Mature aesthetic, not cartoon
- **Data-driven beautiful:** Analytics charts sebagai centerpiece visual

### 13.2 Color Palette

```css
/* Brand Colors */
--color-primary: #7C3AED;        /* violet-600 */
--color-primary-light: #A78BFA;  /* violet-400 */
--color-secondary: #06B6D4;      /* cyan-500 */
--color-accent: #F59E0B;         /* amber-500 — XP, gold tier */

/* Rank Colors */
--rank-seedling: #22C55E;        /* green */
--rank-learner: #3B82F6;         /* blue */
--rank-scholar: #8B5CF6;         /* violet */
--rank-researcher: #06B6D4;      /* cyan */
--rank-expert: #F59E0B;          /* amber */
--rank-sage: #EF4444;            /* red/crimson */

/* Card Tier Colors */
--tier-bronze: #CD7F32;
--tier-silver: #C0C0C0;
--tier-gold: #FFD700;
--tier-diamond: linear-gradient(135deg, #B9F2FF, #A78BFA, #FFB3C1);

/* Heatmap Colors */
--heat-0: #1A1A2E;    /* no activity */
--heat-1: #16213E;
--heat-2: #0F3460;
--heat-3: #533483;
--heat-4: #7C3AED;    /* max activity */

/* Background */
--bg-primary: #0F0F1A;
--bg-secondary: #1A1A2E;
--bg-card: #1E1E32;
--bg-elevated: #252540;
```

### 13.3 Component Library

**Knowledge Card Component:**
```jsx
const KnowledgeCard = ({ card, variant = 'default' }) => {
  const tierConfig = {
    Bronze: { border: 'border-amber-700', glow: '' },
    Silver: { border: 'border-gray-400', glow: 'shadow-gray-400/20' },
    Gold: { border: 'border-yellow-400', glow: 'shadow-yellow-400/30 shadow-lg' },
    Diamond: { border: 'border-transparent', glow: 'shadow-purple-400/40 shadow-xl diamond-gradient' }
  };
  
  const config = tierConfig[card.tier];
  
  return (
    <div className={`
      relative bg-bg-card rounded-xl p-4 border-2 ${config.border} ${config.glow}
      transition-all duration-300 hover:scale-105 cursor-pointer
    `}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{card.subject_icon}</span>
        <div>
          <h3 className="text-white font-semibold text-sm line-clamp-1">{card.title}</h3>
          <span className="text-xs" style={{ color: card.subject_color }}>
            {card.subject_category}
          </span>
        </div>
        <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full tier-${card.tier.toLowerCase()}`}>
          {card.tier}
        </span>
      </div>
      
      {/* Mastery Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Mastery</span>
          <span className="text-white font-bold">{card.mastery_percentage}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${card.mastery_percentage}%`,
              background: `var(--tier-${card.tier.toLowerCase()})`
            }}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-400">
        <span>🎯 {card.quiz_avg_score}% quiz</span>
        <span>⚡ {card.focus_integrity}% focus</span>
        <span>⏱️ {card.time_invested}m</span>
      </div>
    </div>
  );
};
```

**Learning Heatmap Component:**
```jsx
const LearningHeatmap = ({ data }) => {
  // data = array of { date, session_count, total_minutes }
  // 52 weeks × 7 days grid
  
  const getIntensity = (value) => {
    if (!value || value === 0) return 0;
    if (value < 30) return 1;
    if (value < 60) return 2;
    if (value < 120) return 3;
    return 4;
  };
  
  return (
    <div className="learning-heatmap">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-[11px] h-[11px] rounded-sm heat-${getIntensity(day?.total_minutes)}`}
                title={day ? `${day.date}: ${day.session_count} sessions` : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 13.4 Key Screens

**Dashboard / Home:**
- XP progress bar + level badge (header)
- Today's streak status + daily goal
- Active Weekly Challenge progress bar
- Active Social Learning sessions (raids, rooms)
- Recent Knowledge Cards (last 3)
- Quick "Start Learning" CTA

**Knowledge Profile Page:**
- Full heatmap (52 weeks)
- Level + Rank display
- Pinned cards (6-grid)
- Achievement showcase
- Stats overview
- Learning analytics charts (tab)

**Content Library:**
- Grid/list view of materials
- Filter by subject, status
- "Start Learning" per item

**Social Hub:**
- Active Study Rooms
- Open Study Raids
- Friends' status
- Community Feed

---

## 14. Security & Anti-Cheating

### 14.1 Input Validation & Security

- Server-side validation on all API endpoints (Laravel FormRequests)
- XSS prevention (sanitize inputs)
- SQL injection prevention (Eloquent ORM)
- CSRF protection (Sanctum)
- File upload validation (type, size)
- Rate limiting (60/min auth, 10/min guest)
- CORS restricted to frontend domain

### 14.2 Anti-Cheat Measures

- **Tab switch detection** (visibilitychange API) → reduces focus integrity
- **Minimum reading time validation** (server-side per section length)
- **Quiz randomization** (shuffle questions & options)
- **Quiz cooldown** (prevent rapid retake — 5 min cooldown)
- **Focus session duration validation** (server timestamp vs client)
- **Coin earning daily/weekly caps** (500 coins/day)
- **Summary length & quality minimum** (min 100 chars, AI validates coherence)
- **XP earning caps** (prevent gaming the system)

### 14.3 Social Mode Anti-Cheat

- **Raid:** Each participant must pass their own quiz individually
- **Duel:** Focus integrity calculated server-side from real tab events
- **Arena:** Answer locking (can't change after submit), timer enforced server-side
- **Relay:** Summary must meet minimum quality threshold before allowing quiz

### 14.4 Data Privacy

- Privacy policy page
- Profile public/private toggle
- Leaderboard opt-in (default: off)
- User data export capability
- Account deletion flow (GDPR)

---

## 15. Development Roadmap

### 15.1 Competition Timeline (8 Weeks)

**Week 1–2: Foundation & Core Setup**
- Laravel 12 + React 18 setup
- Database schema implementation (all tables)
- Authentication (email + Google OAuth)
- Content upload system (PDF, URL)
- Gemini API integration (content analysis)

**Deliverable:** User can sign up, upload PDF, AI analyzes content

---

**Week 3–4: Core Learning Flow + Knowledge Profile**
- Document Dungeon flow (complete: read + focus + quiz + summary)
- Knowledge Profile System: XP, Level, Rank, Knowledge Cards
- Learning Heatmap (pure CSS/SVG)
- Streak System
- Coin Economy

**Deliverable:** End-to-end session works, Knowledge Card appears, XP gained

---

**Week 5–6: Social Features (P0) + Social Discovery**
- Study Raid (real-time, WebSocket)
- Focus Duel (real-time, WebSocket)
- Public Knowledge Profile (shareable URL)
- Shareable Profile Card (PNG auto-generated)
- Achievement Badges (basic set)

**Deliverable:** Social learning works, profiles shareable

---

**Week 7: Polish + P1 Social Modes**
- Quiz Arena (if time permits)
- Explore Page
- Community Feed
- Learning Analytics Dashboard (charts)
- Performance optimization

**Deliverable:** Rich social features, polished UX

---

**Week 8: Competition Prep**
- Bug fixes & testing
- Demo data seeding (impressive profiles + active social modes)
- Video presentation recording
- Documentation finalization
- Production deployment

**Deliverable:** Polished demo ready for judges

---

### 15.2 Post-Competition Roadmap

**Phase 1 (Month 1–2):**
- YouTube flow (Interactive Theater)
- Article flow (Scout & Conquer)
- Learning Relay + Study Room
- Weekly Community Challenge (full automation)
- Mobile app (React Native)

**Phase 2 (Month 3–4):**
- Image flow (Visual Quest)
- PPT flow (Presentation Arena)
- Full Achievement system
- Subject Communities

**Phase 3 (Month 5–6):**
- Educator dashboard
- Class management features
- API for third-party integrations
- Multi-language support

---

## 16. Testing Strategy

### 16.1 Backend Tests (PHPUnit)

**Unit Tests:**
```php
// KnowledgeProfileServiceTest
class KnowledgeProfileServiceTest extends TestCase
{
    public function test_mastery_calculation()
    {
        $session = LearningSession::factory()->create([
            'quiz_score' => 90,
            'focus_integrity' => 85,
            'summary_score' => 80,
        ]);
        
        $service = new KnowledgeProfileService();
        $mastery = $service->calculateMastery($session);
        
        // (90*0.4) + (85*0.3) + (80*0.3) = 36 + 25.5 + 24 = 85.5 → 86
        $this->assertEquals(86, $mastery);
    }
    
    public function test_tier_determination()
    {
        $service = new KnowledgeProfileService();
        
        $this->assertEquals('Diamond', $service->determineTier(100));
        $this->assertEquals('Gold', $service->determineTier(95));
        $this->assertEquals('Silver', $service->determineTier(85));
        $this->assertEquals('Bronze', $service->determineTier(75));
    }
    
    public function test_xp_award_triggers_level_up()
    {
        $user = User::factory()->create(['xp' => 990, 'level' => 9]);
        $service = new KnowledgeProfileService();
        
        $service->awardXP($user, ['total' => 50, 'sources' => [/* ... */]]);
        
        $user->refresh();
        $this->assertEquals(1040, $user->xp);
        $this->assertEquals(10, $user->level);
    }
}
```

**Feature Tests:**
```php
// Complete session → card created
public function test_complete_learning_session_creates_knowledge_card()
{
    $user = User::factory()->create();
    $content = LearningContent::factory()->ready()->create(['user_id' => $user->id]);
    
    // Start session
    $response = $this->actingAs($user)->postJson('/api/v1/sessions/start', [
        'content_id' => $content->id
    ]);
    $sessionId = $response->json('data.session_id');
    
    // Complete session
    $response = $this->actingAs($user)->postJson("/api/v1/sessions/{$sessionId}/complete", [
        'summary' => 'This is a comprehensive summary of what I learned about data structures.',
        'actual_duration' => 30
    ]);
    
    $response->assertStatus(200);
    
    // Knowledge Card should be created
    $this->assertDatabaseHas('knowledge_cards', [
        'user_id' => $user->id,
        'content_id' => $content->id,
    ]);
    
    // XP should be awarded
    $user->refresh();
    $this->assertGreaterThan(0, $user->xp);
}
```

### 16.2 Frontend Tests (Jest + RTL)

```javascript
// KnowledgeCard.test.jsx
describe('KnowledgeCard', () => {
  test('shows correct tier styling for Diamond card', () => {
    const card = { tier: 'Diamond', mastery_percentage: 100, /* ... */ };
    render(<KnowledgeCard card={card} />);
    
    expect(screen.getByText('Diamond')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
  
  test('renders mastery bar at correct width', () => {
    const card = { tier: 'Gold', mastery_percentage: 92, /* ... */ };
    render(<KnowledgeCard card={card} />);
    
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ width: '92%' });
  });
});
```

### 16.3 E2E Tests (Cypress)

```javascript
describe('Knowledge Profile Flow', () => {
  it('shows knowledge card after completing session', () => {
    cy.login('test@example.com', 'password');
    
    cy.get('[data-cy=upload-button]').click();
    cy.get('input[type=file]').attachFile('test-doc.pdf');
    cy.contains('Ready to Learn', { timeout: 30000 }).should('be.visible');
    
    cy.get('[data-cy=start-session]').click();
    // ... complete session ...
    cy.get('[data-cy=complete-session]').click();
    
    // Knowledge card should appear
    cy.get('[data-cy=nav-profile]').click();
    cy.contains('Bronze').should('be.visible'); // or Silver/Gold/Diamond
    cy.get('[data-cy=knowledge-cards]').should('have.length.greaterThan', 0);
  });
  
  it('increments XP after session', () => {
    cy.login('test@example.com', 'password');
    cy.get('[data-cy=xp-display]').invoke('text').as('xpBefore');
    
    // Complete session...
    
    cy.get('[data-cy=xp-display]').invoke('text').then((xpAfter) => {
      cy.get('@xpBefore').should('not.eq', xpAfter);
    });
  });
});
```

### 16.4 Performance Testing

- Lighthouse audit (target >90 — much easier without Three.js!)
- API response time testing (<200ms for most endpoints)
- AI response time (<10s for content analysis)
- WebSocket latency for real-time social modes (<100ms)

---

## 17. Deployment Plan

### 17.1 Infrastructure (Competition Phase)

**Frontend (Vercel):**
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "src": "/assets/(.*)", "headers": { "cache-control": "public, max-age=31536000, immutable" } },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Backend (Railway):**
```dockerfile
FROM php:8.3-fpm-alpine
RUN apk add --no-cache postgresql-dev libpng-dev zip unzip
RUN docker-php-ext-install pdo pdo_pgsql gd
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN composer install --no-dev --optimize-autoloader
EXPOSE 8000
CMD php artisan migrate --force && php artisan queue:work --daemon & php artisan serve --host=0.0.0.0 --port=8000
```

**Environment Variables (Backend):**
```bash
APP_NAME=AETHEREUM
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
GEMINI_API_KEY=${GEMINI_API_KEY}
REVERB_APP_ID=${REVERB_APP_ID}
REVERB_APP_KEY=${REVERB_APP_KEY}
REVERB_APP_SECRET=${REVERB_APP_SECRET}
SANCTUM_STATEFUL_DOMAINS=aethereum.vercel.app
```

---

## 18. Success Metrics & KPIs

### 18.1 Competition Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Demo Success Rate** | 100% | All features work during live demo |
| **Load Time (Initial)** | <2s | Lighthouse >90 (no Three.js = much better) |
| **Profile Page Render** | <500ms | React profiler |
| **AI Response Time** | <10s | Upload to analysis complete |
| **WebSocket Latency** | <100ms | Social mode responsiveness |
| **Judge Satisfaction** | 85/100+ | Based on scoring rubric |

### 18.2 Post-Launch Metrics

**Engagement:**
- DAU / WAU / MAU
- Average session duration
- Sessions per user per week
- Knowledge Cards created per week
- Social mode participation rate

**Learning Effectiveness:**
- Average mastery percentage per card
- Quiz score improvement over time
- Streak retention rate (% users with >7 day streak)
- Material completion rate

**Virality:**
- Profile cards shared (PNG downloads)
- New signups from referral links
- Community feed interactions

---

## 19. Risk Management

### 19.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **AI API Rate Limit** | Medium | High | Cache responses, queue system, fallback pre-generated quizzes |
| **WebSocket Instability** | Medium | Medium | Reconnection logic, fallback to HTTP polling |
| **Database Scaling** | Low | Medium | PostgreSQL connection pooling, Redis caching |
| **File Upload Abuse** | Medium | High | File size limits, rate limiting, type validation |
| **Profile Card Generation Slow** | Low | Low | Pre-generate on session complete, cache |

### 19.2 Competition Risks

| Risk | Mitigation |
|------|------------|
| **Demo Fails** | Pre-record backup video, seeded demo data |
| **Internet Issues** | Local dev server ready, offline demo mode |
| **Judge Questions** | Prepare FAQ, practice Q&A |
| **Time Runs Out** | P0 only ruthlessly, cut scope if needed |
| **Bugs Last Minute** | Code freeze 2 days before, critical fixes only |

### 19.3 User Safety Risks

| Risk | Mitigation |
|------|------------|
| **Inappropriate AI Content** | Content moderation, flag system |
| **Cheating System** | Tab tracking, quiz randomization, server-side validation |
| **Data Privacy** | GDPR compliance, clear privacy policy |
| **Toxic Leaderboard** | Opt-in only, weekly reset, no individual "loser" shaming |

---

## 20. Competition Strategy

### 20.1 What Changed vs v1.0 (for Judges)

| Aspect | v1.0 (3D City) | v2.0 (Knowledge Profile) |
|--------|---------------|--------------------------|
| **Tech Complexity** | Three.js, WebGL, LOD, GLB models | Pure CSS, SVG, Chart.js |
| **Performance** | Risk of lag on low-end devices | Guaranteed fast (<2s load) |
| **Dev Time** | 60% time on 3D rendering | 60% time on features + social |
| **Wow Factor** | Visual (3D city) | Social (6 learning modes) |
| **Scalability** | Limited by 3D model library | Infinite (data-driven) |
| **Demo Risk** | High (3D may lag on judge's device) | Low (pure web, always works) |

### 20.2 Competition Presentation Script (v2.0)

**Opening (30 seconds):**
> "Imagine you're a student with 50 PDFs in your Google Drive, 100 bookmarked articles, and a YouTube playlist of tutorials you've never watched. You want to learn, but it's boring, you get distracted, and you can't even tell if you're actually improving.
>
> This is the reality for millions of students. They have unlimited information, but no system to master it.
>
> We built AETHEREUM to solve this."

**Problem (1 minute):**
> "The problem isn't lack of content. The problem is passive consumption, no accountability, and no proof of progress.
>
> Traditional apps are either platform-locked, passive, or boring. They don't solve the real problem."

**Solution Demo (4 minutes):**
> "AETHEREUM solves this with three innovations:
>
> **One: Bring Your Own Content**
> Upload any learning material — PDFs, YouTube, articles, PowerPoints.
> Our AI analyzes and structures it into an optimal learning path.
>
> **Two: Active Learning with Knowledge Validation**
> You're in a focus session with distraction detection.
> You must pass an AI-generated quiz and write a summary to prove understanding.
>
> **Three: Your Knowledge Profile — The Visual Proof**
> Every completed material becomes a Knowledge Card in your profile.
> Your Heatmap shows your consistency. Your Level and Rank show your mastery.
> Your profile is public — shareable on Instagram, WhatsApp, wherever.
> And with 6 Social Learning Modes — from Study Raids to Quiz Arena — learning becomes a social adventure."

**Technical Highlights (1 minute):**
> "Tech stack: Laravel 12 + React 18, PostgreSQL, Redis, Google Gemini AI.
> Real-time WebSocket for social modes. Auto-generated shareable Profile Cards.
> Optimized for low-end mobile — no heavy 3D, pure CSS/SVG animations."

**Impact (30 seconds):**
> "AETHEREUM doesn't just help you learn. It helps you build a Knowledge Empire — and prove it to the world."

---

## 21. Appendices

### 21.1 Glossary (Updated)

| Term | Definition |
|------|------------|
| **BYOC** | Bring Your Own Content — upload any learning material |
| **Knowledge Card** | Visual badge earned by completing a material (replaces Building) |
| **Mastery %** | 0-100 measure of learning quality (quiz + focus + summary) |
| **Focus Coins** | Currency earned from discipline, spent on profile customizations |
| **Integrity Score** | Focus integrity: % of session spent without distractions |
| **XP** | Experience Points earned from all learning activities |
| **Rank** | Title based on level (Seedling → Learner → Scholar → Researcher → Expert → Sage) |
| **Learning Heatmap** | GitHub-style 52-week activity visualization |
| **Study Raid** | Cooperative real-time learning session (2-5 players, same material) |
| **Focus Duel** | 1v1 discipline challenge (each learns own material) |
| **Quiz Arena** | Multiplayer live quiz battle (2-8 players, same material) |
| **Learning Relay** | Cooperative relay where each person learns one section (2-7 players) |
| **Study Room** | Ambient virtual co-working space (2-20 players) |
| **Weekly Challenge** | Community-wide collective goal, reset every Monday |
| **Document Dungeon** | Learning flow for PDF/text documents |
| **Interactive Theater** | Learning flow for YouTube videos |

### 21.2 Technology Decisions (Updated)

**Why remove Three.js?**
- Development overhead too high for 8-week competition timeline
- Risk of performance issues on low-end devices (judge's computer!)
- 60% of dev time would go to 3D rendering, not features
- Knowledge Profile system is equally engaging with 10% of the effort

**Why React + Recharts for heatmap?**
- Pure declarative components, no WebGL complexity
- Recharts is production-ready, beautiful by default
- Heatmap can be done with pure CSS grid (no library needed!)

**Why Laravel 12 + PostgreSQL?**
- Competition requirement (PHP)
- JSONB for flexible quiz/card data
- Sorted sets in Redis for instant leaderboard queries

**Why Socket.io for social modes?**
- Auto-reconnection, fallback to long-polling
- Rooms/namespaces perfect for Study Room / Raid / Arena channels
- Laravel Reverb (official) compatible

### 21.3 Key Selling Points for Judges (v2.0)

1. **Solves Real Pain:** Everyone has abandoned PDFs and unwatched tutorials
2. **Better Execution Risk:** Knowledge Profile is 100% reliable vs 3D City's GPU risk
3. **Richer Social Features:** 6 social learning modes (Study Raid, Focus Duel, Quiz Arena, Learning Relay, Study Room, Weekly Challenge)
4. **Blue Ocean:** No competitor offers BYOC + gamified Knowledge Profile + 6 social modes
5. **AI-Powered:** Gemini integration for content analysis, quiz gen, and summary validation
6. **Shareable by Design:** Profile Cards go viral on social media
7. **Scalable:** No 3D models, infinite content through BYOC

---

## END OF PRD v2.0

**Document Status:** COMPLETE (Revised)  
**Total Sections:** 21  
**Estimated Implementation Time:** 8 weeks (MVP) — reduced risk vs v1.0  
**Target Competition:** FICPACT CUP 2026  
**Key Change:** 3D City System → Knowledge Profile System + Social Learning Modes

---

**Next Steps:**
1. Review PRD v2.0 dengan seluruh team
2. Update DEVELOPMENT_CHECKLIST.md (Phase 5 replaced)
3. Set up development environment
4. Initialize Git repository
5. Begin Week 1 development sprint
