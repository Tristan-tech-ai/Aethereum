import { useEffect } from 'react';
import { refreshEchoAuth } from '../services/reverbService';
import { useSocialStore } from '../stores/socialStore';

/**
 * Subscribe to real-time duel events via Reverb.
 * Listens for: OpponentFocusEvent, DuelCompleted
 */
const useDuelSocket = (duelId, { onFocusEvent, onCompleted } = {}) => {
    const setCurrentDuel = useSocialStore(s => s.setCurrentDuel);

    useEffect(() => {
        if (!duelId) return;

        let channel = null;

        const subscribe = async () => {
            const echo = await refreshEchoAuth();
            channel = echo.private(`duel.${duelId}`);

            channel.listen('.OpponentFocusEvent', (data) => {
                onFocusEvent?.(data);
            });

            channel.listen('.DuelCompleted', (data) => {
                onCompleted?.(data);
                setCurrentDuel(prev => prev ? { ...prev, status: 'completed', winner_id: data.winner_id } : prev);
            });
        };

        subscribe();

        return () => {
            if (channel) {
                channel.stopListening('.OpponentFocusEvent');
                channel.stopListening('.DuelCompleted');
            }
        };
    }, [duelId, onFocusEvent, onCompleted, setCurrentDuel]);
};

export default useDuelSocket;
