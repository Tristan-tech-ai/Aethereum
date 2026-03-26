import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from '../components/ui/ScrollStack';
import {
  Upload, Brain, Crown, ArrowRight, ChevronDown, ChevronUp,
  Target, Trophy, Menu, X, Flame, Star, Shield,
  FileText, Youtube, Globe, Sparkles, Lock, CheckCircle,
  TrendingUp, MessageSquare, Swords, Radio, GitBranch, Coffee,
  Cpu, Github, Twitter, BookOpen
} from 'lucide-react';
import Button from '../components/ui/Button';
import Orb from '../components/ui/Orb';
import ParticleNeural from '../components/ui/ParticleNeural';

// ── Logo brand colors (from nexera_logo.svg linear gradients)
const LOGO_BLUE   = '#2CFFF8';  // cyan-blue from secondary gradient
const LOGO_PURPLE = '#7C3AED';  // purple from primary gradient

// ── Section label component for consistent styling
const SectionLabel = ({ color = 'purple', children }) => {
  const colorMap = {
    purple: { border: 'rgba(124,58,237,0.3)', bg: 'rgba(124,58,237,0.1)', text: '#A78BFA' },
    blue:   { border: 'rgba(44,255,248,0.3)', bg: 'rgba(44,255,248,0.07)', text: '#2CFFF8' },
    amber:  { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.08)', text: '#F59E0B' },
    cyan:   { border: 'rgba(6,182,212,0.3)',  bg: 'rgba(6,182,212,0.08)',  text: '#06B6D4' },
  };
  const c = colorMap[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
      style={{ border: `1px solid ${c.border}`, background: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
};

// ── Bento card wrapper
const BentoCard = ({ children, className = '', glow = false, style = {} }) => (
  <div
    className={`relative rounded-2xl overflow-hidden border transition-all duration-300 group ${className}`}
    style={{
      background: 'rgba(30,20,60,0.5)',
      borderColor: glow ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      boxShadow: glow ? '0 0 30px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Steps data
const steps = [
  {
    icon: Upload,
    title: 'Upload Any Material',
    desc: 'PDF, YouTube URLs, web articles, images, and slides — bring your own content.',
    num: '01',
    accent: LOGO_BLUE,
  },
  {
    icon: Brain,
    title: 'AI Structures It',
    desc: 'Gemini AI analyzes your content and auto-generates sections, quizzes, and summaries.',
    num: '02',
    accent: LOGO_PURPLE,
  },
  {
    icon: Crown,
    title: 'Learn & Conquer',
    desc: 'Complete quests, earn Knowledge Cards, climb ranks, and challenge friends.',
    num: '03',
    accent: '#F59E0B',
  },
];

// ── Social modes data
const socialModes = [
  { icon: Swords,      name: 'Study Raids',     desc: '2–7 players conquer material together. Pooled quizzes, +50% XP bonus.',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'  },
  { icon: Target,      name: 'Focus Duels',     desc: '1v1 focus integrity battles. Tab-switch detection. Higher focus wins.',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)' },
  { icon: Radio,       name: 'Quiz Arena',      desc: 'Up to 8 players compete live. Speed scoring: 1000 base + speed bonus.',    color: LOGO_BLUE, bg: 'rgba(44,255,248,0.07)',  border: 'rgba(44,255,248,0.2)' },
  { icon: GitBranch,   name: 'Learning Relay',  desc: 'Team splits material, teaches each other. AI merges all summaries.',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)'  },
  { icon: Coffee,      name: 'Study Rooms',     desc: 'Virtual co-working with Pomodoro sync, ambient music, and reactions.',     color: '#A78BFA', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.2)'},
  { icon: Globe,       name: 'Weekly Challenges', desc: 'Global community goals. Collective XP unlocks tier rewards for all.',    color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.2)'  },
];

// ── Rank tiers
const ranks = [
  { image: '/rank/bronze (1).webp',           name: 'Bronze',   levels: '1–5',    color: '#CD7F32' },
  { image: '/rank/silver (2).webp',           name: 'Silver',   levels: '6–15',   color: '#94A3B8' },
  { image: '/rank/gold (3).webp',             name: 'Gold',     levels: '16–30',  color: '#EAB308' },
  { image: '/rank/platinum (4).webp',         name: 'Platinum', levels: '31–50',  color: '#7DD3FC' },
  { image: '/rank/emerald (5).webp',          name: 'Emerald',  levels: '51–75',  color: '#10B981' },
  { image: '/rank/diamond (tertinggi).webp',  name: 'Diamond',  levels: '76–100', color: '#A5B4FC' },
];

// ── Stats
const stats = [
  { value: '5+',  label: 'Content Types',  desc: 'PDF, YouTube, Articles, Images, Slides' },
  { value: '6',   label: 'Social Modes',   desc: 'Raids, Duels, Arena, Relay, Rooms, Challenges' },
  { value: '100', label: 'XP Levels',      desc: 'From Bronze to Diamond' },
  { value: 'AI',  label: 'Powered',        desc: 'Gemini 2.0 Flash under the hood' },
];

// ── Content type icons for the upload showcase
const contentTypes = [
  { icon: FileText, label: 'PDF',        color: '#EF4444' },
  { icon: Youtube,  label: 'YouTube',    color: '#EF4444' },
  { icon: Globe,    label: 'Articles',   color: '#3B82F6' },
  { icon: Sparkles, label: 'AI Magic',   color: LOGO_PURPLE },
];

// ── XP Activities for the reward breakdown card
const xpActivities = [
  { label: 'Section Complete',   xp: '+20',   color: '#A78BFA' },
  { label: 'Quiz Pass (≥70%)',    xp: '+30',   color: LOGO_BLUE },
  { label: 'Perfect Quiz',        xp: '+50',   color: '#F59E0B' },
  { label: 'Summary Approved',    xp: '+25',   color: '#22C55E' },
  { label: 'Focus Integrity ≥90%', xp: '+15',  color: '#06B6D4' },
  { label: 'Full Material Done',  xp: '+100',  color: '#EF4444' },
];

// ── Scroll stack deep-dive cards
const scrollCards = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload Anything',
    subtitle: 'Every format, one destination',
    desc: 'Drag-and-drop PDFs, paste YouTube links, share article URLs, or upload images. Nexera handles every format and converts it into a structured learning path — no prep needed.',
    features: ['PDF & Documents', 'YouTube & Video URLs', 'Web Articles', 'Images & Slides'],
    color: LOGO_BLUE,
  },
  {
    num: '02',
    icon: Brain,
    title: 'AI Structures It',
    subtitle: 'Gemini 2.0 does the heavy lifting',
    desc: 'Our AI analyzes content in seconds — auto-generating sections, MCQ quizzes, summary cards, focus keywords, and learning objectives. You study, not organize.',
    features: ['Auto-generated quizzes', 'Section summaries', 'Learning objectives', 'Smart flashcards'],
    color: LOGO_PURPLE,
  },
  {
    num: '03',
    icon: Swords,
    title: 'Play. Compete. Win.',
    subtitle: '6 social modes. Infinite rivalry.',
    desc: 'Challenge friends to Study Raids, 1v1 Focus Duels, or live Quiz Arenas. Every session earns XP and pushes your rank forward. Social play gives +50% XP bonus.',
    features: ['Study Raids (2–7 players)', '1v1 Focus Duels', 'Live Quiz Arena', '+50% XP from social play'],
    color: '#EF4444',
  },
  {
    num: '04',
    icon: Trophy,
    title: 'Track. Prove. Grow.',
    subtitle: 'Your learning history, visualized',
    desc: 'Every session builds your Knowledge Profile — a GitHub-style heatmap, Knowledge Cards per tier, rank progression, and a public page. Show the world what you know.',
    features: ['52-week learning heatmap', 'Knowledge Cards (Bronze→Diamond)', '6 rank tiers: Bronze → Diamond', 'Public Knowledge Profile'],
    color: '#F59E0B',
  },
];

// ── Knowledge Card tiers
const cardTiers = [
  { tier: '🥉', name: 'Bronze',  range: '70–79%',  glow: 'rgba(205,127,50,0.4)',  border: '#CD7F32' },
  { tier: '🥈', name: 'Silver',  range: '80–89%',  glow: 'rgba(192,192,192,0.4)', border: '#C0C0C0' },
  { tier: '🥇', name: 'Gold',    range: '90–99%',  glow: 'rgba(255,215,0,0.5)',   border: '#FFD700' },
  { tier: '💎', name: 'Diamond', range: '100%',    glow: 'rgba(167,139,250,0.5)', border: 'url(#diamondGrad)' },
];

const LandingPage = () => {
  const featuresRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A14] overflow-x-hidden font-body">
      {/* ═══════════════════════════════════════════
          GLASSMORPHISM FLOATING NAVBAR
      ═══════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <nav
          className={`max-w-5xl mx-auto rounded-2xl transition-all duration-300 ${scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : ''}`}
          style={{
            background: scrolled ? 'rgba(10,8,24,0.92)' : 'rgba(10,8,24,0.6)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="px-5 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(26,15,46,0.85) 0%, rgba(13,8,32,0.85) 100%)',
                }}
              >
                <img src="/nexera_logo.svg" alt="Nexera" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-heading font-extrabold text-[16px] tracking-wider" style={{ background: 'linear-gradient(90deg, #F1F5F9, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NEXERA
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-[14px] font-medium">
              <button onClick={scrollToFeatures} className="text-[#64748B] hover:text-[#F1F5F9] transition-colors cursor-pointer">Features</button>
              <a href="#how-it-works" className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">How It Works</a>
              <a href="#social" className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">Social</a>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <button className="text-[14px] font-medium text-[#64748B] hover:text-[#F1F5F9] transition-colors px-4 py-2 cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-5 pb-5 pt-2 flex flex-col gap-2 rounded-b-2xl" style={{ background: 'rgba(10,8,24,0.97)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={scrollToFeatures} className="text-left py-2.5 text-[15px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">Features</button>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[15px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">How It Works</a>
              <a href="#social" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[15px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">Social</a>
              <div className="flex gap-3 pt-3 mt-1 border-t border-white/10">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Orb Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-40 blur-sm">
            <Orb hue={270} hoverIntensity={0.3} rotateOnHover forceHoverState={false} />
          </div>
        </div>
        {/* Ambient orbs */}
        <div className="absolute top-20 -left-32 w-[400px] h-[400px] opacity-15 blur-md pointer-events-none">
          <Orb hue={195} hoverIntensity={0.1} rotateOnHover={false} forceHoverState />
        </div>
        <div className="absolute bottom-20 -right-32 w-[350px] h-[350px] opacity-12 blur-md pointer-events-none">
          <Orb hue={290} hoverIntensity={0.1} rotateOnHover={false} forceHoverState />
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14] via-transparent to-[#0A0A14] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A14]/60 via-transparent to-[#0A0A14]/60 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="mb-6">
            <SectionLabel color="purple">
              <Sparkles size={11} />
              AI-Powered Learning Platform
            </SectionLabel>
          </div>

          {/* Giant title */}
          <h1 className="font-heading mb-3" style={{ letterSpacing: '-0.04em' }}>
            <span
              className="block font-black leading-none"
              style={{
                fontSize: 'clamp(4rem, 12vw, 9rem)',
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.35) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NEXERA
            </span>
          </h1>

          {/* Tagline — logo colors: blue and purple */}
          <p className="font-heading text-[1.35rem] md:text-[1.8rem] text-[#94A3B8] mb-2 tracking-wide font-medium">
            Next Era of{' '}
            <span
              style={{
                background: `linear-gradient(90deg, ${LOGO_BLUE} 0%, #7B6FFF 45%, ${LOGO_PURPLE} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Fun Learning
            </span>
          </p>

          <p className="text-[1rem] md:text-[1.1rem] text-[#64748B] max-w-xl mb-10 leading-relaxed">
            Upload any material. AI transforms it into quests, quizzes, and knowledge cards.
            Level up, compete with friends, and build your Knowledge Empire.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center mb-14">
            <Link to="/register">
              <Button size="lg" className="group px-8" style={{ boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
                Get Started — It's Free
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button onClick={scrollToFeatures}>
              <Button variant="secondary" size="lg" className="px-8">
                Explore Features
              </Button>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex gap-8 md:gap-16 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-[2rem] md:text-[2.5rem] font-bold font-heading text-white leading-none">{s.value}</p>
                <p className="text-[11px] text-[#64748B] uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={scrollToFeatures} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[#475569] hover:text-[#A78BFA] transition-colors animate-bounce cursor-pointer">
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3 STEPS
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative px-4 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel color="blue">How It Works</SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-4" style={{ letterSpacing: '-0.02em' }}>
              Three Steps to Mastery
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto text-[1rem]">
              From raw material to Knowledge Empire — simplified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-[3.5rem] left-[22%] right-[22%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/5 transition-all duration-300 hover:border-white/10"
                style={{ background: 'rgba(20,14,40,0.5)', backdropFilter: 'blur(8px)' }}
              >
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: `${step.accent}12`, border: `1px solid ${step.accent}30`, boxShadow: `0 0 20px ${step.accent}15` }}
                  >
                    <step.icon size={30} style={{ color: step.accent }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center"
                    style={{ background: step.accent, color: '#0A0A14' }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-[1.05rem] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[0.875rem] text-[#64748B] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SCROLL STACK — DEEP DIVE
      ═══════════════════════════════════════════ */}
      <section id="deep-dive" className="relative pt-28 pb-0">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <SectionLabel color="blue">Deep Dive</SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-4" style={{ letterSpacing: '-0.02em' }}>
              The Full Experience
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto text-[1rem]">
              Everything you do on Nexera compounds — scroll through each layer.
            </p>
          </div>
        </div>

        <ScrollStack
          useWindowScroll={true}
          itemDistance={50}
          itemScale={0.04}
          itemStackDistance={20}
          stackPosition="18%"
          baseScale={0.88}
        >
          {scrollCards.map((card, i) => (
            <ScrollStackItem
              key={i}
              itemStyle={{ borderColor: `${card.color}30`, boxShadow: `0 0 40px ${card.color}08` }}
            >
              {/* Styled card interior */}
              <div
                className="h-full flex flex-col md:flex-row gap-8 items-start"
                style={{
                  background: `linear-gradient(135deg, rgba(11,8,26,0.0), rgba(11,8,26,0.0))`,
                }}
              >
                {/* Left: number + icon */}
                <div className="flex-shrink-0 flex items-center gap-4 md:flex-col md:items-center md:gap-3 pt-1">
                  <span
                    className="font-heading font-black leading-none select-none"
                    style={{ fontSize: '3.5rem', color: `${card.color}28`, letterSpacing: '-0.05em' }}
                  >
                    {card.num}
                  </span>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}15`, border: `1px solid ${card.color}35` }}
                  >
                    <card.icon size={26} style={{ color: card.color }} />
                  </div>
                </div>

                {/* Right: content */}
                <div className="flex-1">
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: card.color }}>
                    {card.subtitle}
                  </p>
                  <h3 className="font-heading font-bold text-white text-[1.5rem] mb-3" style={{ letterSpacing: '-0.02em' }}>
                    {card.title}
                  </h3>
                  <p className="text-[#64748B] text-[0.925rem] leading-relaxed mb-6">
                    {card.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {card.features.map((f, fi) => (
                      <span
                        key={fi}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full"
                        style={{
                          background: `${card.color}10`,
                          border: `1px solid ${card.color}30`,
                          color: card.color,
                        }}
                      >
                        <CheckCircle size={10} />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </section>

      {/* ═══════════════════════════════════════════
          BENTO FEATURES GRID
      ═══════════════════════════════════════════ */}
      <section ref={featuresRef} id="features" className="relative px-4 py-28">
        {/* Subtle bg orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-8 blur-2xl pointer-events-none">
          <Orb hue={270} hoverIntensity={0} rotateOnHover={false} forceHoverState />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel color="purple">Core Features</SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-4" style={{ letterSpacing: '-0.02em' }}>
              Everything You Need to Excel
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto text-[1rem]">
              A complete learning ecosystem that turns studying into an adventure.
            </p>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">

            {/* Large card — BYOC (spans 2 cols) */}
            <BentoCard className="lg:col-span-2 p-7 flex flex-col justify-between hover:border-[rgba(124,58,237,0.25)]" glow>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)' }}>
                    <Upload size={20} color="#A78BFA" />
                  </div>
                  <h3 className="font-heading font-semibold text-white text-[1.1rem]">Bring Your Own Content</h3>
                </div>
                <p className="text-[#64748B] text-[0.9rem] leading-relaxed mb-5">
                  Upload anything — AI instantly builds a structured learning path with quizzes & summaries.
                </p>
              </div>
              {/* Content type pills */}
              <div className="flex gap-2 flex-wrap">
                {contentTypes.map((ct, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: `${ct.color}15`, border: `1px solid ${ct.color}30`, color: ct.color }}>
                    <ct.icon size={12} />
                    {ct.label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748B' }}>
                  + More
                </span>
              </div>
            </BentoCard>

            {/* AI-Powered */}
            <BentoCard className="p-7 flex flex-col justify-between hover:border-[rgba(44,255,248,0.2)]">
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${LOGO_BLUE}15` }}>
                  <Brain size={20} style={{ color: LOGO_BLUE }} />
                </div>
                <h3 className="font-heading font-semibold text-white mb-2">AI-Powered Quizzes</h3>
                <p className="text-[#64748B] text-[0.875rem] leading-relaxed">
                  Auto-generated MCQs, summary validation, and smart feedback from Gemini 2.0.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: LOGO_BLUE }} />
                <span className="text-[12px]" style={{ color: LOGO_BLUE }}>Powered by Gemini 2.0 Flash</span>
              </div>
            </BentoCard>

            {/* XP Breakdown card */}
            <BentoCard className="p-6 flex flex-col hover:border-[rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} color="#F59E0B" />
                <h3 className="font-heading font-semibold text-white text-[0.95rem]">XP Reward System</h3>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {xpActivities.slice(0, 4).map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#64748B]">{a.label}</span>
                    <span className="text-[12px] font-bold" style={{ color: a.color }}>{a.xp}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-[#475569]">100 levels · Bronze → Diamond</div>
            </BentoCard>

            {/* Knowledge Cards */}
            <BentoCard className="p-6 flex flex-col hover:border-[rgba(167,139,250,0.2)]">
              <div className="flex items-center gap-2 mb-4">
                <Star size={18} color="#A78BFA" />
                <h3 className="font-heading font-semibold text-white text-[0.95rem]">Knowledge Cards</h3>
              </div>
              <p className="text-[#64748B] text-[0.8rem] mb-4 flex-1">Gamified certificates earned per completed material. Pin your 6 best to your public profile.</p>
              <div className="flex gap-2">
                {cardTiers.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: `${t.glow.replace('0.', '0.06').replace(',0.', ',0.')}`  , border: `1px solid ${t.border === 'url(#diamondGrad)' ? 'rgba(167,139,250,0.4)' : t.border}20` }}>
                    <span className="text-base">{t.tier}</span>
                    <span className="text-[10px] text-[#64748B]">{t.range}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Streak / Focus */}
            <BentoCard className="p-6 flex flex-col gap-3 hover:border-[rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-2">
                <Flame size={18} color="#EF4444" />
                <h3 className="font-heading font-semibold text-white text-[0.95rem]">Streak & Focus Mode</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <span className="text-[13px] text-[#94A3B8]">🔥 Current Streak</span>
                  <span className="text-[13px] font-bold text-[#EF4444]">7 days</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <span className="text-[13px] text-[#94A3B8]">🎯 Focus Integrity</span>
                  <span className="text-[13px] font-bold text-[#06B6D4]">94%</span>
                </div>
              </div>
            </BentoCard>

            {/* Heatmap Preview — spans 2 cols */}
            <BentoCard className="lg:col-span-2 p-7 flex flex-col hover:border-[rgba(124,58,237,0.2)]">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} color="#A78BFA" />
                <h3 className="font-heading font-semibold text-white">Knowledge Profile — Learning Heatmap</h3>
              </div>
              <p className="text-[#64748B] text-[0.875rem] mb-5">GitHub-style 52-week heatmap visualizing your daily study intensity. Share it as proof of your dedication.</p>
              {/* Fake heatmap visualization */}
              <div className="flex gap-1 flex-1 items-end overflow-hidden">
                {Array.from({ length: 26 }).map((_, week) => (
                  <div key={week} className="flex flex-col gap-1 flex-1">
                    {Array.from({ length: 7 }).map((_, day) => {
                      const intensity = Math.random();
                      const colors = ['#1A1A2E', '#16213E', '#0F3460', '#533483', '#7C3AED'];
                      const idx = intensity < 0.4 ? 0 : intensity < 0.6 ? 1 : intensity < 0.75 ? 2 : intensity < 0.9 ? 3 : 4;
                      return (
                        <div key={day} className="aspect-square rounded-sm" style={{ background: colors[idx], minHeight: '6px' }} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </BentoCard>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LEAGUE SYSTEM — YOUR LEARNING LEGACY
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        {/* Subtle separator */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)' }} />

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <SectionLabel color="amber">League System</SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-3" style={{ letterSpacing: '-0.02em' }}>
              Your Learning Legacy
            </h2>
            <p className="text-[#64748B] max-w-lg mx-auto">
              Compete weekly in ranked leagues. Top 10 promote, bottom 20 demote — only 50 players per block. Climb from Bronze to Diamond.
            </p>
          </div>

          {/* Tier progression */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {ranks.map((rank, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-center flex flex-col items-center gap-3 p-6 rounded-2xl w-[160px] transition-all duration-300 hover:scale-105 cursor-default"
                style={{
                  background: `${rank.color}08`,
                  border: `1px solid ${rank.color}25`,
                  boxShadow: i === 5 ? `0 0 20px ${rank.color}20` : 'none',
                }}
              >
                <img src={rank.image} alt={rank.name} className="w-12 h-12 object-contain" />
                <div className="text-center">
                  <p className="font-heading font-bold text-white text-[0.95rem]">{rank.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: rank.color }}>League Tier {i + 1}</p>
                </div>
                {i < ranks.length - 1 && (
                  <div className="w-full h-1.5 rounded-full" style={{ background: `${rank.color}20` }}>
                    <div className="h-full rounded-full" style={{ background: rank.color, width: `${100 - i * 15}%` }} />
                  </div>
                )}
                {i === ranks.length - 1 && (
                  <span className="text-[11px] px-2 py-1 rounded-full font-bold" style={{ background: `${rank.color}20`, color: rank.color }}>
                    MAX
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* League rules cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <ChevronUp size={22} color="#10B981" />
              </div>
              <p className="font-heading font-semibold text-white text-[0.95rem] mb-1">Top 10 Promote</p>
              <p className="text-[#64748B] text-[0.8rem] leading-relaxed">Finish in the top 10 of your block to advance to the next league tier.</p>
            </div>
            <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(59,130,246,0.15)' }}>
                <Shield size={22} color="#3B82F6" />
              </div>
              <p className="font-heading font-semibold text-white text-[0.95rem] mb-1">#11–#30 Stay</p>
              <p className="text-[#64748B] text-[0.8rem] leading-relaxed">Hold your position in the safe zone. Keep learning to maintain your tier.</p>
            </div>
            <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <ChevronDown size={22} color="#EF4444" />
              </div>
              <p className="font-heading font-semibold text-white text-[0.95rem] mb-1">#31–#50 Demote</p>
              <p className="text-[#64748B] text-[0.8rem] leading-relaxed">Fall behind and you'll drop a tier. Every XP earned counts towards your rank.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL LEARNING MODES
      ═══════════════════════════════════════════ */}
      <section id="social" className="relative px-4 py-28">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(44,255,248,0.15), transparent)' }} />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel color="cyan">Social Learning</SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-4" style={{ letterSpacing: '-0.02em' }}>
              Learn Together, Grow Faster
            </h2>
            <p className="text-[#64748B] max-w-lg mx-auto text-[1rem]">
              6 collaborative modes — because knowledge compounds when shared.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {socialModes.map((mode, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: mode.bg,
                  border: `1px solid ${mode.border}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${mode.color}20`, border: `1px solid ${mode.color}30` }}
                  >
                    <mode.icon size={20} style={{ color: mode.color }} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-white text-[1rem] mb-1.5">{mode.name}</h3>
                    <p className="text-[#64748B] text-[0.85rem] leading-relaxed">{mode.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Proof of work callout */}
          <div
            className="mt-10 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
              <Lock size={22} color="#A78BFA" />
            </div>
            <div className="text-center md:text-left">
              <p className="font-heading font-semibold text-white mb-1">Proof of Work Economy</p>
              <p className="text-[#64748B] text-[0.875rem]">
                XP and Focus Coins can only be earned through validated learning. No shortcuts, no purchases — only real effort counts.
              </p>
            </div>
            <div className="flex gap-3 ml-auto flex-shrink-0">
              {['+20 XP', '+30 XP', '+100 XP'].map((xp, i) => (
                <span key={i} className="text-[12px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.2)' }}>
                  {xp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PARTICLE NEURAL — AI ENGINE VISUALIZATION
      ═══════════════════════════════════════════ */}
      <section className="relative px-4 py-24">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(44,255,248,0.12), transparent)' }} />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel color="blue">
              <Cpu size={11} />
              Neural Engine
            </SectionLabel>
            <h2 className="font-heading text-[2rem] md:text-[2.75rem] font-bold text-white mt-4 mb-3" style={{ letterSpacing: '-0.02em' }}>
              Powered by Intelligence
            </h2>
            <p className="text-[#64748B] max-w-sm mx-auto">
              Hover the visualization to accelerate signal flow.
            </p>
          </div>

          {/* Canvas container */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              height: '380px',
              background: 'rgba(8,6,18,0.92)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 0 80px rgba(44,255,248,0.03), 0 0 60px rgba(0,0,0,0.5)',
            }}
          >
            <ParticleNeural className="absolute inset-0 w-full h-full" />
            <div className="absolute top-5 left-6 pointer-events-none">
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(44,255,248,0.3)' }}>Input</p>
              <p className="font-mono text-[9px]" style={{ color: 'rgba(44,255,248,0.18)' }}>Upload Vector</p>
            </div>
            <div className="absolute top-5 right-6 text-right pointer-events-none">
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.3)' }}>Output</p>
              <p className="font-mono text-[9px]" style={{ color: 'rgba(167,139,250,0.18)' }}>Course Structure</p>
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
              <p className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>Gemini 2.0 Flash · Real-time Processing</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Model',             value: 'Gemini 2.0 Flash', color: LOGO_BLUE   },
              { label: 'Quiz Generation',   value: '< 3 seconds',      color: LOGO_PURPLE },
              { label: 'Summary Accuracy',  value: '94% approval',     color: '#22C55E'   },
              { label: 'Supported Formats', value: '5+ types',          color: '#F59E0B'   },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-heading font-bold text-white text-[1rem] mb-0.5">{s.value}</p>
                <p className="text-[11px] text-[#475569]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="relative px-4 py-36 overflow-hidden">
        {/* Orb background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[550px] h-[550px] opacity-20 blur-md">
            <Orb hue={270} hoverIntensity={0.15} rotateOnHover={false} forceHoverState />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A14] via-transparent to-[#0A0A14] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <SectionLabel color="purple">
            <Crown size={11} />
            Start Your Journey
          </SectionLabel>
          <h2 className="font-heading text-[2rem] md:text-[3rem] font-bold text-white mt-5 mb-5" style={{ letterSpacing: '-0.02em' }}>
            Ready to Enter the{' '}
            <span style={{ background: `linear-gradient(90deg, ${LOGO_BLUE}, ${LOGO_PURPLE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Next Era?
            </span>
          </h2>
          <p className="text-[#64748B] mb-10 max-w-md mx-auto leading-relaxed">
            Join learners transforming how they study. Your Knowledge Empire awaits — upload your first material in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="group px-10" style={{ boxShadow: '0 0 28px rgba(124,58,237,0.5)' }}>
                <Crown size={18} className="mr-2" />
                Build Your Empire
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="px-10">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-[12px] text-[#475569] mt-5">Free forever · No credit card required · Powered by AI</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer style={{ background: 'rgba(6,4,14,0.99)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">

          {/* 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand column */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(26,15,46,0.85), rgba(13,8,32,0.85))' }}
                >
                  <img src="/nexera_logo.svg" alt="Nexera" className="w-6 h-6 object-contain" />
                </div>
                <span
                  className="font-heading font-extrabold text-[16px] tracking-wider"
                  style={{ background: 'linear-gradient(90deg, #F1F5F9, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  NEXERA
                </span>
              </Link>
              <p className="text-[#475569] text-[13px] leading-relaxed mb-5">
                The next era of fun, social, AI-powered learning. Build your Knowledge Empire.
              </p>
              {/* Social icons */}
              <div className="flex gap-2">
                {[Globe, MessageSquare, Github].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Icon size={13} className="text-[#475569]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div>
              <h4 className="font-heading font-semibold text-[#94A3B8] text-[11px] uppercase tracking-widest mb-5">Product</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  ['Upload Content', '#how-it-works'],
                  ['AI Quizzes',     '#features'],
                  ['Knowledge Cards','#features'],
                  ['XP & Ranks',     '#features'],
                  ['Social Modes',   '#social'],
                  ['Focus Mode',     '#features'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[#64748B] text-[13px] hover:text-[#94A3B8] transition-colors leading-none">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community column */}
            <div>
              <h4 className="font-heading font-semibold text-[#94A3B8] text-[11px] uppercase tracking-widest mb-5">Community</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  ['Study Raids',        '#social'],
                  ['Quiz Arena',         '#social'],
                  ['Learning Relay',     '#social'],
                  ['Weekly Challenges',  '#social'],
                  ['Leaderboard',        '#'],
                  ['Knowledge Profiles', '#'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[#64748B] text-[13px] hover:text-[#94A3B8] transition-colors leading-none">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="font-heading font-semibold text-[#94A3B8] text-[11px] uppercase tracking-widest mb-5">Company</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  ['About',           '#'],
                  ['Blog',            '#'],
                  ['Changelog',       '#'],
                  ['Privacy Policy',  '#'],
                  ['Terms of Service','#'],
                  ['Contact',         '#'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[#64748B] text-[13px] hover:text-[#94A3B8] transition-colors leading-none">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.05)' }} />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#334155]">
              &copy; {new Date().getFullYear()} Nexera. All rights reserved. Built for learners worldwide.
            </p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-[11px] text-[#475569]">All systems operational</span>
              </div>
              <span className="text-[11px] text-[#334155]">v1.0 · Powered by Gemini 2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
