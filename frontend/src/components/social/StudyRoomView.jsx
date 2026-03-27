import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LogOut,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Users,
  Smile,
  Edit3,
  CheckCircle2,
  Globe,
  Crown,
  RefreshCw,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';

const emojiReactions = ['🔥', '❤️', '👍', '👊', '👏'];
const musicPresets = ['lofi', 'classical', 'nature', 'silence'];

const phaseConfig = {
  study: { label: 'Study Phase', emoji: '📚', duration: 1500, color: 'bg-primary/15 text-primary-light' },
  break: { label: 'Break Time', emoji: '☕', duration: 300, color: 'bg-success/15 text-success' },
};

const formatSeconds = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const secondsSince = (iso) => {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
};

const relativeTime = (iso) => {
  if (!iso) return '—';
  const diff = secondsSince(iso);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const FloatingEmoji = ({ emoji, id, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 2500);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const left = Math.random() * 70 + 15;

  return (
    <span
      className="floating-emoji absolute text-2xl pointer-events-none"
      style={{ left: `${left}%`, bottom: '58px', animationDuration: '2.5s' }}
    >
      {emoji}
    </span>
  );
};

const StudyRoomView = ({
  room,
  participants = [],
  syncing = false,
  incomingReaction = null,
  onSendReaction,
  onUpdateStatus,
  onTogglePomodoro,
  onLeave,
  className = '',
}) => {
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const emojiIdRef = useRef(0);
  const [musicMuted, setMusicMuted] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const statusInputRef = useRef(null);

  const me = useMemo(() => participants.find((p) => p.isMe) ?? null, [participants]);
  const [myStatus, setMyStatus] = useState(me?.current_material ?? '');

  const phase = room?.current_pomodoro_phase ?? 'study';
  const phaseMeta = phaseConfig[phase] ?? phaseConfig.study;
  const [remaining, setRemaining] = useState(phaseMeta.duration);

  useEffect(() => {
    setMyStatus(me?.current_material ?? '');
  }, [me?.current_material]);

  useEffect(() => {
    if (editingStatus) statusInputRef.current?.focus();
  }, [editingStatus]);

  useEffect(() => {
    const startedAt = room?.pomodoro_started_at;
    const total = phaseMeta.duration;
    if (!startedAt) {
      setRemaining(total);
      return;
    }

    const tick = () => {
      const elapsed = secondsSince(startedAt);
      setRemaining(Math.max(total - elapsed, 0));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room?.pomodoro_started_at, phase, phaseMeta.duration]);

  useEffect(() => {
    if (!incomingReaction?.emoji) return;
    const id = ++emojiIdRef.current;
    setFloatingEmojis((prev) => [...prev, { id, emoji: incomingReaction.emoji }]);
  }, [incomingReaction]);

  const removeEmoji = (id) => {
    setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
  };

  const sendEmoji = async (emoji) => {
    const id = ++emojiIdRef.current;
    setFloatingEmojis((prev) => [...prev, { id, emoji }]);
    await onSendReaction?.(emoji);
  };

  const saveStatus = async () => {
    setEditingStatus(false);
    const trimmed = myStatus.trim();
    await onUpdateStatus?.(trimmed || null);
  };

  const onlineParticipants = participants.filter((p) => p.is_online);
  const offlineParticipants = participants.filter((p) => !p.is_online);
  const maxCapacity = room?.max_capacity ?? 20;
  const fillPct = Math.min(100, Math.round(((room?.online_members_count ?? onlineParticipants.length) / maxCapacity) * 100));

  const pomodoroProgress = Math.round(((phaseMeta.duration - remaining) / phaseMeta.duration) * 100);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-h3 font-heading text-text-primary flex items-center gap-2">
            📖 {room?.name ?? 'Study Room'}
            {room?.is_host && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-warning/15 text-warning font-semibold">
                <Crown size={11} /> Host
              </span>
            )}
          </h2>
          <p className="text-caption text-text-muted flex items-center gap-2 flex-wrap">
            <span>by @{room?.host ?? room?.creator?.username ?? 'host'}</span>
            <span>•</span>
            <span>{room?.subject ?? room?.subject_category ?? 'General'}</span>
            <span>•</span>
            <span>{room?.online_members_count ?? onlineParticipants.length}/{maxCapacity} online</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncing && <RefreshCw size={14} className="animate-spin text-text-muted" />}
          <Button variant="ghost" size="sm" onClick={onLeave} className="!text-danger hover:!bg-danger/10">
            <LogOut size={14} className="mr-1.5" /> Leave Room
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="text-center py-8 relative overflow-hidden">
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
              phase === 'study'
                ? 'bg-gradient-to-br from-primary/5 via-transparent to-secondary/5'
                : 'bg-gradient-to-br from-success/5 via-transparent to-info/5'
            }`} />

            {floatingEmojis.map((e) => (
              <FloatingEmoji key={e.id} id={e.id} emoji={e.emoji} onComplete={removeEmoji} />
            ))}

            <div className="relative">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption font-semibold mb-4 ${phaseMeta.color}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'study' ? 'bg-primary animate-pulse' : 'bg-success animate-pulse'}`} />
                {phaseMeta.emoji} {phaseMeta.label}
              </div>

              <p className="text-6xl font-mono font-bold text-text-primary tracking-wider mb-4">
                {formatSeconds(remaining)}
              </p>

              <div className="w-full max-w-sm mx-auto h-1.5 bg-dark-secondary rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    phase === 'study'
                      ? 'bg-gradient-to-r from-primary to-secondary'
                      : 'bg-gradient-to-r from-success to-info'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, pomodoroProgress))}%` }}
                />
              </div>

              <div className="flex justify-center items-center gap-2">
                {room?.is_host && (
                  <button
                    onClick={() => onTogglePomodoro?.(phase === 'study' ? 'break' : 'study')}
                    className="p-3 rounded-full bg-dark-secondary hover:bg-dark-card border border-border text-text-primary transition-colors"
                    title="Toggle pomodoro phase"
                  >
                    {phase === 'study' ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                )}
                {!room?.is_host && (
                  <span className="text-xs text-text-muted">Host controls pomodoro phase</span>
                )}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Smile size={14} className="text-text-muted mr-1" />
              {emojiReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendEmoji(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-lg rounded-sm-drd hover:bg-white/[0.05] transition-colors active:scale-90"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Music size={14} className="text-text-muted" />
              <div className="flex gap-1">
                {musicPresets.map((preset) => (
                  <span
                    key={preset}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-sm-drd ${
                      room?.music === preset || room?.music_preset === preset
                        ? 'bg-primary/15 text-primary-light'
                        : 'text-text-muted'
                    }`}
                  >
                    {preset}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setMusicMuted(!musicMuted)}
                className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-sm-drd hover:bg-white/5"
              >
                {musicMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-dark-card border border-border-subtle rounded-sm-drd px-4 py-2.5">
            <span className="text-caption text-text-muted whitespace-nowrap">My status:</span>
            {editingStatus ? (
              <input
                ref={statusInputRef}
                type="text"
                value={myStatus}
                onChange={(e) => setMyStatus(e.target.value)}
                onBlur={saveStatus}
                onKeyDown={(e) => e.key === 'Enter' && saveStatus()}
                className="flex-1 bg-transparent text-sm text-text-primary border-none outline-none"
                placeholder="Currently studying..."
              />
            ) : (
              <button
                onClick={() => setEditingStatus(true)}
                className="flex-1 text-left text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                📖 {myStatus || 'Set your current material...'}
                <Edit3 size={12} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Users size={14} className="text-text-muted" />
              Room Monitor
            </h3>
            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Online</span>
                <span className="text-success font-semibold">{room?.online_members_count ?? onlineParticipants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Members</span>
                <span className="text-text-primary font-semibold">{room?.members_count ?? participants.length}</span>
              </div>
              <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-primary" style={{ width: `${fillPct}%` }} />
              </div>
              <p className="text-[10px]">Capacity {room?.online_members_count ?? onlineParticipants.length}/{maxCapacity}</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Users size={14} className="text-text-muted" />
              Participants
              <span className="text-caption text-text-muted font-normal">({participants.length})</span>
            </h3>

            <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {onlineParticipants.map((p) => (
                <div key={p.id} className={`flex items-center gap-3 px-2 py-2 rounded-sm-drd ${p.isMe ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-white/[0.02]'}`}>
                  <Avatar name={p.name} src={p.avatar_url} size="sm" online={p.is_online} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {p.name} {p.isMe && <span className="text-caption text-primary-light">(you)</span>}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">📖 {p.current_material || 'Studying'}</p>
                    <p className="text-[10px] text-text-disabled">Joined {relativeTime(p.joined_at)}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-semibold">Online</span>
                </div>
              ))}

              {offlineParticipants.length > 0 && (
                <div className="pt-3 mt-2 border-t border-border-subtle">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Offline</p>
                  <div className="space-y-1">
                    {offlineParticipants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 px-2 py-2 rounded-sm-drd opacity-70">
                        <Avatar name={p.name} src={p.avatar_url} size="sm" online={false} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-secondary font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-text-disabled">Last active {relativeTime(p.last_active_at)}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-secondary text-text-muted">Away</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .floating-emoji {
          animation: floatUp 2.5s ease-out forwards;
          z-index: 20;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-70px) scale(1.15); opacity: 0.85; }
          100% { transform: translateY(-140px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StudyRoomView;
