import { useEffect, useCallback } from 'react';
import { refreshEchoAuth } from '../services/reverbService';

/**
 * Subscribe to personal notification channel via Reverb.
 * Listens for: XPAwarded, AchievementUnlocked, StreakAlert, ChallengeGoalReached
 *
 * Dispatches CustomEvents on window so any component can react (e.g. toast).
 */
const useNotifications = (userId) => {
    const dispatch = useCallback((type, detail) => {
        window.dispatchEvent(new CustomEvent(type, { detail }));
    }, []);

    useEffect(() => {
        if (!userId) return;

        let channel = null;
        let disposed = false;

        const subscribe = async () => {
            try {
                const echo = await refreshEchoAuth();
                if (!echo || disposed) return;
                channel = echo.private(`user.${userId}`);

                channel.listen('.XPAwarded', (data) => {
                    dispatch('xp-awarded-sync', data);
                });

                channel.listen('.AchievementUnlocked', (data) => {
                    dispatch('achievement-unlocked', data);
                });

                channel.listen('.StreakAlert', (data) => {
                    dispatch('streak-alert', data);
                });

                channel.listen('.ChallengeGoalReached', (data) => {
                    dispatch('challenge-goal-reached', data);
                });
            } catch {
                // Realtime notifications are optional.
            }
        };

        subscribe();

        return () => {
            disposed = true;
            if (channel) {
                channel.stopListening('.XPAwarded');
                channel.stopListening('.AchievementUnlocked');
                channel.stopListening('.StreakAlert');
                channel.stopListening('.ChallengeGoalReached');
            }
        };
    }, [userId, dispatch]);
};

export default useNotifications;
