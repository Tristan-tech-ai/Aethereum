import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, Trophy, ArrowLeft, Gift, Zap, Coins, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import api from '../services/api';

const getRemaining = (endsAt) => {
  if (!endsAt) return '—';
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const ChallengePage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [myContribution, setMyContribution] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [totalContributors, setTotalContributors] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentRes = await api.get('/v1/challenges/current');
        const currentPayload = currentRes.data?.data ?? currentRes.data;
        const currentChallenge = currentPayload?.challenge ?? null;

        setChallenge(currentChallenge);
        setMyContribution(Number(currentPayload?.my_contribution ?? 0));

        if (currentChallenge?.id) {
          const progressRes = await api.get(`/v1/challenges/${currentChallenge.id}/progress`);
          const progressPayload = progressRes.data?.data ?? progressRes.data;
          setContributors(progressPayload?.top_contributors ?? []);
          setTotalContributors(Number(progressPayload?.total_contributors ?? 0));
        }

        const historyRes = await api.get('/v1/challenges/history');
        const historyPayload = historyRes.data?.data ?? historyRes.data;
        const historyList = historyPayload?.challenges?.data ?? historyPayload?.challenges ?? [];
        setHistory(historyList);
      } catch {
        setChallenge(null);
        setContributors([]);
        setTotalContributors(0);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const update = () => setTimeRemaining(getRemaining(challenge?.ends_at));
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [challenge?.ends_at]);

  if (loading) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-page mx-auto min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-secondary transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <Card className="text-center py-10 text-text-muted">No active weekly challenge right now.</Card>
      </div>
    );
  }

  const communityProgress = Number(challenge.current_value ?? 0);
  const communityGoal = Number(challenge.goal_value ?? 0);
  const contributionUnit = challenge.challenge_type || 'points';
  const progressPercent = communityGoal > 0 ? Math.min((communityProgress / communityGoal) * 100, 100) : 0;
  const avgPerPerson = totalContributors > 0 ? Math.round(communityProgress / totalContributors) : 0;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-secondary transition-colors mb-3">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-heading text-text-primary flex items-center gap-3">
              <Target size={28} className="text-accent" /> Weekly Challenge
            </h1>
            <p className="text-text-secondary mt-1">
              Started {challenge.starts_at ? new Date(challenge.starts_at).toLocaleDateString() : '—'} · {totalContributors} participants
            </p>
          </div>
          <Badge variant="warning" className="text-sm px-3 py-1">
            <Clock size={12} className="mr-1" /> {timeRemaining} left
          </Badge>
        </div>
      </div>

      <Card className="relative overflow-hidden" padding="spacious">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-warning/5 pointer-events-none" />
        <div className="relative">
          <h2 className="text-h3 font-heading text-text-primary mb-2">{challenge.title}</h2>
          <p className="text-text-secondary mb-6">{challenge.description}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Community Progress</span>
              <span className="text-accent font-bold text-lg">
                {communityProgress.toLocaleString()} / {communityGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-4 bg-dark-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-warning rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-caption text-text-muted mt-1">{progressPercent.toFixed(1)}% complete</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Your Contribution</p>
              <p className="text-h4 font-bold text-primary-light">{myContribution}</p>
              <p className="text-[10px] text-text-muted">{contributionUnit}</p>
            </div>
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Participants</p>
              <p className="text-h4 font-bold text-text-primary">{totalContributors}</p>
              <p className="text-[10px] text-text-muted">active users</p>
            </div>
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Avg / Person</p>
              <p className="text-h4 font-bold text-text-primary">{avgPerPerson}</p>
              <p className="text-[10px] text-text-muted">{contributionUnit}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-tier-gold" /> Top Contributors
            </h3>
            <div className="space-y-1">
              {contributors.length === 0 ? (
                <p className="text-sm text-text-muted py-4 text-center">No contributions yet.</p>
              ) : contributors.map((entry, idx) => (
                <div key={entry.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-sm-drd hover:bg-white/[0.02] transition-colors">
                  <span className="w-8 text-center shrink-0">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-caption text-text-muted font-mono">#{idx + 1}</span>}
                  </span>
                  <Avatar name={entry.name} src={entry.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{entry.name}</p>
                    <p className="text-[11px] text-text-muted">@{entry.username}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">{Number(entry.contribution_value ?? 0)}</p>
                    <p className="text-[10px] text-text-muted">{contributionUnit}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4">
              <Gift size={18} className="text-accent" /> Rewards
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-sm-drd border bg-dark-secondary border-border-subtle">
                <p className="text-sm font-semibold text-text-primary mb-1">Completion Reward</p>
                <p className="text-[11px] text-text-muted mb-2">Granted when challenge completes</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-primary-light"><Zap size={10} /> +{Number(challenge.reward_coins ?? 0)} XP*</span>
                  <span className="flex items-center gap-1 text-[11px] text-accent"><Coins size={10} /> +{Number(challenge.reward_coins ?? 0)} Coins</span>
                </div>
                <p className="text-[10px] text-text-muted mt-2">*XP estimate shown as fallback.</p>
              </div>
            </div>
          </Card>

          <Card className="mt-4">
            <h3 className="text-h4 font-heading text-text-primary mb-3">Past Challenges</h3>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-text-muted py-2">No challenge history yet.</p>
              ) : history.slice(0, 6).map((pc) => (
                <div key={pc.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <div>
                    <p className="text-sm text-text-primary">{pc.title}</p>
                    <p className="text-[10px] text-text-muted">
                      {Number(pc.current_value ?? 0).toLocaleString()} / {Number(pc.goal_value ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={pc.is_completed ? 'success' : 'ghost'}>
                    {pc.is_completed ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
