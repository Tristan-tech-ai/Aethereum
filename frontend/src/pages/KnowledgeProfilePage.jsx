import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Share2, Edit } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import KnowledgeCard from '../components/profile/KnowledgeCard';
import LearningHeatmap from '../components/profile/LearningHeatmap';
import LevelBadge from '../components/profile/LevelBadge';
import StreakDisplay from '../components/profile/StreakDisplay';
import AchievementBadge from '../components/profile/AchievementBadge';
import AchievementGrid from '../components/profile/AchievementGrid';

// Demo data
const pinnedCards = [
  { title: 'Binary Trees', subject: 'Computer Science', mastery: 95, tier: 'gold', quizScore: 96, focusScore: 94, timeSpent: 68, pinned: true, likes: 28 },
  { title: 'Molecular Biology', subject: 'Biology', mastery: 100, tier: 'diamond', quizScore: 100, focusScore: 98, timeSpent: 72, pinned: true, likes: 45 },
  { title: 'Linear Algebra', subject: 'Mathematics', mastery: 82, tier: 'silver', quizScore: 85, focusScore: 88, timeSpent: 52, pinned: true, likes: 12 },
  { title: 'Quantum Mechanics', subject: 'Physics', mastery: 91, tier: 'gold', quizScore: 93, focusScore: 90, timeSpent: 65, pinned: true, likes: 34 },
  { title: 'Intro to Python', subject: 'Computer Science', mastery: 73, tier: 'bronze', quizScore: 78, focusScore: 82, timeSpent: 35, pinned: true, likes: 5 },
  { title: 'Organic Chemistry', subject: 'Chemistry', mastery: 88, tier: 'silver', quizScore: 90, focusScore: 85, timeSpent: 58, pinned: true, likes: 18 },
];

const allCards = [
  ...pinnedCards,
  { title: 'Civil War', subject: 'History', mastery: 78, tier: 'bronze', quizScore: 80, focusScore: 78, timeSpent: 40, pinned: false, likes: 3 },
  { title: 'Microeconomics', subject: 'Economics', mastery: 84, tier: 'silver', quizScore: 87, focusScore: 82, timeSpent: 48, pinned: false, likes: 9 },
  { title: 'Shakespeare', subject: 'Literature', mastery: 92, tier: 'gold', quizScore: 94, focusScore: 91, timeSpent: 55, pinned: false, likes: 22 },
];

const achievements = [
  { name: 'First Steps', emoji: '🚀', description: 'Complete your first learning session', category: 'learning', unlocked: true, unlockedDate: 'Jan 15', featured: false },
  { name: 'Bookworm', emoji: '📖', description: 'Read 10 learning materials', category: 'learning', unlocked: true, unlockedDate: 'Feb 1', featured: true },
  { name: 'Hot Streak', emoji: '🔥', description: 'Maintain a 7-day learning streak', category: 'streak', unlocked: true, unlockedDate: 'Feb 14', featured: true },
  { name: 'Quiz Master', emoji: '💯', description: 'Score 100% on 5 quizzes', category: 'learning', unlocked: true, unlockedDate: 'Mar 1', featured: true },
  { name: 'Polymath', emoji: '🌍', description: 'Study 5 different subjects', category: 'learning', unlocked: true, unlockedDate: 'Mar 10', featured: false },
  { name: 'Raid Veteran', emoji: '⚔️', description: 'Complete 10 Study Raids', category: 'social', unlocked: true, unlockedDate: 'Mar 5', featured: false },
  { name: 'Duel Champion', emoji: '🥊', description: 'Win 20 Focus Duels', category: 'social', unlocked: false, progress: 70 },
  { name: 'Arena Hero', emoji: '🏟️', description: 'Win 10 Quiz Arena matches', category: 'social', unlocked: false, progress: 40 },
  { name: 'Knowledge Seeker', emoji: '🧠', description: 'Earn 50 Knowledge Cards', category: 'learning', unlocked: false, progress: 60 },
  { name: 'Perfectionist', emoji: '💎', description: 'Earn a Diamond-tier Knowledge Card', category: 'special', unlocked: false, progress: 20 },
  { name: 'Social Learner', emoji: '🤝', description: 'Add 10 friends', category: 'social', unlocked: false, progress: null },
  { name: 'Inferno', emoji: '🌋', description: 'Maintain a 30-day learning streak', category: 'streak', unlocked: false, progress: null },
  { name: 'Emperor', emoji: '👑', description: 'Reach Level 50 — Supreme knowledge ruler', category: 'special', unlocked: false, progress: null },
];

const xpEvents = [
  { action: 'Quiz Perfect Score', xp: '+50 XP', time: '2h ago', icon: '💯' },
  { action: 'Section Complete', xp: '+20 XP', time: '3h ago', icon: '✅' },
  { action: 'Focus Integrity Bonus', xp: '+15 XP', time: '3h ago', icon: '⚡' },
  { action: 'Daily Login', xp: '+10 XP', time: '1d ago', icon: '📅' },
  { action: 'Study Raid Complete', xp: '+75 XP', time: '2d ago', icon: '⚔️' },
];

const KnowledgeProfilePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [cardFilter, setCardFilter] = useState('all');

  const tabs = ['Overview', 'Cards', 'Achievements', 'Analytics'];
  const name = user?.name || 'Andi Pratama';
  const username = user?.username || 'andi_pratama';

  const filteredCards = cardFilter === 'all'
    ? allCards
    : allCards.filter((c) => c.tier === cardFilter);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
          <Avatar
            src={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`) : null}
            name={name}
            size="xl"
          />
          <div className="flex-1">
            <h1 className="text-h2 font-heading text-text-primary">{name}</h1>
            <p className="text-body-sm text-text-muted mb-1">@{username}</p>
            <p className="text-body-sm text-text-secondary mb-3">
              {user?.bio || 'CS student building my Knowledge Empire 🏰'}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="text-center">
                <p className="text-h4 font-bold text-text-primary">42</p>
                <p className="text-caption text-text-muted">Cards</p>
              </div>
              <div className="text-center">
                <p className="text-h4 font-bold text-text-primary">87</p>
                <p className="text-caption text-text-muted">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-h4 font-bold text-text-primary">38</p>
                <p className="text-caption text-text-muted">Materials</p>
              </div>
              <div className="text-center">
                <p className="text-h4 font-bold text-text-primary">89%</p>
                <p className="text-caption text-text-muted">Avg Mastery</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Link to="/settings">
                <Button variant="secondary" size="sm">
                  <Edit size={14} className="mr-1.5" /> Edit Profile
                </Button>
              </Link>
              <Button size="sm">
                <Share2 size={14} className="mr-1.5" /> Share Profile
              </Button>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Level + Streak */}
        <div className="flex flex-row lg:flex-col items-center gap-6 lg:gap-4">
          <LevelBadge level={28} currentXP={4200} nextLevelXP={5000} size="md" />
          <StreakDisplay count={14} bestStreak={21} status="active" weeklyGoal={5} weeklyProgress={4} compact={false} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.toLowerCase()
                ? 'border-primary text-primary-light'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Heatmap */}
          <Card padding="spacious">
            <LearningHeatmap weeks={52} />
          </Card>

          {/* Pinned Cards */}
          <section>
            <h3 className="text-h3 font-heading text-text-primary mb-4">📌 Pinned Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedCards.map((c, i) => (
                <KnowledgeCard key={i} {...c} />
              ))}
            </div>
          </section>

          {/* Featured Achievements */}
          <section>
            <h3 className="text-h3 font-heading text-text-primary mb-4">🏅 Featured Achievements</h3>
            <div className="flex gap-6 flex-wrap">
              {achievements.filter((a) => a.featured).map((a, i) => (
                <AchievementBadge key={i} {...a} size="lg" />
              ))}
            </div>
          </section>

          {/* Recent XP Events */}
          <Card padding="spacious">
            <h3 className="text-h4 font-heading text-text-primary mb-4">⚡ Recent XP Events</h3>
            <div className="space-y-3">
              {xpEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-3">
                    <span>{e.icon}</span>
                    <span className="text-sm text-text-secondary">{e.action}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-success">{e.xp}</span>
                    <span className="text-caption text-text-muted">{e.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Cards Tab ── */}
      {activeTab === 'cards' && (
        <div>
          {/* Filter bar */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'bronze', 'silver', 'gold', 'diamond'].map((f) => (
              <button
                key={f}
                onClick={() => setCardFilter(f)}
                className={`px-3 py-1.5 text-caption font-semibold rounded-full transition-colors ${
                  cardFilter === f
                    ? 'bg-primary/15 text-primary-light'
                    : 'bg-dark-card text-text-muted hover:text-text-secondary'
                }`}
              >
                {f === 'all' ? 'All' : f === 'bronze' ? '🥉 Bronze' : f === 'silver' ? '🥈 Silver' : f === 'gold' ? '🥇 Gold' : '💎 Diamond'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((c, i) => (
              <KnowledgeCard key={i} {...c} />
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements Tab ── */}
      {activeTab === 'achievements' && (
        <AchievementGrid achievements={achievements} />
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-caption text-text-muted">Total Sessions</p>
              <p className="text-h3 font-bold text-text-primary">156</p>
            </Card>
            <Card>
              <p className="text-caption text-text-muted">Total XP</p>
              <p className="text-h3 font-bold text-primary-light">12,450</p>
            </Card>
            <Card>
              <p className="text-caption text-text-muted">Avg Focus</p>
              <p className="text-h3 font-bold text-success">91%</p>
            </Card>
            <Card>
              <p className="text-caption text-text-muted">Materials Done</p>
              <p className="text-h3 font-bold text-text-primary">38</p>
            </Card>
          </div>

          {/* Placeholder charts */}
          <Card padding="spacious">
            <h3 className="text-h4 font-heading text-text-primary mb-4">XP Progress (30 Days)</h3>
            <div className="h-48 bg-dark-secondary rounded-md-drd flex items-center justify-center">
              <p className="text-text-muted text-sm">📈 Recharts LineChart — Coming soon</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="spacious">
              <h3 className="text-h4 font-heading text-text-primary mb-4">Subject Breakdown</h3>
              <div className="h-48 bg-dark-secondary rounded-md-drd flex items-center justify-center">
                <p className="text-text-muted text-sm">🥧 Recharts PieChart — Coming soon</p>
              </div>
            </Card>
            <Card padding="spacious">
              <h3 className="text-h4 font-heading text-text-primary mb-4">Quiz Performance</h3>
              <div className="h-48 bg-dark-secondary rounded-md-drd flex items-center justify-center">
                <p className="text-text-muted text-sm">📊 Recharts BarChart — Coming soon</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeProfilePage;
