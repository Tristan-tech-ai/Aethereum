import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Brain, Crown, Sparkles, Users, Zap, ArrowRight, ChevronDown, BookOpen, Target, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Orb from '../components/ui/Orb';

const steps = [
  { icon: Upload, title: 'Upload Any Material', desc: 'PDF, YouTube, articles — bring your own content and let AI structure it for you.', num: '01' },
  { icon: Brain, title: 'Learn Interactively', desc: 'Focus sessions, smart quizzes, and AI-powered comprehension — learning that adapts to you.', num: '02' },
  { icon: Crown, title: 'Level Up & Compete', desc: 'Earn XP, unlock achievements, climb leaderboards, and build your Knowledge Empire.', num: '03' },
];

const features = [
  {
    icon: BookOpen,
    title: 'BYOC — Bring Your Own Content',
    desc: 'Upload PDFs, paste YouTube links, or import articles. AI transforms them into structured learning paths instantly.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'AI-Powered Learning',
    desc: 'Smart content analysis, auto-generated quizzes, and personalized comprehension feedback that evolves with you.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Users,
    title: 'Social Learning Modes',
    desc: 'Study Raids, Focus Duels, Quiz Arena, Learning Relay — learn together and challenge your friends.',
    gradient: 'from-cyan-400 to-teal-500',
  },
  {
    icon: Target,
    title: 'Focus Sessions',
    desc: 'Deep-dive into material with distraction-free focus mode, Pomodoro timers, and streak tracking.',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    icon: Trophy,
    title: 'Gamified Progress',
    desc: 'XP system, Knowledge Cards, rank tiers from Seedling to Sage — every session counts toward your legacy.',
    gradient: 'from-emerald-400 to-green-600',
  },
  {
    icon: Brain,
    title: 'AI Study Assistant',
    desc: 'Ask questions about your material, get explanations, and receive smart suggestions — your personal tutor.',
    gradient: 'from-blue-400 to-indigo-600',
  },
];

const stats = [
  { value: '5+', label: 'Content Types' },
  { value: '6', label: 'Social Modes' },
  { value: 'AI', label: 'Powered' },
  { value: '∞', label: 'Possibilities' },
];

