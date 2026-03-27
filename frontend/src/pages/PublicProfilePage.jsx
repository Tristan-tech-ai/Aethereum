import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Swords, Copy, ExternalLink, Loader2, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import KnowledgeCard from '../components/profile/KnowledgeCard';
import LearningHeatmap from '../components/profile/LearningHeatmap';
import LevelBadge from '../components/profile/LevelBadge';
import StreakDisplay from '../components/profile/StreakDisplay';
import AchievementBadge from '../components/profile/AchievementBadge';
import ChallengeDuelModal from '../components/social/ChallengeDuelModal';
import api from '../services/api';
import { useFriendStore } from '../stores/friendStore';
import { useAuthStore } from '../stores/authStore';

const toTier = (tier = 'Bronze') => String(tier).toLowerCase();

const PublicProfilePage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [heatmapRaw, setHeatmapRaw] = useState([]);
  const [duelOpen, setDuelOpen] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null); // null | 'sending' | 'sent' | 'friends'
  const { sendFriendRequest, friends, fetchFriends } = useFriendStore();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, heatRes] = await Promise.allSettled([
          api.get(`/v1/profile/${username}`),
          api.get(`/v1/profile/${username}/heatmap`),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data ?? profileRes.value.data);
        }

        if (heatRes.status === 'fulfilled' && heatRes.value.data?.data?.heatmap) {
          const map = heatRes.value.data.data.heatmap;
          setHeatmapRaw(
            Object.entries(map).map(([date, value]) => ({
              date,
              sessions: Number(value.count ?? 0),
              minutes: Number(value.minutes ?? 0),
            }))
          );
        }
      } catch (err) {
        console.error('Profile fetch error:', err?.response?.status, err?.response?.data);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  // Check friendship status
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (profile?.user && friends.length > 0) {
      const isFriend = friends.some(f => f.username === profile.user.username);
      if (isFriend) setFriendStatus('friends');
    }
  }, [profile, friends]);

  const user = profile?.user ?? {};
  const stats = profile?.stats ?? {};
  const pinnedCards = profile?.pinned_cards ?? [];
  const achievements = profile?.featured_achievements ?? [];

  const mappedCards = useMemo(
    () => pinnedCards.map((card) => ({
      title: card.title,
      subject: card.subject_category ?? 'General',
      mastery: Number(card.mastery_percentage ?? 0),
      tier: toTier(card.tier),
      quizScore: Number(card.quiz_avg_score ?? 0),
      focusScore: Number(card.focus_integrity ?? 0),
      timeSpent: Number(card.time_invested ?? 0),
      pinned: Boolean(card.is_pinned),
      likes: Number(card.likes ?? 0),
    })),
    [pinnedCards],
  );

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const handleAddFriend = async () => {
    if (friendStatus) return;
    setFriendStatus('sending');
    const ok = await sendFriendRequest(user.username);
    setFriendStatus(ok ? 'sent' : null);
  };

  const isOwnProfile = currentUser?.username === username;

  if (loading) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-page mx-auto min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
        <Card className="text-center py-10 text-text-muted">Profile not found.</Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar name={user.name} src={user.avatar_url} size="2xl" className="mb-4" />

        <h1 className="text-h1 font-heading text-text-primary">{user.name}</h1>
        <p className="text-body-sm text-text-muted mb-1">@{user.username}</p>
        <p className="text-body-sm text-text-secondary mb-4 max-w-md">{user.bio || 'No bio yet.'}</p>

        <div className="flex items-center gap-6 mb-4">
          <LevelBadge
            level={Number(user.level ?? 1)}
            currentXP={Number(stats.current_xp ?? 0)}
            nextLevelXP={Number(stats.next_level_xp ?? 100)}
            size="sm"
            showXP={false}
          />
          <StreakDisplay
            count={Number(stats.current_streak ?? 0)}
            bestStreak={Number(stats.best_streak ?? 0)}
            status="active"
            compact
          />
        </div>

        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <p className="text-h4 font-bold text-text-primary">{Number(stats.total_cards ?? 0)}</p>
            <p className="text-caption text-text-muted">Cards</p>
          </div>
          <div className="text-center">
            <p className="text-h4 font-bold text-text-primary">{Number(stats.total_hours ?? 0)}</p>
            <p className="text-caption text-text-muted">Hours</p>
          </div>
          <div className="text-center">
            <p className="text-h4 font-bold text-text-primary">{Number(stats.total_materials ?? 0)}</p>
            <p className="text-caption text-text-muted">Materials</p>
          </div>
          <div className="text-center">
            <p className="text-h4 font-bold text-text-primary">{Number(stats.avg_mastery ?? 0)}%</p>
            <p className="text-caption text-text-muted">Avg Mastery</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isOwnProfile && (
            <>
              {friendStatus === 'friends' ? (
                <Button variant="secondary" disabled>
                  <Check size={16} className="mr-1.5" /> Friends
                </Button>
              ) : (
                <Button onClick={handleAddFriend} disabled={friendStatus === 'sending' || friendStatus === 'sent'}>
                  {friendStatus === 'sending' ? (
                    <><Loader2 size={16} className="mr-1.5 animate-spin" /> Sending...</>
                  ) : friendStatus === 'sent' ? (
                    <><Check size={16} className="mr-1.5" /> Request Sent</>
                  ) : (
                    <><UserPlus size={16} className="mr-1.5" /> Add Friend</>
                  )}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDuelOpen(true)}>
                <Swords size={16} className="mr-1.5" /> Challenge to Duel
              </Button>
            </>
          )}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-h3 font-heading text-text-primary mb-4">📌 Pinned Cards</h2>
        {mappedCards.length === 0 ? (
          <Card className="text-center py-6 text-text-muted">No pinned cards yet.</Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mappedCards.map((card, i) => (
              <KnowledgeCard key={i} {...card} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <Card padding="spacious">
          <LearningHeatmap rawData={heatmapRaw} />
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-h3 font-heading text-text-primary mb-4">🏅 Achievements</h2>
        {achievements.length === 0 ? (
          <Card className="text-center py-6 text-text-muted">No featured achievements.</Card>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {achievements.map((a) => (
              <AchievementBadge key={a.id} {...a} />
            ))}
          </div>
        )}
      </section>

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

      <ChallengeDuelModal isOpen={duelOpen} onClose={() => setDuelOpen(false)} />
    </div>
  );
};

export default PublicProfilePage;
