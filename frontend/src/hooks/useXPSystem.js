import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import {
    xpForLevel,
    xpToNextLevel,
    levelFromXP,
    getRank,
} from "../components/profile/LevelBadge";
import { dispatchXPNotification } from "../components/profile/XPNotification";

/**
 * useXPSystem — real-time XP tracking with optimistic updates.
 *
 * PRD §5.2: XP sources, formula XP_needed(level) = round(100 * level^1.5), level 1–100.
 * PRD §5.3: Rank system (6 ranks), rank-up celebration.
 *
 * Provides:
 *   - Current level, rank, XP progress derived from user state
 *   - awardXP(amount, source) — optimistic local update + notification
 *   - fetchXPHistory(days) — load XP event log
 *   - xpHistory — loaded XP events
 *   - Listens for 'xp-awarded-sync' events (from session completion, etc.)
 *
 * Usage:
 *   const { level, rank, currentXP, nextLevelXP, progress, xpHistory, ... } = useXPSystem();
 */

const useXPSystem = () => {
    const user = useAuthStore((s) => s.user);
    const syncUser = useAuthStore((s) => s.syncUser);

    // Local optimistic state (overrides user.xp until next sync)
    const [localXP, setLocalXP] = useState(null);
    const [xpHistory, setXPHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const pendingSync = useRef(false);

    // Derive XP values — use local override or user data
    const totalXP = localXP ?? user?.xp ?? 0;
    const { level, currentXP, nextLevelXP } = levelFromXP(totalXP);
    const rank = getRank(level);
    const progress =
        nextLevelXP > 0 ? Math.min((currentXP / nextLevelXP) * 100, 100) : 0;

    // Reset local override when user data changes (after backend sync)
    useEffect(() => {
        if (user?.xp != null && !pendingSync.current) {
            setLocalXP(null);
        }
    }, [user?.xp]);

    /**
     * Award XP — optimistic update + UI notification.
     * Does NOT call backend (backend awards XP during session/action).
     * This is purely for UI responsiveness.
     */
    const awardXP = useCallback(
        (amount, source = "") => {
            if (!amount || amount <= 0) return;

            setLocalXP((prev) => {
                const current = prev ?? user?.xp ?? 0;
                const newTotal = current + amount;

                // Check level up
                const oldInfo = levelFromXP(current);
                const newInfo = levelFromXP(newTotal);

                // Dispatch XP notification
                dispatchXPNotification(amount, source);

                // Check level up
                if (newInfo.level > oldInfo.level) {
                    const oldRank = getRank(oldInfo.level);
                    const newRank = getRank(newInfo.level);

                    // Small delay so XP notification shows first
                    setTimeout(() => {
                        window.dispatchEvent(
                            new CustomEvent("level-up", {
                                detail: {
                                    newLevel: newInfo.level,
                                    oldLevel: oldInfo.level,
                                    oldRank: oldRank.key,
                                    newRank: newRank.key,
                                },
                            }),
                        );
                    }, 1500);
                }

                return newTotal;
            });

            // Mark pending sync — will be cleared when user data refreshes
            pendingSync.current = true;
            // Sync with backend after a short delay
            setTimeout(() => {
                pendingSync.current = false;
                syncUser?.();
            }, 3000);
        },
        [user?.xp, syncUser],
    );

    /**
     * Fetch XP event history from backend.
     * Falls back to empty array if API not available.
     */
    const fetchXPHistory = useCallback(async (days = 30) => {
        setHistoryLoading(true);
        try {
            const response = await api.get("/v1/profile/me/xp-history", {
                params: { days },
            });
            const data = response.data.data ?? response.data;
            setXPHistory(Array.isArray(data) ? data : []);
        } catch {
            // API might not exist yet — set empty
            setXPHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    /**
     * Listen for external XP award events (dispatched from sessionStore, etc.)
     */
    useEffect(() => {
        const handler = (e) => {
            const { amount, source } = e.detail || {};
            if (amount > 0) {
                awardXP(amount, source);
            }
        };

        window.addEventListener("xp-awarded-sync", handler);
        return () => window.removeEventListener("xp-awarded-sync", handler);
    }, [awardXP]);

    return {
        // Current state
        totalXP,
        level,
        currentXP,
        nextLevelXP,
        progress,
        rank,

        // Actions
        awardXP,
        fetchXPHistory,

        // History
        xpHistory,
        historyLoading,

        // Utilities (re-export for convenience)
        xpForLevel,
        xpToNextLevel,
        levelFromXP,
        getRank,
    };
};

export default useXPSystem;