const LandingPage = () => {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-base overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Orb Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-40 blur-sm">
            <Orb hue={270} hoverIntensity={0.2} rotateOnHover forceHoverState={false} />
          </div>
        </div>

        {/* Secondary ambient orbs */}
        <div className="absolute top-20 -left-32 w-[400px] h-[400px] opacity-15 blur-md pointer-events-none">
          <Orb hue={200} hoverIntensity={0.1} rotateOnHover={false} forceHoverState />
        </div>
        <div className="absolute bottom-20 -right-32 w-[350px] h-[350px] opacity-12 blur-md pointer-events-none">
          <Orb hue={320} hoverIntensity={0.1} rotateOnHover={false} forceHoverState />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-base via-transparent to-dark-base pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-base/60 via-transparent to-dark-base/60 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-primary-light text-caption font-semibold rounded-full">
              <Sparkles size={14} className="text-accent" />
              FICPACT CUP 2026 — Interactive Edutainment
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading mb-2">
            <span
              className="block text-[4.5rem] md:text-[7rem] lg:text-[8.5rem] font-black tracking-tight leading-none bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent"
              style={{ letterSpacing: '-0.04em' }}
            >
              NEXERA
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-h3 md:text-h2 font-heading text-text-secondary mb-2 tracking-wide">
            Next Era of{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
              Fun Learning
            </span>
          </p>

          <p className="text-body md:text-lg text-text-muted max-w-xl mb-10 leading-relaxed">
            Transform any material into an interactive adventure. Upload, learn, compete, 
            and build your Knowledge Empire — powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="group px-8 shadow-glow-primary">
                Get Started — It's Free
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button onClick={scrollToFeatures}>
              <Button variant="secondary" size="lg" className="px-8 backdrop-blur-sm">
                Explore Features
              </Button>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex gap-6 md:gap-12 text-center">
            {stats.map((s, i) => (
              <div key={i} className="group">
                <p className="text-h2 md:text-display font-bold text-white group-hover:text-primary-light transition-colors">
                  {s.value}
                </p>
                <p className="text-caption text-text-muted uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-text-muted hover:text-primary-light transition-colors animate-bounce cursor-pointer"
        >
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative px-4 py-24 bg-dark-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-caption text-primary-light uppercase tracking-widest font-semibold">How It Works</span>
            <h2 className="text-h1 md:text-display font-heading text-text-primary mt-3 mb-4">
              Three Steps to Mastery
            </h2>
            <p className="text-body text-text-secondary max-w-md mx-auto">
              From upload to empire — your learning journey simplified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-[1px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-glow-primary transition-all duration-normal">
                    <step.icon size={32} className="text-primary-light" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-caption font-bold flex items-center justify-center shadow-lg">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-h3 font-heading text-text-primary mb-2">{step.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed max-w-[280px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section ref={featuresRef} id="features" className="relative px-4 py-24">
        {/* Background orb accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 blur-xl pointer-events-none">
          <Orb hue={270} hoverIntensity={0.05} rotateOnHover={false} forceHoverState />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-caption text-accent uppercase tracking-widest font-semibold">Features</span>
            <h2 className="text-h1 md:text-display font-heading text-text-primary mt-3 mb-4">
              Everything You Need
            </h2>
            <p className="text-body text-text-secondary max-w-md mx-auto">
              A complete learning ecosystem that makes studying irresistible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-lg-drd bg-dark-card/60 backdrop-blur-sm border border-white/5 hover:border-primary/30 hover:bg-dark-elevated/60 transition-all duration-normal"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-md-drd bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-normal`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-h4 font-heading text-text-primary mb-2 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / MODES ===== */}
      <section className="px-4 py-24 bg-dark-secondary/30">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-caption text-secondary uppercase tracking-widest font-semibold">Social Learning</span>
          <h2 className="text-h1 md:text-display font-heading text-text-primary mt-3 mb-4">
            Learn Together, Grow Faster
          </h2>
          <p className="text-body text-text-secondary max-w-lg mx-auto mb-12">
            Challenge friends, join study groups, and compete in real-time — because learning is better together.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Study Raids', desc: 'Group study missions', icon: '⚔️' },
              { name: 'Focus Duels', desc: '1v1 study battles', icon: '🎯' },
              { name: 'Quiz Arena', desc: 'Live quiz competitions', icon: '🏟️' },
              { name: 'Learning Relay', desc: 'Team relay challenges', icon: '🏃' },
            ].map((mode, i) => (
              <div
                key={i}
                className="group p-5 rounded-lg-drd bg-dark-card/40 border border-white/5 hover:border-secondary/30 hover:bg-dark-card/80 transition-all duration-normal cursor-default"
              >
                <span className="text-3xl mb-3 block">{mode.icon}</span>
                <h3 className="text-body font-heading text-text-primary mb-1 group-hover:text-secondary transition-colors">{mode.name}</h3>
                <p className="text-caption text-text-muted">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative px-4 py-32 overflow-hidden">
        {/* CTA Orb background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] opacity-25 blur-md">
            <Orb hue={270} hoverIntensity={0.15} rotateOnHover={false} forceHoverState />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-base via-transparent to-dark-base pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-h1 md:text-display font-heading text-text-primary mb-4">
            Ready to Enter the{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Next Era?
            </span>
          </h2>
          <p className="text-body text-text-secondary mb-10 max-w-md mx-auto leading-relaxed">
            Join thousands of learners transforming how they study. Your Knowledge Empire awaits.
          </p>
          <Link to="/register">
            <Button size="lg" className="group px-10 shadow-glow-primary text-lg">
              <Crown size={20} className="mr-2" />
              Start Your Journey
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-caption text-text-muted mt-4">Free forever. No credit card required.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-caption text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-text-primary text-body">NEXERA</span>
            <span>— Next Era of Fun Learning</span>
          </div>
          <p>FICPACT CUP 2026 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
