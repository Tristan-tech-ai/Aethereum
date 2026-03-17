import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Brain, Crown, Sparkles, Users, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const steps = [
  { icon: Upload, title: 'Upload Any Material', desc: 'PDF, YouTube, articles — bring your own content to learn from.' },
  { icon: Brain, title: 'Learn with Focus', desc: 'Focus sessions, quizzes, and AI-powered comprehension checks.' },
  { icon: Crown, title: 'Build Your Profile', desc: 'Earn Knowledge Cards, level up, and showcase your expertise.' },
];

const features = [
  {
    icon: Upload,
    title: 'BYOC — Bring Your Own Content',
    desc: 'Upload PDFs, paste YouTube links, or import articles. AI transforms them into structured learning paths.',
    color: 'text-primary-light',
  },
  {
    icon: Zap,
    title: 'AI-Powered Learning',
    desc: 'Smart content analysis, auto-generated quizzes, and personalized comprehension feedback.',
    color: 'text-accent',
  },
  {
    icon: Users,
    title: 'Social Learning Modes',
    desc: 'Study Raids, Focus Duels, Quiz Arena — learn together with friends and community.',
    color: 'text-secondary',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-20">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-light text-caption font-semibold rounded-full">
            <Sparkles size={14} />
            FICPACT CUP 2026 — Interactive Edutainment
          </span>
        </div>

        <h1 className="text-display font-heading text-text-primary mb-4 max-w-3xl">
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            AETHEREUM
          </span>
          <br />
          <span className="text-h1">Knowledge Empire</span>
        </h1>

        <p className="text-body text-text-secondary max-w-xl mb-8 leading-relaxed">
          Transform any learning material into an interactive adventure.
          Build your Knowledge Profile with every concept you master.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/register">
            <Button size="lg">
              <Sparkles size={18} className="mr-2" />
              Get Started — It's Free
            </Button>
          </Link>
          <a href="#features">
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12 text-center">
          <div>
            <p className="text-h3 font-bold text-text-primary">5+</p>
            <p className="text-caption text-text-muted">Content Types</p>
          </div>
          <div>
            <p className="text-h3 font-bold text-text-primary">6</p>
            <p className="text-caption text-text-muted">Social Modes</p>
          </div>
          <div>
            <p className="text-h3 font-bold text-text-primary">AI</p>
            <p className="text-caption text-text-muted">Driven</p>
          </div>
        </div>
      </section>

      {/* 3-Step Onboarding */}
      <section className="px-4 py-16 bg-dark-secondary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2 font-heading text-text-primary text-center mb-3">
            How It Works
          </h2>
          <p className="text-text-secondary text-center mb-10">
            Three simple steps to start your knowledge journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon size={28} className="text-primary-light" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-caption font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-h4 font-heading text-text-primary mb-2">{step.title}</h3>
                <p className="text-body-sm text-text-secondary">{step.desc}</p>

                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute text-text-muted">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h2 font-heading text-text-primary text-center mb-3">
            Core Features
          </h2>
          <p className="text-text-secondary text-center mb-10">
            Everything you need to make learning stick
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} hover padding="spacious">
                <div className={`w-12 h-12 rounded-md-drd bg-dark-secondary flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-h4 font-heading text-text-primary mb-2">{f.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-h2 font-heading text-text-primary mb-3">
            Ready to Build Your Empire?
          </h2>
          <p className="text-text-secondary mb-8">
            Join learners who are transforming how they study.
          </p>
          <Link to="/register">
            <Button size="lg">
              <Crown size={18} className="mr-2" />
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
