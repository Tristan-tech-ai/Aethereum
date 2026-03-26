import { useEffect } from 'react';
import { refreshEchoAuth } from '../services/reverbService';
import { useFeedStore } from '../stores/feedStore';

/**
 * Subscribe to personal channel for real-time feed updates.
 * Listens for new FeedEvent broadcasts and prepends them to the feed.
 */
const useFeedSocket = (userId) => {
    const prependEvent = useFeedStore(s => s.prependEvent);

    useEffect(() => {
        if (!userId) return;

        let channel = null;
        let disposed = false;

        const subscribe = async () => {
            try {
                const echo = await refreshEchoAuth();
                if (disposed) return;

                channel = echo.private(`user.${userId}`);
                channel.listen('.NewFeedEvent', (data) => {
                    prependEvent(data);
                });
            } catch {
                // Realtime is optional; feed still updates via periodic fetch.
            }
        };

        subscribe();

        return () => {
            disposed = true;
            if (channel) {
                channel.stopListening('.NewFeedEvent');
            }
        };
    }, [userId, prependEvent]);
};

export default useFeedSocket;
