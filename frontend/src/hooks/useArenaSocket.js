import { useEffect } from 'react';
import { refreshEchoAuth } from '../services/reverbService';
import { useSocialStore } from '../stores/socialStore';

/**
 * Subscribe to real-time quiz arena events via Reverb.
 * Listens for: ArenaQuestionStart, ArenaScoreUpdate, ArenaCompleted
 */
const useArenaSocket = (arenaId, { onQuestion, onScoreUpdate, onCompleted } = {}) => {
    const setArenaLiveScore = useSocialStore(s => s.setArenaLiveScore);

    useEffect(() => {
        if (!arenaId) return;

        let channel = null;

        const subscribe = async () => {
            const echo = await refreshEchoAuth();
            channel = echo.private(`arena.${arenaId}`);

            channel.listen('.ArenaQuestionStart', (data) => {
                onQuestion?.(data);
            });

            channel.listen('.ArenaScoreUpdate', (data) => {
                setArenaLiveScore(data.scores);
                onScoreUpdate?.(data);
            });

            channel.listen('.ArenaCompleted', (data) => {
                onCompleted?.(data);
            });
        };

        subscribe();

        return () => {
            if (channel) {
                channel.stopListening('.ArenaQuestionStart');
                channel.stopListening('.ArenaScoreUpdate');
                channel.stopListening('.ArenaCompleted');
            }
        };
    }, [arenaId, onQuestion, onScoreUpdate, onCompleted, setArenaLiveScore]);
};

export default useArenaSocket;
