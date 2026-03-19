import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus, Swords, Share2, Copy, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import KnowledgeCard from '../components/profile/KnowledgeCard';
import LearningHeatmap from '../components/profile/LearningHeatmap';
import LevelBadge from '../components/profile/LevelBadge';
import StreakDisplay from '../components/profile/StreakDisplay';
import AchievementBadge from '../components/profile/AchievementBadge';

// Demo data for public user
const publicUser = {
  name: 'Andi Pratama',
  username: 'andi_pratama',
  bio: 'CS student building my Knowledge Empire 🏰',
  level: 28,
  currentXP: 4200,
  nextLevelXP: 5000,
};

const pinnedCards = [
  { title: 'Binary Trees', subject: 'Computer Science', mastery: 95, tier: 'gold', quizScore: 96, focusScore: 94, timeSpent: 68, pinned: true, likes: 28 },
  { title: 'Molecular Biology', subject: 'Biology', mastery: 100, tier: 'diamond', quizScore: 100, focusScore: 98, timeSpent: 72, pinned: true, likes: 45 },
  { title: 'Linear Algebra', subject: 'Mathematics', mastery: 82, tier: 'silver', quizScore: 85, focusScore: 88, timeSpent: 52, pinned: true, likes: 12 },
  { title: 'Quantum Mechanics', subject: 'Physics', mastery: 91, tier: 'gold', quizScore: 93, focusScore: 90, timeSpent: 65, pinned: true, likes: 34 },
  { title: 'Intro to Python', subject: 'Computer Science', mastery: 73, tier: 'bronze', quizScore: 78, focusScore: 82, timeSpent: 35, pinned: true, likes: 5 },
  { title: 'Organic Chemistry', subject: 'Chemistry', mastery: 88, tier: 'silver', quizScore: 90, focusScore: 85, timeSpent: 58, pinned: true, likes: 18 },
];

const achievements = [
  { name: 'First Steps', emoji: '🚀', description: 'Complete your first learning session', category: 'learning', unlocked: true, unlockedDate: 'Jan 15' },
  { name: 'Bookworm', emoji: '📖', description: 'Read 10 learning materials', category: 'learning', unlocked: true, unlockedDate: 'Feb 1', featured: true },
  { name: 'Hot Streak', emoji: '🔥', description: 'Maintain a 7-day learning streak', category: 'streak', unlocked: true, unlockedDate: 'Feb 14', featured: true },
  { name: 'Quiz Master', emoji: '💯', description: 'Score 100% on 5 quizzes', category: 'learning', unlocked: true, unlockedDate: 'Mar 1', featured: true },
  { name: 'Polymath', emoji: '🌍', description: 'Study 5 different subjects', category: 'learning', unlocked: true, unlockedDate: 'Mar 10' },
  { name: 'Raid Veteran', emoji: '⚔️', description: 'Complete 10 Study Raids', category: 'social', unlocked: true, unlockedDate: 'Mar 5' },
  { name: 'Duel Champion', emoji: '🥊', description: 'Win 20 Focus Duels', category: 'social', unlocked: false },
  { name: 'Arena Hero', emoji: '🏟️', description: 'Win 10 Quiz Arena matches', category: 'social', unlocked: false },
];

const PublicProfilePage = () => {
  const { username } = useParams();
  const displayUser = publicUser; // In real app, fetch from API

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar name={displayUser.name} size="2xl" className="mb-4" />

        <h1 className="text-h1 font-heading text-text-primary">{displayUser.name}</h1>
        <p className="text-body-sm text-text-muted mb-1">@{username || displayUser.username}</p>
        <p className="text-body-sm text-text-secondary mb-4 max-w-md">{displayUser.bio}</p>

        {/* Level + Streak row */}
        <div className="flex items-center gap-6 mb-4">
          <LevelBadge level={displayUser.level} currentXP={displayUser.currentXP} nextLevelXP={displayUser.nextLevelXP} size="sm" showXP={false} />
          <StreakDisplay count={14} bestStreak={21} status="active" compact />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
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

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Button>
            <UserPlus size={16} className="mr-1.5" /> Add Friend
          </Button>
          <Button variant="secondary">
            <Swords size={16} className="mr-1.5" /> Challenge to Duel
          </Button>
        </div>
      </div>

      {/* Pinned Cards */}
      <section className="mb-10">
        <h2 className="text-h3 font-heading text-text-primary mb-4">📌 Pinned Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinnedCards.map((c, i) => (
            <KnowledgeCard key={i} {...c} />
          ))}
        </div>
      </section>

      {/* Learning Heatmap */}
      <section className="mb-10">
        <Card padding="spacious">
          <LearningHeatmap weeks={52} />
        </Card>
      </section>

      {/* Achievement Badges */}
      <section className="mb-10">
        <h2 className="text-h3 font-heading text-text-primary mb-4">🏅 Achievements</h2>
        <div className="flex gap-4 flex-wrap">
          {achievements.map((a, i) => (
            <AchievementBadge key={i} {...a} />
          ))}
        </div>
      </section>

      {/* Share Bar */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-text-secondary">Share this profile</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopyLink}>
            <Copy size={14} className="mr-1.5" /> Copy Link
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink size={14} className="mr-1.5" /> WhatsApp
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink size={14} className="mr-1.5" /> Twitter
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink size={14} className="mr-1.5" /> Instagram
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PublicProfilePage;
