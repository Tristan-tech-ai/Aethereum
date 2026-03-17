export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // ══════════════════════════════════════
            // COLORS — DRD Section 2.1
            // ══════════════════════════════════════
            colors: {
                // Brand Colors
                primary: {
                    light: '#A78BFA',   // Hover states, secondary accents
                    DEFAULT: '#7C3AED', // CTA buttons, active states, links
                    dark: '#6D28D9',    // Pressed states, borders
                },
                secondary: {
                    DEFAULT: '#06B6D4', // Secondary actions, info badges
                },
                accent: {
                    DEFAULT: '#F59E0B', // XP indicators, gold tier, warnings
                },

                // Background Hierarchy (Elevation System)
                dark: {
                    base: '#0A0A14',      // E0 — Page background (deepest)
                    primary: '#0F0F1A',   // E1 — Main content area
                    secondary: '#1A1A2E', // E2 — Sections, sidebar
                    card: '#1E1E32',      // E3 — Cards, panels
                    elevated: '#252540',  // E4 — Modals, dropdowns, popovers
                },

                // Semantic Colors
                success: {
                    DEFAULT: '#22C55E',
                    dark: '#16A34A',    // Hover
                    darker: '#15803D',  // Active/pressed
                },
                danger: {
                    DEFAULT: '#EF4444',
                    dark: '#DC2626',    // Hover
                    darker: '#B91C1C',  // Active/pressed
                },
                warning: {
                    DEFAULT: '#F59E0B',
                },
                info: {
                    DEFAULT: '#3B82F6',
                },

                // Text Colors
                text: {
                    primary: '#F1F5F9',   // Headings, primary content
                    secondary: '#94A3B8', // Body text, descriptions
                    muted: '#64748B',     // Captions, timestamps, placeholders
                    disabled: '#475569',  // Disabled text
                    inverse: '#0F172A',   // Text on light backgrounds
                },

                // Rank Colors
                rank: {
                    seedling: '#22C55E',    // 🌱 Green
                    learner: '#3B82F6',     // 📗 Blue
                    scholar: '#8B5CF6',     // 📘 Violet
                    researcher: '#06B6D4',  // 🔬 Cyan
                    expert: '#F59E0B',      // 🎓 Amber
                    sage: '#EF4444',        // 🏛️ Crimson
                },

                // Card Tier Colors
                tier: {
                    bronze: '#CD7F32',
                    silver: '#C0C0C0',
                    gold: '#FFD700',
                    diamond: '#B9F2FF', // Primary gradient start
                },

                // Heatmap Colors
                heatmap: {
                    0: '#1A1A2E', // No activity
                    1: '#16213E', // <30 min
                    2: '#0F3460', // 30–60 min
                    3: '#533483', // 60–120 min
                    4: '#7C3AED', // >120 min
                },

                // Border Colors
                border: {
                    DEFAULT: '#2D2D44',   // Card borders, dividers
                    subtle: '#1E1E32',    // Light separators
                    focus: '#7C3AED',     // Focus ring (accessibility)
                    hover: '#3D3D5C',     // Hover state borders
                },

                // Subject Colors
                subject: {
                    cs: '#3B82F6',        // 💻 Computer Science
                    math: '#EF4444',      // 📐 Mathematics
                    physics: '#06B6D4',   // ⚛️ Physics
                    biology: '#22C55E',   // 🧬 Biology
                    chemistry: '#A855F7', // 🧪 Chemistry
                    literature: '#F59E0B',// 📖 Literature
                    history: '#D97706',   // 🏛️ History
                    economics: '#10B981', // 📊 Economics
                    languages: '#6366F1', // 🌏 Languages
                    art: '#EC4899',       // 🎨 Art & Design
                    general: '#8B5CF6',   // 📚 General
                },

                // Button disabled state
                disabled: {
                    bg: '#374151',
                    text: '#6B7280',
                },
            },

            // ══════════════════════════════════════
            // FONT FAMILY — DRD Section 3.1
            // ══════════════════════════════════════
            fontFamily: {
                heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                body: ['"Inter"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
            },

            // ══════════════════════════════════════
            // FONT SIZE — DRD Section 3.2
            // ══════════════════════════════════════
            fontSize: {
                'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
                'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
                'h2': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
                'h3': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
                'h4': ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
                'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '400' }],
                'overline': ['0.625rem', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '700' }],
            },

            // ══════════════════════════════════════
            // SPACING — DRD Section 4.1 (8pt Grid)
            // ══════════════════════════════════════
            spacing: {
                '4.5': '18px',  // between standard values
            },

            // ══════════════════════════════════════
            // BORDER RADIUS — DRD Section 2.3
            // ══════════════════════════════════════
            borderRadius: {
                'sm-drd': '6px',    // Buttons, inputs
                'md-drd': '10px',   // Cards, panels
                'lg-drd': '16px',   // Modals, large cards
                'full': '9999px',   // Avatars, pills, badges
            },

            // ══════════════════════════════════════
            // BOX SHADOW — DRD Section 2.2
            // ══════════════════════════════════════
            boxShadow: {
                'sm-drd': '0 1px 2px rgba(0,0,0,0.3)',
                'md-drd': '0 4px 6px rgba(0,0,0,0.4)',
                'lg-drd': '0 10px 15px rgba(0,0,0,0.5)',
                'glow-primary': '0 0 20px rgba(124,58,237,0.3)',
                'glow-gold': '0 0 15px rgba(255,215,0,0.25)',
                'glow-silver': '0 0 8px rgba(192,192,192,0.2)',
                'glow-diamond': '0 0 20px rgba(167,139,250,0.4)',
            },

            // ══════════════════════════════════════
            // MAX WIDTH — DRD Section 4.3
            // ══════════════════════════════════════
            maxWidth: {
                'page': '1280px',
                'reading': '720px',
                'card-grid': '1200px',
                'modal-sm': '420px',
                'modal-md': '560px',
                'modal-lg': '800px',
                'sidebar': '280px',
            },

            // ══════════════════════════════════════
            // SCREENS (Breakpoints) — DRD Section 11.1
            // ══════════════════════════════════════
            screens: {
                'xs': '0px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },

            // ══════════════════════════════════════
            // ANIMATION — DRD Section 10.1
            // ══════════════════════════════════════
            transitionDuration: {
                'fast': '150ms',
                'normal': '250ms',
                'slow': '400ms',
                'celebration': '800ms',
            },
            keyframes: {
                'shimmer-glow': {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(255,215,0,0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(255,215,0,0.4)' },
                },
                'flicker': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                'sparkle': {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(0.8)' },
                    '50%': { opacity: '1', transform: 'scale(1.2)' },
                },
            },
            animation: {
                'shimmer-glow': 'shimmer-glow 3s ease-in-out infinite',
                'flicker': 'flicker 1.5s ease-in-out infinite',
                'sparkle': 'sparkle 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
