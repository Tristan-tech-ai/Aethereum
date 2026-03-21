import { useEffect, useRef } from "react";
import { useContentStore } from "../stores/contentStore";

/**
 * useContentPolling — automatically polls content status every 3 seconds
 * for items with status === 'processing'. Cleans up on unmount.
 *
 * Usage:
 *   useContentPolling(contents);
 *   // or for a single item:
 *   useContentPolling(content ? [content] : []);
 */
const useContentPolling = (contents = []) => {
    const startPolling = useContentStore((s) => s.startPolling);
    const stopAllPolling = useContentStore((s) => s.stopAllPolling);
    const tracked = useRef(new Set());

    useEffect(() => {
        const processingItems = contents.filter(
            (c) => c?.status === "processing",
        );

        processingItems.forEach((c) => {
            if (!tracked.current.has(c.id)) {
                tracked.current.add(c.id);
                startPolling(c.id);
            }
        });

        // Stop polling for items no longer processing
        const processingIds = new Set(processingItems.map((c) => c.id));
        tracked.current.forEach((id) => {
            if (!processingIds.has(id)) {
                tracked.current.delete(id);
            }
        });
    }, [contents, startPolling]);

    // Cleanup all polling on unmount
    useEffect(() => {
        return () => {
            stopAllPolling();
            tracked.current.clear();
        };
    }, [stopAllPolling]);
};

export default useContentPolling;
