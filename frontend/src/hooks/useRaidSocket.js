import { useEffect } from 'react';
import { refreshEchoAuth } from '../services/reverbService';
import { useSocialStore } from '../stores/socialStore';

/**
 * Subscribe to real-time raid events via Reverb.
 * Listens for: RaidMemberProgress, RaidChatMessage, RaidCompleted
 */
const useRaidSocket = (raidId, { onProgress, onChat, onCompleted } = {}) => {
    const setCurrentRaid = useSocialStore(s => s.setCurrentRaid);

    useEffect(() => {
        if (!raidId) return;

        let channel = null;

        const subscribe = async () => {
            const echo = await refreshEchoAuth();
            if (!echo) return;
            channel = echo.private(`raid.${raidId}`);

            channel.listen('.RaidMemberProgress', (data) => {
                onProgress?.(data);
            });

            channel.listen('.RaidChatMessage', (data) => {
                onChat?.(data);
            });

            channel.listen('.RaidCompleted', (data) => {
                onCompleted?.(data);
                // Auto-update store with completion data
                setCurrentRaid(prev => prev ? { ...prev, status: 'completed', team_score: data.team_score } : prev);
            });
        };

        subscribe();

        return () => {
            if (channel) {
                channel.stopListening('.RaidMemberProgress');
                channel.stopListening('.RaidChatMessage');
                channel.stopListening('.RaidCompleted');
            }
        };
    }, [raidId, onProgress, onChat, onCompleted, setCurrentRaid]);
};

export default useRaidSocket;
