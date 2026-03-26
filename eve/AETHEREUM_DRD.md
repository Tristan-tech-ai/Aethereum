# AETHEREUM — Design Requirement Document (DRD)

**Version:** 2.0  
**Last Updated:** March 25, 2026  
**Project:** AETHEREUM: Knowledge Empire (Nexera)  
**Competition:** FICPACT CUP 2026  
**Tech Stack:** Laravel 12 + React 19 + PostgreSQL + Supabase Auth + Recharts 3 + Tailwind CSS 4  
**Reference:** [PRD v2.0](file:///c:/Users/adiii/Herd/Aetherium/eve/AETHEREUM_PRD_MERGED_v2.md)

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Design System Foundation](#2-design-system-foundation)
3. [Typography System](#3-typography-system)
4. [Spacing & Layout Grid](#4-spacing--layout-grid)
5. [Iconography & Illustrations](#5-iconography--illustrations)
6. [Component Library Specifications](#6-component-library-specifications)
7. [Page-Level Design Specifications](#7-page-level-design-specifications)
8. [Gamification Visual System](#8-gamification-visual-system)
9. [Social Learning Mode UI](#9-social-learning-mode-ui)
10. [Animation & Motion System](#10-animation--motion-system)
11. [Responsive Design Strategy](#11-responsive-design-strategy)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Interaction Design Patterns](#13-interaction-design-patterns)
14. [Empty States, Loading & Error Patterns](#14-empty-states-loading--error-patterns)
15. [Onboarding & First-Time User Experience](#15-onboarding--first-time-user-experience)
16. [Notification & Feedback System](#16-notification--feedback-system)
17. [Performance Budgets](#17-performance-budgets)

---

## 1. Design Philosophy & Principles

### 1.1 Core Design Vision

> **"Calm Premium Dark meets Scholarly Elegance"**  
> Nexera harus terasa seperti perpaduan antara **Discord's dark sleekness**, **GitHub's data-driven profile**, dan **Duolingo's gamified engagement** — tetapi dengan identitas visual unik: **calm blue-purple palette** bertemakan kerajaan pengetahuan. Warnanya biru dan ungu yang tenang — sophisticated, bukan mencolok.

### 1.2 Design Principles

| # | Principle | Deskripsi | Implementasi |
|---|-----------|-----------|--------------|
| 1 | **Dark-First Premium** | Dark mode sebagai default; terasa mahal, bukan murahan | Background `#0F0F1A`, bukan pure black. Subtle gradients. |
| 2 | **Data as Art** | Data belajar divisualisasikan secara indah | Recharts bar/area charts, SVG donut, progress rings sebagai centerpiece |
| 3 | **Gamified, Not Childish** | Gamifikasi dewasa, bukan kartun anak-anak | Lucide icons (bukan emoji), refined glow effects, clean stat cards |
| 4 | **Feedback-Rich** | Setiap aksi mendapat visual feedback | Micro-animations, haptic-like transitions, toast notifications |
| 5 | **Progressive Disclosure** | Tampilkan info secara bertahap, kurangi cognitive load | Expandable cards, tab navigation, modal untuk detail |
| 6 | **Social Proof Everywhere** | Tunjukkan aktivitas komunitas untuk FOMO positif | Live counters, leaderboard widget, "X users studying now" |
| 7 | **Mobile-First Responsive** | Dirancang dari mobile ke atas | Touch-friendly targets (min 44px), collapsible layouts |
| 8 | **Professional Iconography** | Gunakan icon library profesional (Lucide), TIDAK emoji/emote | Semua stat cards, nav items, badges menggunakan Lucide React icons |
| 9 | **Relaxed & Playful** | UI terasa santai tapi tetap profesional | Rounded corners (xl), soft shadows, smooth hover lift, generous spacing |
| 10 | **Calm Color Palette** | Warna blue-purple yang tenang sebagai identitas Nexera | Primary `#7C3AED` (purple), secondary `#06B6D4` (cyan), info `#3B82F6` (blue) |

### 1.3 Emotional Design Goals

```
DISCOVERY → "Wow, ini keren banget!" (Visual impact)
ONBOARDING → "Oh, gampang ternyata!" (Simplicity)
FIRST SESSION → "Gue ga nyangka belajar bisa se-seru ini!" (Delight)
HABIT → "Streak gue udah 14 hari, ga boleh putus!" (Commitment)
MASTERY → "Profile gue keren, mau di-share!" (Pride)
SOCIAL → "Ayo raid bareng!" (Belonging)
```

---

## 2. Design System Foundation

### 2.1 Color Palette

#### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#7C3AED` | CTA buttons, active states, links, primary accents |
| `--color-primary-light` | `#A78BFA` | Hover states, secondary accents, highlights |
| `--color-primary-dark` | `#6D28D9` | Pressed states, borders |
| `--color-secondary` | `#06B6D4` | Secondary actions, info badges, complementary accents |
| `--color-accent` | `#F59E0B` | XP indicators, gold tier, warnings, star ratings |

#### Background Hierarchy (Elevation System)

| Token | Hex | Elevation | Usage |
|-------|-----|-----------|-------|
| `--bg-base` | `#0A0A14` | E0 | Page background (deepest) |
| `--bg-primary` | `#0F0F1A` | E1 | Main content area |
| `--bg-secondary` | `#1A1A2E` | E2 | Sections, sidebar |
| `--bg-card` | `#1E1E32` | E3 | Cards, panels |
| `--bg-elevated` | `#252540` | E4 | Modals, dropdowns, popovers |
| `--bg-overlay` | `rgba(0,0,0,0.6)` | — | Modal backdrop |

> **Aturan:** Semakin tinggi elevation, semakin terang warna background. Ini menciptakan depth tanpa shadow yang berat.

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#22C55E` | Quiz pass, streak active, online status |
| `--color-danger` | `#EF4444` | Errors, streak broken, distraction alert |
| `--color-warning` | `#F59E0B` | At-risk streak, low focus integrity |
| `--color-info` | `#3B82F6` | Information, tips, hints |

#### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#F1F5F9` | Headings, primary content |
| `--text-secondary` | `#94A3B8` | Body text, descriptions |
| `--text-muted` | `#64748B` | Captions, timestamps, placeholders |
| `--text-disabled` | `#475569` | Disabled text |
| `--text-inverse` | `#0F172A` | Text on light backgrounds |

#### Rank Colors

| Rank | Color | Hex |
|------|-------|-----|
| 🌱 Seedling | Green | `#22C55E` |
| 📗 Learner | Blue | `#3B82F6` |
| 📘 Scholar | Violet | `#8B5CF6` |
| 🔬 Researcher | Cyan | `#06B6D4` |
| 🎓 Expert | Amber | `#F59E0B` |
| 🏛️ Sage | Crimson | `#EF4444` |

#### Card Tier Colors

| Tier | Border Color | Glow Effect |
|------|-------------|-------------|
| 🥉 Bronze | `#CD7F32` | None |
| 🥈 Silver | `#C0C0C0` | `0 0 8px rgba(192,192,192,0.2)` |
| 🥇 Gold | `#FFD700` | `0 0 12px rgba(255,215,0,0.3)` animated |
| 💎 Diamond | Gradient `#B9F2FF→#A78BFA→#FFB3C1` | `0 0 20px rgba(167,139,250,0.4)` sparkle |

#### Heatmap Colors

| Level | Hex | Criteria |
|-------|-----|----------|
| 0 (none) | `#1A1A2E` | No activity |
| 1 (low) | `#16213E` | <30 min |
| 2 (medium) | `#0F3460` | 30–60 min |
| 3 (high) | `#533483` | 60–120 min |
| 4 (max) | `#7C3AED` | >120 min |

### 2.2 Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle depth |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Modals, dropdowns |
| `--shadow-glow-primary` | `0 0 20px rgba(124,58,237,0.3)` | Active/focused primary elements |
| `--shadow-glow-gold` | `0 0 15px rgba(255,215,0,0.25)` | Gold tier cards |

### 2.3 Border System

| Token | Value | Usage |
|-------|-------|-------|
| `--border-default` | `1px solid #2D2D44` | Card borders, dividers |
| `--border-subtle` | `1px solid #1E1E32` | Light separators |
| `--border-focus` | `2px solid #7C3AED` | Focus ring (accessibility) |
| `--border-radius-sm` | `6px` | Buttons, inputs |
| `--border-radius-md` | `10px` | Cards, panels |
| `--border-radius-lg` | `16px` | Modals, large cards |
| `--border-radius-full` | `9999px` | Avatars, pills, badges |

---

## 3. Typography System

### 3.1 Font Stack

| Role | Font Family | Fallback | Source |
|------|------------|----------|--------|
| **Heading** | `Space Grotesk` | `system-ui, sans-serif` | Google Fonts |
| **Body** | `Inter` | `system-ui, sans-serif` | Google Fonts |
| **Monospace** | `JetBrains Mono` | `Consolas, monospace` | Google Fonts |

### 3.2 Type Scale (1.25 Major Third)

| Token | Size (rem) | px | Weight | Line-Height | Letter-Spacing | Usage |
|-------|-----------|-----|--------|-------------|----------------|-------|
| `--text-display` | 3rem | 48 | 700 | 1.1 | -0.02em | Hero sections only |
| `--text-h1` | 2.25rem | 36 | 700 | 1.2 | -0.015em | Page titles |
| `--text-h2` | 1.75rem | 28 | 600 | 1.25 | -0.01em | Section headers |
| `--text-h3` | 1.375rem | 22 | 600 | 1.3 | -0.005em | Subsection headers |
| `--text-h4` | 1.125rem | 18 | 600 | 1.35 | 0 | Card titles |
| `--text-body` | 1rem | 16 | 400 | 1.6 | 0 | Body text |
| `--text-body-sm` | 0.875rem | 14 | 400 | 1.5 | 0 | Secondary text |
| `--text-caption` | 0.75rem | 12 | 400 | 1.4 | 0.01em | Labels, timestamps |
| `--text-overline` | 0.625rem | 10 | 700 | 1.5 | 0.1em | Category labels (UPPERCASE) |

### 3.3 Font Weight Scale

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-regular` | 400 | Body text |
| `--font-medium` | 500 | Emphasized body, button text |
| `--font-semibold` | 600 | Subheadings, card titles |
| `--font-bold` | 700 | Headings, stats, important numbers |

---

## 4. Spacing & Layout Grid

### 4.1 Spacing Scale (8pt Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Icon-label gaps, tight padding |
| `--space-3` | 12px | Small component internal padding |
| `--space-4` | 16px | Standard padding, card internal |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Card padding, content gaps |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Large section spacing |
| `--space-12` | 48px | Page section separation |
| `--space-16` | 64px | Major layout separation |

### 4.2 Layout Grid

| Breakpoint | Columns | Gutter | Margin | Container Max |
|------------|---------|--------|--------|---------------|
| Mobile (<640px) | 4 | 16px | 16px | 100% |
| Tablet (640–1023px) | 8 | 20px | 24px | 100% |
| Desktop (1024–1279px) | 12 | 24px | 32px | 1024px |
| Large Desktop (≥1280px) | 12 | 24px | auto | 1280px |

### 4.3 Content Width Constraints

| Element | Max Width | Notes |
|---------|-----------|-------|
| Page container | 1280px | Centered |
| Reading content | 720px | Optimal readability |
| Card grid | 1200px | Within page container |
| Modal (small) | 420px | Single action dialogs |
| Modal (medium) | 560px | Forms, detail views |
| Modal (large) | 800px | Complex content, quiz |
| Sidebar | 280px | Desktop navigation |

---

## 5. Iconography & Illustrations

### 5.1 Icon System

| Property | Specification |
|----------|---------------|
| **Library** | Lucide React (primary) |
| **Sizes** | 16px (inline), 20px (default), 24px (action), 32px (feature), 48px (empty state) |
| **Style** | Stroke-based, 1.5px stroke weight, rounded caps/joins |
| **Color** | Inherits from parent, default `--text-secondary` |
| **Touch Target** | Min 44×44px (wrapper) |

### 5.2 Icon Usage Rules (Updated March 2026)

> **CRITICAL RULE: NO EMOJI IN PRODUCTION UI**
> - All icons across the platform MUST use Lucide React icons
> - Emoji/emote characters (🔥📚🎯 etc.) are PROHIBITED in UI components
> - Emoji may only appear in user-generated content (chat, comments, bios)
> - This applies to: stat cards, navigation, badges, buttons, labels, cards, charts

**Subject Icons (Lucide replacements):**

| Subject | Lucide Icon | Color |
|---------|-------------|-------|
| Computer Science | `Monitor` | `#3B82F6` |
| Mathematics | `Calculator` | `#EF4444` |
| Physics | `Atom` | `#06B6D4` |
| Biology | `Dna` | `#22C55E` |
| Chemistry | `FlaskConical` | `#A855F7` |
| Literature | `BookOpen` | `#F59E0B` |
| History | `Landmark` | `#D97706` |
| Economics | `BarChart3` | `#10B981` |
| Languages | `Globe` | `#6366F1` |
| Art & Design | `Palette` | `#EC4899` |
| General | `Library` | `#8B5CF6` |

**Dashboard Stat Icons:**

| Metric | Icon | Color |
|--------|------|-------|
| Active Courses | `BookOpen` | `#7C3AED` |
| Study Hours | `Clock` | `#3B82F6` |
| Streak | `Flame` | `#F59E0B` |
| XP Earned | `Zap` | `#22C55E` |
| Leaderboard | `Trophy` | `#F59E0B` |
| Timer | `Timer` | `#7C3AED` |
| Achievements | `Award` | `#F59E0B` |
| Community | `Globe` | `#06B6D4` |

### 5.3 Illustration Style

- **Empty states:** Minimalistic line art, semi-transparent, violet brand tint
- **Achievement badges:** 2D flat with subtle gradient, circular frame
- **Profile card:** Dark glassmorphism with blur backdrop

---

## 6. Component Library Specifications

### 6.1 Buttons

| Variant | BG | Text | Border | Hover | Active | Disabled |
|---------|-----|------|--------|-------|--------|----------|
| **Primary** | `#7C3AED` | `#FFFFFF` | none | `#6D28D9` + glow | `#5B21B6` | `#374151` + `#6B7280` text |
| **Secondary** | transparent | `#A78BFA` | `1px #A78BFA` | bg `rgba(124,58,237,0.1)` | bg `rgba(124,58,237,0.2)` | `#374151` border + `#6B7280` text |
| **Ghost** | transparent | `#94A3B8` | none | bg `rgba(255,255,255,0.05)` | bg `rgba(255,255,255,0.1)` | `#475569` text |
| **Danger** | `#EF4444` | `#FFFFFF` | none | `#DC2626` | `#B91C1C` | `#374151` + `#6B7280` text |
| **Success** | `#22C55E` | `#FFFFFF` | none | `#16A34A` | `#15803D` | `#374151` + `#6B7280` text |

**Sizes:**

| Size | Height | Padding (H) | Font Size | Border Radius |
|------|--------|------------|-----------|---------------|
| `sm` | 32px | 12px | 13px | 6px |
| `md` | 40px | 16px | 14px | 8px |
| `lg` | 48px | 24px | 16px | 10px |

**States:** All buttons must display: `default`, `hover`, `active/pressed`, `focused` (keyboard focus ring `--border-focus`), `disabled`, `loading` (spinner replaces text).

### 6.2 Input Fields

| State | Border | BG | Label Color |
|-------|--------|-----|-------------|
| Default | `#2D2D44` | `#1A1A2E` | `--text-secondary` |
| Hover | `#3D3D5C` | `#1E1E32` | `--text-secondary` |
| Focus | `#7C3AED` (2px) | `#1E1E32` | `--color-primary` |
| Error | `#EF4444` (2px) | `#1E1E32` | `--color-danger` |
| Disabled | `#1E1E32` | `#151520` | `--text-disabled` |

**Specs:** Height 44px, padding 12px 16px, font 14px, border-radius 8px, label above (12px gap), error text below in `--color-danger` at 12px font.

### 6.3 Cards

**Base Card:**
- Background: `--bg-card`
- Border: `--border-default`
- Border-radius: `--border-radius-md` (10px)
- Padding: 20px
- Hover: `translateY(-2px)` + `--shadow-md`
- Transition: `all 200ms ease`

### 6.4 Modal/Dialog

- Overlay: `--bg-overlay`
- Container: `--bg-elevated`, border-radius 16px, padding 24px
- Close button: top-right, Ghost button, `X` icon
- Animation: fade in overlay 200ms, scale up content from 0.95 → 1 + fade 300ms
- Focus trap: keyboard focus stays within modal
- Escape key: closes modal

### 6.5 Badges/Pills

| Variant | BG | Text | Example |
|---------|-----|------|---------|
| Default | `rgba(148,163,184,0.1)` | `#94A3B8` | Status label |
| Primary | `rgba(124,58,237,0.15)` | `#A78BFA` | Category tag |
| Success | `rgba(34,197,94,0.15)` | `#22C55E` | "Ready", "Online" |
| Warning | `rgba(245,158,11,0.15)` | `#F59E0B` | "Processing" |
| Danger | `rgba(239,68,68,0.15)` | `#EF4444` | "Failed", "Expired" |

**Specs:** Padding 4px 10px, font 12px semibold, border-radius 9999px.

### 6.6 Avatar

| Size | Dimension | Usage |
|------|-----------|-------|
| `xs` | 24px | Inline mentions |
| `sm` | 32px | Lists, compact cards |
| `md` | 40px | Navbar, comments |
| `lg` | 64px | Profile cards |
| `xl` | 96px | Profile page header |
| `2xl` | 128px | Public profile hero |

**Specs:** Circular (border-radius 50%), fallback initials on colored bg, online indicator: 10px green dot at bottom-right with 2px white border.

### 6.7 Toast Notifications

| Type | Icon | Accent Color | Duration |
|------|------|-------------|----------|
| Success | ✓ checkmark | `#22C55E` | 4000ms |
| Error | ✕ cross | `#EF4444` | 6000ms |
| Warning | ⚠ triangle | `#F59E0B` | 5000ms |
| Info | ℹ circle | `#3B82F6` | 4000ms |
| XP | ⚡ lightning | `#A78BFA` | 3000ms |

**Position:** Top-right, 16px from edges, stack vertically with 8px gap. Slide in from right 300ms, auto-dismiss with progress bar.

---

## 7. Page-Level Design Specifications

### 7.1 Navigation (Navbar)

**Desktop (≥1024px):**
- Height: 64px, sticky top, `--bg-secondary` with bottom border `--border-subtle`
- Left: Logo "AETHEREUM" (Space Grotesk, 20px bold, gradient `--color-primary` → `--color-primary-light`)
- Center: Navigation links (Dashboard, Library, Social Hub, Explore)
- Right: Coin balance (🪙 icon + count), Streak (🔥 icon + count), Notification bell (badge count), Avatar dropdown

**Mobile (<1024px):**
- Height: 56px, logo left, hamburger right
- Bottom tab bar: 5 icons (Home, Library, Upload (+), Social, Profile) — height 60px, safe area padding

### 7.2 Dashboard / Home Page

> **UI/UX Analysis (Updated March 2026):**
> - Referensi best practices dari modern dashboard design (Donezo, Linear, Notion, Vercel Dashboard)
> - **F-Pattern reading flow**: Header & stats di atas → charts & schedule di tengah → detail widgets di bawah
> - **Information architecture**: Stat cards memberikan quick-glance metrics, charts memberikan trend insight, action items memberikan next steps
> - **Professional iconography**: Semua icons menggunakan Lucide React — TIDAK ADA emoji/emote untuk menjaga kesan profesional
> - **Calm color palette**: Purple (#7C3AED) sebagai primary, blue (#3B82F6) dan cyan (#06B6D4) sebagai secondary — tenang tapi engaging
> - **Playful touches**: Rounded corners (xl), soft hover-lift animations, gradient accents pada stat cards, smooth transitions
> - **Data completeness**: Dashboard must show ALL essential learning metrics at a single glance

**Layout (top to bottom):**

1. **Header Bar**
   - "Dashboard" heading (text-h2, font-heading, bold)
   - Subtitle: "{greeting}, {name}! Track your progress and keep learning."
   - Action buttons: "Generate Course" (primary bg, Plus icon) + "Upload Material" (outlined, Upload icon)
   - Responsive: stack vertically on mobile

2. **Quick Stats Row** — 4 stat cards in grid (2-col mobile, 4-col desktop):
   | Card | Icon | Color | Value | Trend |
   |------|------|-------|-------|-------|
   | Active Courses | BookOpen | `#7C3AED` (purple) | Course count | +/- % vs last week |
   | Study Hours | Clock | `#3B82F6` (blue) | Total hours this week | +/- % vs last week |
   | Day Streak | Flame | `#F59E0B` (amber) | Current streak count | Streak status |
   | XP Earned | Zap | `#22C55E` (green) | XP this week | +/- % vs last week |

   **Stat Card Design:**
   - `bg-dark-card`, `border border-border/60`, `rounded-xl`, `p-5`
   - Colored icon in tinted background circle (`{color}18` opacity bg)
   - Trend badge: pill shape with ArrowUpRight icon, green for positive, red for negative
   - Colored accent patch in top-right corner (`opacity-[0.06]`, `rounded-bl-[48px]`)
   - Hover: `-translate-y-0.5`, `shadow-lg` transition

3. **Weekly Study Activity (Recharts BarChart)** — 2/3 width on desktop:
   - Dual bars: Hours (purple `#7C3AED`) + Quizzes (cyan `#06B6D4`)
   - Rounded bar tops: `radius={[6, 6, 0, 0]}`
   - CartesianGrid: dashed horizontal lines only (`stroke="#1E1E32"`, `vertical={false}`)
   - Custom tooltip: `bg-dark-elevated`, rounded, shadow-xl
   - Legend: colored squares + labels

4. **Upcoming Schedule** — 1/3 width card:
   - Calendar icon + "Upcoming" title, "View All" link
   - Stacked items with typed icons (quiz: Target/purple, test: FileText/red, session: Users/cyan, review: CheckCircle/green)
   - Urgent items get "DUE" badge in red
   - Each item: icon circle + title + due time, `rounded-lg bg-dark-secondary/50`

5. **Continue Learning** — 3-column grid:
   - Per card: Subject-colored icon circle, title, subject label, progress bar (colored), section count, "Continue" CTA
   - Progress bar uses `c.color` per subject
   - Hover: lift + shadow
   - CTA: outlined button "Continue >" linking to `/learn/{id}`

6. **Course Progress (SVG Donut)** — 1/3 width:
   - Custom SVG donut chart (148px, 20px stroke)
   - Segments: Completed (green #22C55E), In Progress (purple #7C3AED), Not Started (dark track)
   - Center text: completion percentage + "Completed" label
   - Legend: 3 color dots with counts

7. **Leaderboard Widget** — 1/3 width:
   - Top 5 entries with rank icons (Crown for #1, Medal for #2-#3, number for #4-#5)
   - User's own row highlighted: `bg-primary/10 border border-primary/20`
   - XP in monospace font
   - "Full Board" link to /explore

8. **Study Timer** — 1/3 width:
   - Digital display: `font-mono`, `text-4xl`, `tracking-[0.12em]`
   - Glow effect when running: `textShadow: '0 0 24px rgba(124,58,237,0.5)'`
   - Pulse border overlay when active
   - Controls: Play/Pause (circular button, purple/warning toggle) + Reset (RotateCcw)
   - Status text below: "Focus mode active" / "Start a study session"

9. **XP Trend (Recharts AreaChart)** — 1/2 width:
   - 7-week trend line with gradient fill (`url(#xpGradient)`, purple → transparent)
   - CartesianGrid dashed horizontal only
   - Custom tooltip matching dashboard style

10. **Achievements Grid** — 1/2 width:
    - 2×2 grid of achievement badges (earned + locked)
    - Each: Lucide icon in colored circle, title, description
    - Earned: full color, subtle bg tint. Locked: `opacity-50`, gray icon
    - "View All" link to /profile

11. **Community Activity** — Full width:
    - 4-column grid of live community stats
    - Per item: colored icon circle + bold value + label
    - Stats: "Studying Now", "Active Rooms", "Ongoing Raids", "Friends Online"

**Design System Notes:**
- ALL card containers: `bg-dark-card border border-border/60 rounded-xl p-5`
- Section headers: Lucide icon (18px, text-primary-light) + text (sm, font-semibold)
- Link actions: `text-[11px] text-primary-light` with ArrowRight icon
- No emoji anywhere — professional Lucide icons only
- Spacing: `space-y-6` between major sections, `gap-4` within grids

### 7.3 Knowledge Profile Page

**Layout:**

1. **Profile Header**
   - Avatar (96px) + Name + Username + Bio
   - Level badge (progress ring) + Rank name + Rank color
   - Streak flame + count + "Best: X days"
   - Stats row: Total Cards | Hours | Materials | Avg Mastery
   - Action buttons: Edit Profile, Share Profile, Settings

2. **Tab Navigation:** Overview | Cards | Achievements | Analytics

3. **Overview Tab:**
   - Learning Heatmap (52 weeks × 7 days grid, CSS grid)
   - Pinned Knowledge Cards (6-card grid, 3×2 desktop / 2×3 mobile)
   - Featured Achievements (top 3 badges)
   - Recent XP Events (mini timeline)

4. **Cards Tab:**
   - Filter bar: All | Bronze | Silver | Gold | Diamond + Subject dropdown + Sort
   - Card grid: 3-column desktop, 2-column tablet, 1-column mobile
   - Infinite scroll pagination

5. **Achievements Tab:**
   - Category tabs: All | Learning | Social | Streak | Special
   - Badge grid with locked/unlocked states
   - Progress indicators for near-completion badges

6. **Analytics Tab:**
   - Date range selector (1W | 1M | 3M | All)
   - XP Progress Chart (Recharts LineChart)
   - Subject Breakdown (Recharts PieChart)
   - Focus Integrity Trend (Recharts AreaChart)
   - Best Study Hours (hour × day heatmap)
   - Quiz Performance by Subject (Recharts BarChart)

### 7.4 Public Profile Page (`/profile/{username}`)

- Same layout as Profile Page but read-only
- No edit buttons, no analytics tab
- "Add Friend" and "Challenge to Duel" CTA buttons
- OG meta tags for social share preview (1200×630 card)
- 403 page if profile is private

### 7.5 Content Library Page

- Upload CTA prominent (top-right or floating action button on mobile)
- View toggle: Grid (cards) | List (compact rows)
- Filter: Subject, Type (PDF/Video/URL), Status (Processing/Ready/Failed)
- Sort: Recent, A-Z, Most Studied
- Each content card: Type icon, title, subject badge, sections count, status pill, progress bar, last studied date

### 7.6 Document Dungeon (Learning Session)

**Layout (full-screen immersive):**

1. **Top Bar:** Exit button (left), Session title, Focus timer (center), Focus hearts ❤️❤️❤️ (right)
2. **Quest Map** (sidebar or top section): Section nodes (locked/current/done), linear path
3. **Reading Area:** Clean markdown render, max-width 720px, comfortable line-height (1.8)
4. **Action Bar (bottom):** "I'm Done Reading" button (appears after min read time), progress X/Y sections

**Quiz/Guardian Battle sub-view:**
- Question card (center), 4 options (2×2 grid), timer bar at top, question counter (1/5)
- Correct: green flash + ✓, Wrong: red flash + ✕ + explanation
- Results: pass/fail animation, score breakdown, retry (if fail, 5min cooldown)

**Summary sub-view:**
- Textarea (min 100 chars), live char count
- "Check with AI" button → inline AI feedback card
- "Submit & Complete" (enabled after AI approval)

**Session Complete / Reward Screen:**
- Full-screen celebration overlay
- Card flip reveal animation (build suspense: Bronze? Silver? Gold? → actual tier)
- XP breakdown with animated counter
- Coins earned
- New achievements (if any)
- Streak update
- CTA buttons: Share | Continue | View Profile

### 7.7 Social Hub Page

**Tab layout:** Study Raids | Focus Duels | Quiz Arena | Study Rooms | Relay | Community

### 7.8 Explore Page

**Layout:**
1. Search bar (prominent, top)
2. Trending Learners carousel (horizontal scroll, UserMiniCards)
3. Rising Stars section
4. Hall of Sages showcase
5. Top by Subject (tab per subject)
6. Community Feed (reverse chrono, infinite scroll)

---

## 8. Gamification Visual System

### 8.1 Knowledge Card Component

**Dimensions:** 280px × 200px (desktop), fluid on mobile  
**Structure:**
```
┌─────────────────────────────┐
│ [Icon] Title          [Tier]│  ← Header (subject icon, title, tier badge)
│        Category             │
├─────────────────────────────┤
│ Mastery ██████████░░ 85%    │  ← Mastery bar (color = tier)
├─────────────────────────────┤
│ 🎯 92% quiz  ⚡ 88% focus  │  ← Stats row
│ ⏱️ 45m                     │
├─────────────────────────────┤
│ 📌 Pinned          ❤️ 12   │  ← Footer (pin indicator, likes)
└─────────────────────────────┘
```

**Tier Visual Differentiation:**

| Tier | Border | BG Tint | Shadow/Glow | Special Effect |
|------|--------|---------|-------------|----------------|
| Bronze | `2px solid #CD7F32` | none | none | — |
| Silver | `2px solid #C0C0C0` | `rgba(192,192,192,0.03)` | subtle silver glow | — |
| Gold | `2px solid #FFD700` | `rgba(255,215,0,0.03)` | animated shimmer (`@keyframes`) | Gentle pulse glow |
| Diamond | `2px gradient border` | `rgba(167,139,250,0.05)` | animated sparkle particles | CSS particle dots |

### 8.2 Learning Heatmap

- **Grid:** 52 columns × 7 rows, cell size 13×13px desktop / 10×10px mobile, gap 3px
- **Tooltip on hover:** "Feb 20 — 3 sessions, 2h 15m"
- **View toggle:** 3M | 6M | 1Y
- **Legend bar:** 5 color swatches + "Less → More" label

### 8.3 Level & XP Display

**Level Badge (Profile Header):**
- Circular progress ring (SVG), 80px diameter
- Level number centered (bold, 24px)
- Ring color = current rank color
- Glow effect on ring matching rank

**XP Bar (below level badge):**
- Full width, height 8px, rounded
- Gray track, filled portion = rank color
- Text: "{current_xp} / {next_level_xp} XP" below

### 8.4 Streak Display

- 🔥 flame icon (animated flicker CSS if active)
- Count number (bold, 20px)
- Status label: "Active", "At Risk ⚠️" (if today not yet studied), "Broken 💔"
- Weekly goal: mini progress dots (●●●●○○○ = 4/7 belajar)

### 8.5 Achievement Badges

**Visual States:**

| State | Appearance |
|-------|-----------|
| Locked | Grayscale, 40% opacity, blur (2px), lock icon overlay |
| Unlocked | Full color, subtle glow, unlocked date shown |
| Featured | Gold border ring, "★ Featured" label |
| Near-Complete | Grayscale body + colored progress ring around (showing %) |

**Size:** 64×64px in grid, 80×80px when featured.

---

## 9. Social Learning Mode UI

### 9.1 Study Raid

**Lobby:**
- Room code (large monospace, copyable), "Share Link" button
- Participant list: Avatar + name + "Ready ✓" / "Waiting..."
- "Start Raid" button (creator only, min 2 players, disabled otherwise)

**In Progress:**
- Top: Team progress bar (blue gradient, % combined)
- Left sidebar: Participant cards (name + individual % + status emoji)
- Center: Learning content (same as Document Dungeon reading view)
- Right sidebar: Chat (text messages, auto-scroll, 200 char limit)
- Timer (if duration set)

**Complete:**
- Team score display (large, centered)
- Individual breakdown table
- XP + coins earned per person
- Achievement badge if team >90%
- "Share Result" button

### 9.2 Focus Duel

**In Progress (split screen feel):**

```
┌──────────────────┬──────────────────┐
│     YOUR SIDE    │  OPPONENT SIDE   │
│                  │                  │
│  Focus: 92% ✅   │  Focus: 78% ⚠️   │
│  Hearts: ❤️❤️❤️  │  Distractions: 3 │
│                  │                  │
│  Timer: 18:42    │  Status:         │
│                  │  "Distracted 💀" │
└──────────────────┴──────────────────┘
```

- Opponent status updates real-time via WebSocket
- Green aura when opponent focused, red flash when distracted
- Timer prominent center

**Results:**
- "Good Game!" mutual prompt
- Winner tastefully highlighted (not rubbing it in)
- Both scores shown, XP + coins for both

### 9.3 Quiz Arena

- Full-screen question display with 30s countdown bar (color gradient: green → yellow → red)
- 4 answer buttons (A/B/C/D), large touch targets
- Speed feedback: "Fast! ⚡" if <5s, "Nice!" if <15s
- Live scoreboard sidebar (compact: name + score, sorted)
- Podium screen at end: 🥇🥈🥉 with animated entrance

### 9.4 Study Room

- Ambient dark UI, calming aesthetic
- Participant list: Avatar + name + "Studying: {material}" + timer
- Pomodoro: shared timer display (25:00 study / 5:00 break), phase indicator
- Emoji reactions float across screen briefly (🔥❤️👍👊)
- Music control: play/pause, volume, preset selector (lo-fi / classical / nature / silence)
- Minimal interaction — designed for calm productivity

---

## 10. Animation & Motion System

### 10.1 Timing & Easing Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--motion-fast` | 150ms | `ease-out` | Micro-interactions (hover, press) |
| `--motion-normal` | 250ms | `ease-in-out` | Transitions (tab switch, expand) |
| `--motion-slow` | 400ms | `ease-in-out` | Complex reveals (modal, page transition) |
| `--motion-celebration` | 800ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Level up, achievement, card reveal |

### 10.2 Standard Micro-Animations

| Element | Trigger | Animation |
|---------|---------|-----------|
| Button | Hover | `scale(1.02)` + `shadow-glow` |
| Button | Press | `scale(0.98)` |
| Card | Hover | `translateY(-2px)` + `shadow-md` |
| Knowledge Card (Gold) | Idle | `shimmer-glow` keyframe loop (3s) |
| Knowledge Card (Diamond) | Idle | Sparkle particle CSS animation |
| Toast | Enter | `slideInRight` + `fadeIn` (300ms) |
| Toast | Exit | `slideOutRight` + `fadeOut` (200ms) |
| Modal | Enter | Overlay `fadeIn` (200ms) + Content `scaleIn(0.95→1)` + `fadeIn` (300ms) |
| Modal | Exit | Reverse (200ms) |
| Tab content | Switch | `fadeIn` (200ms) |
| XP Notification | Enter | Float up from bottom + `fadeIn` + counter animate |
| Level Up | Trigger | Confetti burst (Framer Motion) + scale pulse + rank update |
| Achievement Unlock | Trigger | Slide in from right + badge shake + glow pulse |
| Quiz correct | Trigger | Green flash + checkmark draw animation |
| Quiz wrong | Trigger | Red shake + X draw animation |
| Heatmap cell | Hover | `scale(1.5)` + tooltip appear |
| Streak flame | Active | Subtle flicker CSS animation (infinite) |
| Focus heart loss | Trigger | Heart shrink + fade + screen edge red flash |

### 10.3 Reduced Motion

- Respect `prefers-reduced-motion: reduce` media query
- Disable all non-essential animations
- Keep only opacity transitions and instant state changes
- Remove parallax, particle effects, confetti

---

## 11. Responsive Design Strategy

### 11.1 Breakpoint System

| Name | Min Width | Target Devices |
|------|-----------|----------------|
| `xs` | 0px | Small phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### 11.2 Layout Adaptations

| Component | Mobile (<768px) | Tablet (768–1023px) | Desktop (≥1024px) |
|-----------|-----------------|--------------------|--------------------|
| Navigation | Bottom tab bar | Bottom tab bar | Top navbar + sidebar |
| Knowledge Card Grid | 1 column | 2 columns | 3 columns |
| Heatmap | 3 month view, horizontal scroll | 6 month view | Full year (52 weeks) |
| Profile Header | Stacked vertical | Stacked vertical | Horizontal layout |
| Dashboard Stats | 2×2 grid | 4×1 row | 4×1 row |
| Social Hub | Tab navigation | Tab navigation | Sidebar + main content |
| Reading View | Full width | Max 640px centered | Max 720px centered |
| Quiz Options | 1 column stack | 2×2 grid | 2×2 grid |
| Duel View | Stacked (you top, opponent bottom) | Side by side | Side by side |
| Raid Chat | Collapsible drawer (bottom) | Side panel | Side panel |
| Modal | Full screen sheet (bottom) | Centered overlay | Centered overlay |

### 11.3 Touch Targets

- Minimum 44×44px for all interactive elements
- Spacing between touch targets: minimum 8px
- Buttons: full-width on mobile when contextually appropriate
- Swipe gestures: horizontal card browsing, dismiss notifications

---

## 12. Accessibility Requirements

### 12.1 WCAG 2.1 AA Compliance

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color contrast (text) | ≥4.5:1 (normal), ≥3:1 (large) | All text passes against dark bg |
| Color contrast (UI) | ≥3:1 | Interactive elements, borders |
| Focus visible | Required | 2px `#7C3AED` focus ring on all interactive elements |
| Keyboard navigation | Full | Tab order logical, skip links, focus trap in modals |
| Screen reader | Labels + ARIA | All images have alt text, forms labeled, live regions for dynamic content |
| Reduced motion | Supported | `prefers-reduced-motion` respected |
| Text resize | Up to 200% | No content loss at 200% zoom |
| Color independence | Required | Never use color alone to convey info (add icons, patterns, or text) |

### 12.2 Specific Accessible Patterns

- Heatmap cells: aria-label with full data ("February 20, 2026: 3 sessions, 2 hours 15 minutes")
- Knowledge Cards: aria-label summary, tier announced
- Quiz: question read by screen reader, options as radio group
- Focus timer: aria-live region for time updates
- Chat messages: aria-live polite
- Leaderboard: proper table markup with headers
- Charts (Recharts): include accessible data table alternative

---

## 13. Interaction Design Patterns

### 13.1 Upload Flow

```
[CTA: Upload Material] → Modal opens
  ├── Drag & Drop zone (highlighted border on dragover)
  ├── OR: Click to browse files
  ├── OR: URL input (auto-detect YouTube/Article)
  └── Optional: Title input
→ Submit → Upload progress bar → "Processing..." status card in library
→ Poll every 3s → Ready notification → Can start learning
```

### 13.2 Learning Session Flow

```
[Select Content] → [Start Session]
  → Quest Map (section overview)
  → [Enter Section X]
    → Reading Mode (focus timer starts, tab tracking active)
    → [I'm Done Reading] (after min time)
    → Quiz (5 questions, 2min each)
      → Pass (≥70%) → Summary Writing → AI Validation → Submit
      → Fail (<70%) → Show feedback → Retry (5min cooldown)
  → All sections complete → Session Complete → Card Reveal → Rewards
```

### 13.3 Social Invitation Flow

```
[Create Raid/Duel/Arena]
  → Configure (content, duration, max players)
  → Generate invite code/link
  → Share via: Copy link | WhatsApp | Direct to friend
→ Recipient: Notification/link → Join lobby → Wait for start → Begin
```

### 13.4 Pin Card Flow

- Long press (mobile) or right-click context menu (desktop) on Knowledge Card
- "📌 Pin to Profile" option
- If already 6 pinned: "Unpin another card first" message
- Pinned indicator appears on card

---

## 14. Empty States, Loading & Error Patterns

### 14.1 Empty States

| Context | Illustration | Message | CTA |
|---------|-------------|---------|-----|
| No content in library | Book illustration | "Your knowledge journey starts here! Upload your first material." | "Upload Material" |
| No knowledge cards | Card illustration | "Complete a learning session to earn your first Knowledge Card!" | "Start Learning" |
| No achievements | Trophy illustration | "Achievements are waiting for you. Start learning to unlock them!" | "Explore Library" |
| No friends | People illustration | "Add friends to learn together and challenge each other!" | "Find Friends" |
| Empty feed | Newspaper illustration | "No activity yet. Start learning to appear in the community feed!" | "Start Session" |
| No active raids | Swords illustration | "No active Study Raids. Create one and invite friends!" | "Create Raid" |
| Search no results | Magnifier illustration | "No results for '{query}'. Try a different search." | — |

### 14.2 Loading States

| Type | Implementation |
|------|----------------|
| **Page load** | Skeleton screens (pulsing gray blocks matching layout) |
| **Card grid** | 3–6 skeleton cards (pulse animation) |
| **Button action** | Spinner replaces button text, button disabled |
| **Content processing** | Custom animation: "AI is analyzing your content..." with stepped progress |
| **Chart loading** | Skeleton placeholder with chart outline |
| **Infinite scroll** | 3 skeleton items at bottom |

**Skeleton colors:** BG `#1A1A2E`, pulse between `#1A1A2E` and `#252540`.

### 14.3 Error States

| Type | Presentation |
|------|-------------|
| **Inline field error** | Red border + red text below field |
| **Form error** | Red banner above submit: "Please fix the errors below" |
| **API error** | Toast notification (error type) |
| **Network error** | Full-width banner top: "Connection lost. Retrying..." with retry button |
| **404 page** | Centered illustration + "Page not found" + Home CTA |
| **500 page** | Centered illustration + "Something went wrong" + Retry + Home CTA |
| **Upload fail** | Content card status = "Failed" pill + retry button |
| **AI processing fail** | "Analysis failed" + retry option |

---

## 15. Onboarding & First-Time User Experience

### 15.1 Registration Flow

```
1. Landing page → "Get Started" CTA
2. Register: Name, Email, Password OR Google OAuth (1-click)
3. Auto-generate username (editable)
4. Welcome screen: "Welcome to AETHEREUM, {name}!"
5. Quick tutorial (3 steps):
   Step 1: "Upload any learning material" (with animation)
   Step 2: "Learn with focus sessions & quizzes" (with animation)
   Step 3: "Build your Knowledge Profile!" (with animation)
6. "Upload Your First Material" CTA → Upload modal
7. Skip option always available
```

### 15.2 First Session Guided Experience

- Tooltips (coach marks) on first session pointing to:
  - Quest Map: "These are your sections to conquer!"
  - Focus Timer: "Stay focused — tab switching costs heart lives!"
  - Reading Area: "Read carefully, a quiz is coming!"
  - Quiz: "Score 70% or higher to pass"
  - Summary: "Write what you learned in your own words"
- First card reveal: extra celebration ("Your first Knowledge Card! 🎉")

### 15.3 Progressive Feature Unlocking

| Level | Feature Unlocked | Notification |
|-------|-----------------|-------------|
| 1 | Basic profile, content upload | — |
| 3 | Friends system, Focus Duel | "You can now challenge friends!" |
| 5 | Study Raids | "Study Raids unlocked! Learn together!" |
| 10 | Explore page visibility | "You're now visible on Explore!" |
| 15 | Profile customization shop | "Customize your profile with coins!" |

---

## 16. Notification & Feedback System

### 16.1 In-App Notification Types

| Type | Trigger | Visual | Sound |
|------|---------|--------|-------|
| XP Gained | Any XP event | Floating "+X XP" animation | Subtle chime |
| Level Up | Level threshold reached | Full-screen celebration | Fanfare |
| Achievement | Badge condition met | Slide-in banner from right | Unlock sound |
| Streak Reminder | 8PM if haven't studied today | Top banner: "Keep your streak alive! 🔥" | — |
| Duel Challenge | Friend sends challenge | Modal/notification: "X challenged you!" | Alert |
| Raid Invite | Invited to raid | Toast: "X invited you to a Study Raid!" | Alert |
| Friend Request | Someone adds you | Badge on nav + notification panel | — |
| Content Ready | AI processing done | Toast: "Your material is ready!" | — |
| Weekly Challenge Complete | Community goal reached | Banner celebration | Fanfare |

### 16.2 Notification Panel

- Bell icon in navbar with unread count badge (red dot with number)
- Dropdown panel: list of notifications, grouped by today/earlier
- Each notification: icon + message + timestamp + read/unread indicator
- "Mark all as read" action
- Click notification → navigate to relevant page

---

## 17. Performance Budgets

### 17.1 Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | <1.2s | Lighthouse |
| Largest Contentful Paint (LCP) | <2.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse |
| First Input Delay (FID) | <100ms | Lighthouse |
| Time to Interactive (TTI) | <3.0s | Lighthouse |
| Lighthouse Performance Score | >90 | Lighthouse |
| Bundle size (JS) | <300KB gzip | Webpack analyzer |
| Bundle size (CSS) | <50KB gzip | Build output |
| API response time | <200ms (p95) | Server monitoring |
| WebSocket latency | <100ms | Network measurement |
| Profile page render | <500ms | React Profiler |
| Heatmap render | <100ms | Performance API |

### 17.2 Optimization Strategies

- **Code splitting** per route (React.lazy + Suspense)
- **Image optimization:** WebP format, lazy loading, placeholder blur
- **Font optimization:** `font-display: swap`, subset only used characters
- **Caching:** Service worker for static assets, Redis for API
- **Virtualized lists** for long card grids and feeds
- **Debounced search** input (300ms)
- **Optimistic UI updates** for likes, pins, reactions

---

## Appendix A: File Naming & CSS Convention

### CSS Custom Properties File Structure

```
src/
├── styles/
│   ├── tokens/
│   │   ├── colors.css        ← All color tokens
│   │   ├── typography.css    ← Font families, sizes, weights
│   │   ├── spacing.css       ← Spacing scale
│   │   ├── shadows.css       ← Shadow & glow tokens
│   │   ├── borders.css       ← Border radius, widths
│   │   └── motion.css        ← Animation timing tokens
│   ├── base/
│   │   ├── reset.css         ← CSS reset
│   │   └── globals.css       ← Global styles, body defaults
│   └── index.css             ← Import all tokens + base
```

### Component File Convention

```
src/components/
├── ui/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css  (or Tailwind classes)
│   │   └── Button.test.jsx
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   ├── Badge/
│   ├── Avatar/
│   └── Toast/
├── profile/
│   ├── KnowledgeCard/
│   ├── LearningHeatmap/
│   ├── LevelBadge/
│   ├── StreakDisplay/
│   ├── AchievementBadge/
│   └── ProfileCardGenerator/
├── learning/
│   ├── QuestMap/
│   ├── ReadingView/
│   ├── QuizBattle/
│   ├── SummaryCreation/
│   └── SessionComplete/
├── social/
│   ├── RaidLobby/
│   ├── DuelView/
│   ├── ArenaRoom/
│   ├── StudyRoom/
│   └── CommunityFeed/
└── layout/
    ├── Navbar/
    ├── Sidebar/
    ├── BottomTabBar/
    └── PageLayout/
```

---

## Appendix B: Shareable Profile Card Specification

**Dimensions:** 1200 × 630px (Open Graph standard)  
**Format:** PNG (via html2canvas)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ BG: Dark gradient (#0F0F1A → #1A1A2E diagonal)                │
│                                                                 │
│  [Avatar]  Name                    [AETHEREUM Logo]            │
│  96px      @username                                           │
│            🏛️ Sage · Level 42                                   │
│            🔥 14 day streak                                    │
│                                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐     Stats:                      │
│  │Card 1│  │Card 2│  │Card 3│     📚 18 Cards                  │
│  │ Gold │  │Diamond│  │Silver│     ⏱️ 87 Hours                 │
│  └──────┘  └──────┘  └──────┘     🎯 89% Avg Mastery          │
│                                                                 │
│  [Mini Heatmap - last 12 weeks]     aethereum.app/u/username   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**END OF DRD v1.0**

---

## Appendix C: UI/UX Enhancement Analysis (March 25, 2026)

### C.1 Dashboard UI/UX Audit & Redesign

**Problems identified in v1.0 Dashboard:**

| Issue | Severity | Root Cause |
|-------|----------|------------|
| Emoji icons (🔥📚🎯) look unprofessional | High | No icon standards enforced |
| Missing critical data: study hours, XP trend, leaderboard position | High | Incomplete information architecture |
| No data visualization (charts/graphs) | High | Only raw numbers, no trend context |
| Flat stat cards without visual hierarchy | Medium | No color coding, no trend indicators |
| No study timer widget | Medium | Missing utility feature for active sessions |
| No community activity overview | Medium | Social proof principle violated |
| No course progress visualization | Medium | Users can't assess overall completion |
| HeroBanner takes too much vertical space | Low | Wastes prime above-the-fold real estate |

**Best practices applied from industry analysis:**

1. **Donezo Dashboard Pattern** — Stat cards at top with trend indicators + colored accents, mixed card sizes, utility widgets (timer)
2. **Linear App** — Clean data-heavy layout, professional iconography, subtle card borders, monospace for numbers
3. **Vercel Dashboard** — Minimal but information-dense, area charts for trends, dark theme done right
4. **Notion** — Calm aesthetics, generous whitespace, grouped sections with clear headers
5. **GitHub Profile** — Data-as-art (contribution heatmap), social proof (follower/star counts), achievement showcasing

### C.2 Color Identity Analysis

**Nexera Color Identity: Calm Blue-Purple**

```
Primary Purple:  #7C3AED → Used for: CTAs, active states, progress, primary stat cards
Primary Light:   #A78BFA → Used for: Hover states, section headers, links
Secondary Cyan:  #06B6D4 → Used for: Secondary metrics, quiz data, community
Info Blue:       #3B82F6 → Used for: Study hours, subject CS, information
Success Green:   #22C55E → Used for: Completed items, positive trends, active streak
Accent Amber:    #F59E0B → Used for: XP, streak fire, leaderboard gold, achievements
Danger Red:      #EF4444 → Used for: Urgent items, negative trends, at-risk streak
```

**Reasoning:** Purple and blue evoke trust, wisdom, and calm authority — aligned with a knowledge/learning platform. Amber/gold for gamification elements creates excitement without clashing.

### C.3 Card Component Design Standards

All dashboard cards follow a unified design language:

```
Container:  bg-dark-card border border-border/60 rounded-xl p-5
Header:     Lucide icon (18px, text-primary-light) + text (sm, font-semibold, text-text-primary)
Links:      text-[11px] text-primary-light + ArrowRight icon (12px)
Hover:      -translate-y-0.5 shadow-lg transition-all duration-200
Sub-cards:  bg-dark-secondary/30 border-border/20 rounded-lg p-3
```

### C.4 Data Visualization Standards

| Chart Type | Library | Use Case | Style |
|------------|---------|----------|-------|
| Bar Chart | Recharts BarChart | Weekly activity (hours + quizzes) | Rounded top radius, dual color bars |
| Area Chart | Recharts AreaChart | XP trend over weeks | Gradient fill (purple → transparent) |
| Donut Chart | Custom SVG | Course completion breakdown | 3 segments (completed/progress/empty) |
| Progress Bar | CSS | Individual course progress | Subject-colored fill, rounded-full |

**Chart styling rules:**
- CartesianGrid: `strokeDasharray="3 3"`, `stroke="#1E1E32"`, `vertical={false}`
- Axis: `axisLine={false}`, `tickLine={false}`, `tick={{ fill: '#64748B', fontSize: 11 }}`
- Tooltip: `bg-dark-elevated`, border, rounded-lg, shadow-xl
- Colors: Always from the Nexera palette — purple, cyan, blue, green, amber

### C.5 Platform-Wide Iconography Rules

**Mandatory: Lucide React icons for all UI elements**

| Context | Icon Source | Acceptable Fallback |
|---------|-----------|-------------------|
| Navigation | Lucide React | None |
| Stat cards | Lucide React | None |
| Buttons | Lucide React | None |
| Badges/labels | Lucide React | None |
| Empty states | Lucide React (48px) | Custom SVG illustration |
| User-generated content | N/A | Emoji allowed in text only |
| Sidebar nav | Lucide React | None |
| Form inputs | Lucide React | None |

---

**END OF DRD v2.0**

**Document Status:** COMPLETE  
**Total Sections:** 17 + 2 Appendices  
**Based On:** PRD v2.0, Development Checklist v2.0, Industry Best Practices  
**Purpose:** Comprehensive design specification to guide frontend implementation  
**Next Steps:** Begin implementation per Development Checklist phases
