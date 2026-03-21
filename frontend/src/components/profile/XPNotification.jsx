import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

/**
 * XPNotification — animated popup when XP is received.
 *
 * DRD §6.7: XP toast — ⚡ lightning icon, `#A78BFA` accent, 3000ms duration.
 * DRD §10.2: XP Notification — Float up from bottom + fadeIn + counter animate.
 *
 * Usage:
 *   <XPNotificationManager />  — place once in app layout
 *   // Then dispatch events via useXPNotification() hook or direct:
 *   window.dispatchEvent(new CustomEvent('xp-awarded', {
 *     detail: { amount: 30, source: 'Quiz Passed' }
 *   }));
 */

// ── Single XP Notification Item ──

const AnimatedCounter = ({ value, duration = 600 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const step = value / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>+{display}</span>;
};

const XPNotificationItem = ({ notification, onDone }) => {
    useEffect(() => {
        const timeout = setTimeout(() => onDone(notification.id), 3000);
        return () => clearTimeout(timeout);
    }, [notification.id, onDone]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
                enter: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                exit: { duration: 0.2, ease: "easeIn" },
            }}
            className="flex items-center gap-3 px-4 py-3 bg-dark-elevated/95 backdrop-blur-sm
                 border border-primary-light/30 rounded-md-drd shadow-lg-drd
                 min-w-[200px] max-w-[300px]"
        >
            {/* Icon */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap size={16} className="text-primary-light" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary-light">
                        <AnimatedCounter value={notification.amount} />
                    </span>
                    <span className="text-sm font-semibold text-primary-light">
                        XP
                    </span>
                </div>
                {notification.source && (
                    <p className="text-[11px] text-text-muted truncate">
                        {notification.source}
                    </p>
                )}
            </div>

            {/* Progress bar auto-dismiss */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light/40 rounded-b-md-drd origin-left"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: "linear" }}
            />
        </motion.div>
    );
};

// ── XP Notification Manager ──

const XPNotificationManager = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { amount, source } = e.detail || {};
            if (!amount) return;
            const id = Date.now() + Math.random();
            setNotifications((prev) => [
                ...prev.slice(-4),
                { id, amount, source },
            ]);
        };

        window.addEventListener("xp-awarded", handler);
        return () => window.removeEventListener("xp-awarded", handler);
    }, []);

    const handleDone = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                    <div key={n.id} className="pointer-events-auto">
                        <XPNotificationItem
                            notification={n}
                            onDone={handleDone}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// ── Helper to dispatch XP notification from anywhere ──

export const dispatchXPNotification = (amount, source) => {
    window.dispatchEvent(
        new CustomEvent("xp-awarded", { detail: { amount, source } }),
    );
};

export default XPNotificationManager;
