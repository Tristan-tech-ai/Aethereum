import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Trophy, X, PartyPopper } from 'lucide-react';

const ChallengeCompleteContext = createContext(null);

export const useChallengeComplete = () => {
  const ctx = useContext(ChallengeCompleteContext);
  if (!ctx) throw new Error('useChallengeComplete must be inside ChallengeCompleteProvider');
  return ctx;
};

/**
 * ChallengeCompleteBanner — celebration broadcast when goal is reached
 * Slide-down from top, confetti-like animation, auto-dismiss after 8s
 */
const ChallengeCompleteBanner = ({ challenge, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto-dismiss countdown
    const start = Date.now();
    const duration = 8000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss?.();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center pointer-events-none animate-slideDown">
      <div className="w-full max-w-2xl mx-4 mt-4 pointer-events-auto">
        <div className="relative bg-dark-elevated border border-tier-gold/30 rounded-md-drd shadow-2xl overflow-hidden">
          {/* Gold gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-tier-gold/10 via-accent/5 to-tier-gold/10 pointer-events-none" />

          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="confetti-particle absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`,
                  fontSize: `${Math.random() * 8 + 10}px`,
                }}
              >
                {['🎉', '🎊', '✨', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="relative px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tier-gold/20 flex items-center justify-center shrink-0 animate-bounce-subtle">
              <Trophy size={24} className="text-tier-gold" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-tier-gold uppercase tracking-wide mb-0.5">
                🎉 Challenge Complete!
              </p>
              <p className="text-text-primary font-semibold">
                {challenge?.title || 'Weekly Challenge'} — Goal Reached!
              </p>
              <p className="text-caption text-text-secondary mt-0.5">
                The community came together and achieved the goal. Rewards earned! 🏆
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-sm-drd shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Dismiss progress bar */}
          <div className="h-1 bg-dark-secondary">
            <div
              className="h-full bg-tier-gold/60 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes bounceSoft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-bounce-subtle {
          animation: bounceSoft 2s ease-in-out infinite;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        .confetti-particle {
          animation: confettiFall 3s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slideDown { animation: none; }
          .animate-bounce-subtle { animation: none; }
          .confetti-particle { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/**
 * Provider — wrap app to enable triggering challenge complete broadcast
 */
export const ChallengeCompleteProvider = ({ children }) => {
  const [activeChallenge, setActiveChallenge] = useState(null);

  const showComplete = useCallback((challenge) => {
    setActiveChallenge(challenge);
  }, []);

  const dismiss = useCallback(() => {
    setActiveChallenge(null);
  }, []);

  return (
    <ChallengeCompleteContext.Provider value={{ showComplete }}>
      {children}
      {activeChallenge && (
        <ChallengeCompleteBanner challenge={activeChallenge} onDismiss={dismiss} />
      )}
    </ChallengeCompleteContext.Provider>
  );
};

export default ChallengeCompleteBanner;
