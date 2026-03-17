import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, X, AlertTriangle, Info, Zap } from 'lucide-react';

// ── Toast Context ──────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

// ── Single Toast Item ──────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const config = {
    success: { icon: Check, color: 'text-success', accent: 'bg-success', duration: 4000 },
    error:   { icon: X, color: 'text-danger', accent: 'bg-danger', duration: 6000 },
    warning: { icon: AlertTriangle, color: 'text-warning', accent: 'bg-warning', duration: 5000 },
    info:    { icon: Info, color: 'text-info', accent: 'bg-info', duration: 4000 },
    xp:     { icon: Zap, color: 'text-primary-light', accent: 'bg-primary-light', duration: 3000 },
  };

  const { icon: Icon, color, accent, duration } = config[toast.type] || config.info;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3
        bg-dark-elevated border border-border rounded-md-drd
        p-4 min-w-[320px] max-w-[420px]
        shadow-lg-drd overflow-hidden
        ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}
      `}
    >
      {/* Accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-l-md-drd`} />

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ml-1 ${color}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-text-primary mb-0.5">{toast.title}</p>
        )}
        <p className="text-body-sm text-text-secondary">{toast.message}</p>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        className="shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors duration-fast"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dark-secondary">
        <div
          className={`h-full ${accent} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ── Toast Provider ─────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Shorthand methods
  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
    xp: (message, title) => addToast({ type: 'xp', message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container — top-right, stacked */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        .animate-slideIn { animation: slideIn 300ms ease-out; }
        .animate-slideOut { animation: slideOut 200ms ease-in forwards; }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
