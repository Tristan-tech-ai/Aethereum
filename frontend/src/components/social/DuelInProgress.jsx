import React, { useState, useEffect, useCallback } from 'react';
import { Heart, AlertTriangle, Eye, EyeOff, Clock, Shield, Zap } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';

/**
 * DuelInProgress — split-screen focus duel view per DRD §9.2
 * Simulates real-time opponent updates (would use WebSocket in prod)
 */
const DuelInProgress = ({
  opponent = { name: 'Budi Santoso', level: 24 },
  duration = 25, // minutes
  onComplete,
  className = '',
}) => {
  // ── Player State ──
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [myFocus, setMyFocus] = useState(100);
  const [myHearts, setMyHearts] = useState(3);
  const [myDistractions, setMyDistractions] = useState(0);

  // ── Opponent State (simulated) ──
  const [opFocus, setOpFocus] = useState(100);
  const [opStatus, setOpStatus] = useState('focused'); // 'focused' | 'distracted'
  const [opDistractions, setOpDistractions] = useState(0);
  const [opStatusText, setOpStatusText] = useState('Focused 💪');

  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Timer Countdown ──
  useEffect(() => {
    if (isPaused || isCompleted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          onComplete?.({
            myFocus,
            myHearts,
            myDistractions,
            opFocus,
            opDistractions,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isCompleted]);

  // ── Simulate Opponent Activity ──
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.15) {
        // Opponent gets distracted
        setOpStatus('distracted');
        setOpStatusText('Distracted! 💀');
        setOpDistractions((p) => p + 1);
        setOpFocus((p) => Math.max(0, p - Math.floor(Math.random() * 8 + 3)));
        // Recover after 2-4 seconds
        setTimeout(() => {
          setOpStatus('focused');
          setOpStatusText('Focused 💪');
        }, Math.random() * 2000 + 2000);
      } else {
        setOpFocus((p) => Math.min(100, p + (Math.random() < 0.5 ? 1 : 0)));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // ── Simulate My Focus Tracking (tab focus) ──
  useEffect(() => {
    const handleBlur = () => {
      if (isCompleted) return;
      setMyDistractions((p) => p + 1);
      setMyFocus((p) => Math.max(0, p - 5));
      setMyHearts((p) => Math.max(0, p - 1));
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isCompleted]);

  // Format time
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Central Timer */}
      <div className="text-center py-4">
        <p className="text-overline text-text-muted uppercase tracking-wider mb-1">Focus Duel</p>
        <p className="text-5xl font-mono font-bold text-text-primary tracking-wider">
          {formatTime(timeLeft)}
        </p>
        <div className="w-full max-w-md mx-auto mt-3 h-1.5 bg-dark-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Split Screen — My Side vs Opponent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── My Side ── */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name="You" size="md" />
              <div>
                <p className="text-sm font-semibold text-text-primary">You</p>
                <p className="text-caption text-text-muted">Your Side</p>
              </div>
            </div>

            {/* Focus Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption text-text-muted flex items-center gap-1">
                  <Shield size={12} /> Focus
                </span>
                <span className={`text-sm font-bold ${myFocus >= 80 ? 'text-success' : myFocus >= 50 ? 'text-warning' : 'text-danger'}`}>
                  {myFocus}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    myFocus >= 80 ? 'bg-success' : myFocus >= 50 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${myFocus}%` }}
                />
              </div>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-caption text-text-muted">Hearts:</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    className={`transition-all duration-300 ${
                      i < myHearts
                        ? 'text-danger fill-danger'
                        : 'text-dark-secondary fill-dark-secondary'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Distractions */}
            {myDistractions > 0 && (
              <div className="flex items-center gap-2 text-caption text-warning">
                <AlertTriangle size={12} />
                <span>{myDistractions} distraction{myDistractions > 1 ? 's' : ''} detected</span>
              </div>
            )}
          </div>
        </Card>

        {/* ── Opponent Side ── */}
        <Card className={`relative overflow-hidden transition-all duration-500 ${
          opStatus === 'distracted' ? 'ring-1 ring-danger/30' : ''
        }`}>
          <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            opStatus === 'focused'
              ? 'bg-gradient-to-br from-success/5 to-transparent'
              : 'bg-gradient-to-br from-danger/5 to-transparent'
          }`} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={opponent.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{opponent.name}</p>
                <p className="text-caption text-text-muted">Lv.{opponent.level}</p>
              </div>
            </div>

            {/* Focus Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption text-text-muted flex items-center gap-1">
                  <Shield size={12} /> Focus
                </span>
                <span className={`text-sm font-bold ${opFocus >= 80 ? 'text-success' : opFocus >= 50 ? 'text-warning' : 'text-danger'}`}>
                  {opFocus}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    opFocus >= 80 ? 'bg-success' : opFocus >= 50 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${opFocus}%` }}
                />
              </div>
            </div>

            {/* Opponent Status */}
            <div className={`flex items-center gap-2 mb-3 text-sm font-medium transition-colors duration-300 ${
              opStatus === 'focused' ? 'text-success' : 'text-danger'
            }`}>
              {opStatus === 'focused' ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{opStatusText}</span>
            </div>

            {/* Distraction count */}
            <div className="flex items-center gap-2 text-caption text-text-muted">
              <AlertTriangle size={12} />
              <span>Switched tabs {opDistractions}x</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action hint */}
      <p className="text-center text-caption text-text-muted mt-2">
        💡 Stay focused! Switching tabs will cost you hearts and focus points.
      </p>

      <style>{`
        @keyframes redFlash {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: inset 0 0 30px rgba(239, 68, 68, 0.15); }
        }
      `}</style>
    </div>
  );
};

export default DuelInProgress;
