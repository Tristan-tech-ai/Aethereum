import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Music, Volume2, VolumeX, Play, Pause, Clock, Users, Smile, Edit3 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Demo participants
const demoParticipants = [
  { id: 1, name: 'Andi Pratama', material: 'Data Structures', timer: '18:42', online: true },
  { id: 2, name: 'Budi Santoso', material: 'Algorithm Design', timer: '22:05', online: true },
  { id: 3, name: 'Siti Rahma', material: 'Organic Chemistry', timer: '11:33', online: true },
  { id: 4, name: 'Maya Putri', material: 'Calculus II', timer: '05:17', online: true },
  { id: 5, name: 'You', material: 'React Patterns', timer: '00:00', online: true, isMe: true },
];

const emojiReactions = ['🔥', '❤️', '👍', '👊'];
const musicPresets = ['Lo-fi', 'Classical', 'Nature', 'Silence'];

/**
 * Floating emoji component
 */
const FloatingEmoji = ({ emoji, id, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const left = Math.random() * 70 + 15; // 15-85%
  const animDuration = Math.random() * 1 + 2.5; // 2.5-3.5s

  return (
    <span
      className="floating-emoji absolute text-2xl pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: '60px',
        animationDuration: `${animDuration}s`,
      }}
    >
      {emoji}
    </span>
  );
};

/**
 * StudyRoomView — the active study room experience per DRD §9.4
 * Ambient dark UI with calming aesthetic
 */
const StudyRoomView = ({
  room = { name: 'Late Night Study', host: 'Community', subject: 'General', music: 'Lo-fi' },
  participants = demoParticipants,
  onLeave,
  className = '',
}) => {
  // ── Pomodoro Timer ──
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 min study
  const [pomodoroPhase, setPomodoroPhase] = useState('study'); // 'study' | 'break'
  const [pomodoroRunning, setPomodoroRunning] = useState(true);

  // ── Music ──
  const [currentMusic, setCurrentMusic] = useState(room.music || 'Lo-fi');
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [musicMuted, setMusicMuted] = useState(false);

  // ── Emoji reactions ──
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const emojiIdRef = useRef(0);

  // ── Status ──
  const [myStatus, setMyStatus] = useState('React Patterns');
  const [editingStatus, setEditingStatus] = useState(false);
  const statusInputRef = useRef(null);

  // ── Pomodoro Countdown ──
  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (pomodoroPhase === 'study') {
            setPomodoroPhase('break');
            return 5 * 60; // 5 min break
          } else {
            setPomodoroPhase('study');
            return 25 * 60; // 25 min study
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroPhase]);

  // Format time
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Emoji Handlers ──
  const sendEmoji = useCallback((emoji) => {
    const id = ++emojiIdRef.current;
    setFloatingEmojis((prev) => [...prev, { id, emoji }]);
  }, []);

  const removeEmoji = useCallback((id) => {
    setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Simulate incoming emoji reactions ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const emoji = emojiReactions[Math.floor(Math.random() * emojiReactions.length)];
        sendEmoji(emoji);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sendEmoji]);

  // Focus status input on edit
  useEffect(() => {
    if (editingStatus) statusInputRef.current?.focus();
  }, [editingStatus]);

  const pomodoroProgress = pomodoroPhase === 'study'
    ? ((25 * 60 - pomodoroTime) / (25 * 60)) * 100
    : ((5 * 60 - pomodoroTime) / (5 * 60)) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Room Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 font-heading text-text-primary flex items-center gap-2">
            📖 {room.name}
          </h2>
          <p className="text-caption text-text-muted">
            by @{room.host} · {room.subject} · {participants.length} people
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLeave} className="!text-danger hover:!bg-danger/10">
          <LogOut size={14} className="mr-1.5" /> Leave Room
        </Button>
      </div>

      {/* Main Layout: Pomodoro + Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left: Pomodoro + Music ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Shared Pomodoro Timer */}
          <Card className="text-center py-8 relative overflow-hidden">
            {/* Ambient gradient */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
              pomodoroPhase === 'study'
                ? 'bg-gradient-to-br from-primary/5 via-transparent to-secondary/5'
                : 'bg-gradient-to-br from-success/5 via-transparent to-info/5'
            }`} />

            {/* Floating emojis */}
            {floatingEmojis.map((e) => (
              <FloatingEmoji key={e.id} id={e.id} emoji={e.emoji} onComplete={removeEmoji} />
            ))}

            <div className="relative">
              {/* Phase Indicator */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption font-semibold mb-4 ${
                pomodoroPhase === 'study'
                  ? 'bg-primary/15 text-primary-light'
                  : 'bg-success/15 text-success'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  pomodoroPhase === 'study' ? 'bg-primary animate-pulse' : 'bg-success animate-pulse'
                }`} />
                {pomodoroPhase === 'study' ? '📚 Study Phase' : '☕ Break Time'}
              </div>

              {/* Timer */}
              <p className="text-6xl font-mono font-bold text-text-primary tracking-wider mb-4">
                {formatTime(pomodoroTime)}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-sm mx-auto h-1.5 bg-dark-secondary rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    pomodoroPhase === 'study'
                      ? 'bg-gradient-to-r from-primary to-secondary'
                      : 'bg-gradient-to-r from-success to-info'
                  }`}
                  style={{ width: `${pomodoroProgress}%` }}
                />
              </div>

              {/* Controls */}
              <button
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className="p-3 rounded-full bg-dark-secondary hover:bg-dark-card border border-border text-text-primary transition-colors"
              >
                {pomodoroRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </Card>

          {/* Emoji Reaction Bar + Music */}
          <div className="flex items-center justify-between">
            {/* Emoji Reactions */}
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

            {/* Music Controls */}
            <div className="flex items-center gap-2">
              <Music size={14} className="text-text-muted" />
              <div className="flex gap-1">
                {musicPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCurrentMusic(preset)}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-sm-drd transition-colors ${
                      currentMusic === preset
                        ? 'bg-primary/15 text-primary-light'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {preset}
                  </button>
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

          {/* My Status Update */}
          <div className="flex items-center gap-3 bg-dark-card border border-border-subtle rounded-sm-drd px-4 py-2.5">
            <span className="text-caption text-text-muted whitespace-nowrap">My status:</span>
            {editingStatus ? (
              <input
                ref={statusInputRef}
                type="text"
                value={myStatus}
                onChange={(e) => setMyStatus(e.target.value)}
                onBlur={() => setEditingStatus(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingStatus(false)}
                className="flex-1 bg-transparent text-sm text-text-primary border-none outline-none"
                placeholder="Currently studying..."
              />
            ) : (
              <button
                onClick={() => setEditingStatus(true)}
                className="flex-1 text-left text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                📖 {myStatus || 'Set your status...'}
                <Edit3 size={12} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Participant List ── */}
        <div>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Users size={14} className="text-text-muted" />
              Participants
              <span className="text-caption text-text-muted font-normal">({participants.length})</span>
            </h3>

            <div className="space-y-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-2 py-2 rounded-sm-drd transition-colors ${
                    p.isMe ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <Avatar name={p.name} size="sm" online={p.online} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {p.name} {p.isMe && <span className="text-caption text-primary-light">(you)</span>}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">📖 {p.material}</p>
                  </div>
                  <span className="text-caption text-text-muted font-mono shrink-0 flex items-center gap-1">
                    <Clock size={10} /> {p.timer}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating emoji animation styles */}
      <style>{`
        .floating-emoji {
          animation: floatUp var(--float-duration, 3s) ease-out forwards;
          z-index: 20;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-80px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-160px) scale(0.8); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-emoji { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StudyRoomView;
