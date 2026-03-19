import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

// ── Achievement Unlock Context ─────────────────────
const AchievementUnlockContext = createContext(null);

export const useAchievementUnlock = () => {
  const context = useContext(AchievementUnlockContext);
  if (!context) throw new Error('useAchievementUnlock must be used within AchievementUnlockProvider');
  return context;
};

// ── Single Unlock Notification ─────────────────────
const UnlockNotification = ({ achievement, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const duration = 5000; // 5 seconds

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(achievement.id), 300);
  };

  return (
    <div
      role="alert"
      onClick={handleDismiss}
      className={`
        relative flex items-center gap-4
        bg-dark-elevated border border-primary/30 rounded-lg-drd
        p-4 min-w-[360px] max-w-[440px]
        shadow-lg-drd overflow-hidden cursor-pointer
        ${isExiting ? 'achievement-exit' : 'achievement-enter'}
      `}
    >
      {/* Glow accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-lg-drd pointer-events-none" />

      {/* Badge emoji with shake + glow */}
      <div className="relative z-10 shrink-0">
        <div className="w-14 h-14 rounded-full bg-dark-card flex items-center justify-center ring-2 ring-primary/40 achievement-badge-glow">
          <span className="text-3xl achievement-badge-shake">{achievement.emoji || '🏆'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-overline text-primary-light uppercase tracking-wider mb-0.5">
          Achievement Unlocked!
        </p>
        <p className="text-sm font-semibold text-text-primary truncate">
          {achievement.name}
        </p>
        {achievement.description && (
          <p className="text-caption text-text-secondary mt-0.5 truncate">
            {achievement.description}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="relative z-10 shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors duration-fast"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark-secondary">
        <div
          className="h-full bg-primary transition-all duration-75 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ── Provider ───────────────────────────────────────
export const AchievementUnlockProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const triggerUnlock = useCallback(({ name, emoji, description } = {}) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, name, emoji, description }]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AchievementUnlockContext.Provider value={{ triggerUnlock }}>
      {children}

      {/* Notification Container — top-right, below toasts */}
      <div className="fixed top-20 right-4 z-[90] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <UnlockNotification achievement={n} onDismiss={dismissNotification} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes achievementSlideIn {
          0% { opacity: 0; transform: translateX(120%); }
          60% { opacity: 1; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes achievementSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(120%); }
        }
        @keyframes badgeShake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(6deg); }
          75% { transform: rotate(-3deg); }
          90% { transform: rotate(1deg); }
        }
        @keyframes badgeGlowPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 24px rgba(124, 58, 237, 0.6); }
        }

        .achievement-enter {
          animation: achievementSlideIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .achievement-exit {
          animation: achievementSlideOut 300ms ease-in forwards;
        }
        .achievement-badge-shake {
          animation: badgeShake 600ms ease-in-out 200ms;
        }
        .achievement-badge-glow {
          animation: badgeGlowPulse 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .achievement-enter,
          .achievement-exit,
          .achievement-badge-shake,
          .achievement-badge-glow {
            animation: none !important;
          }
          .achievement-enter { opacity: 1; }
          .achievement-exit { opacity: 0; }
        }
      `}</style>
    </AchievementUnlockContext.Provider>
  );
};

export default AchievementUnlockProvider;
