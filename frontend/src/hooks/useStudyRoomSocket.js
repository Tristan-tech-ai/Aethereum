import { useEffect } from 'react';
import { refreshEchoAuth } from '../services/reverbService';
import { useStudyRoomStore } from '../stores/studyRoomStore';

/**
 * Subscribe to real-time study room events via Reverb (presence channel).
 * Listens for: here, joining, leaving, StudyRoomPresenceUpdate, StudyRoomPomodoro, StudyRoomReaction
 */
const useStudyRoomSocket = (roomId, { onReaction, onPomodoro } = {}) => {
    const setRoomMembers = useStudyRoomStore(s => s.setRoomMembers);
    const updateMember = useStudyRoomStore(s => s.updateMember);
    const setPomodoroPhase = useStudyRoomStore(s => s.setPomodoroPhase);

    useEffect(() => {
        if (!roomId) return;

        let channel = null;

        const subscribe = async () => {
            const echo = await refreshEchoAuth();
            channel = echo.join(`room.${roomId}`);

            // Presence channel built-in events
            channel.here((members) => {
                setRoomMembers(members);
            });

            channel.joining((member) => {
                updateMember(member.id, 'joined', null);
            });

            channel.leaving((member) => {
                updateMember(member.id, 'left', null);
            });

            // Custom broadcast events
            channel.listen('.StudyRoomPresenceUpdate', (data) => {
                updateMember(data.member_id, data.action, data.current_material);
            });

            channel.listen('.StudyRoomPomodoro', (data) => {
                setPomodoroPhase(data.phase, data.duration);
                onPomodoro?.(data);
            });

            channel.listen('.StudyRoomReaction', (data) => {
                onReaction?.(data);
            });
        };

        subscribe();

        return () => {
            if (channel) {
                channel.stopListening('.StudyRoomPresenceUpdate');
                channel.stopListening('.StudyRoomPomodoro');
                channel.stopListening('.StudyRoomReaction');
            }
        };
    }, [roomId, onReaction, onPomodoro, setRoomMembers, updateMember, setPomodoroPhase]);
};

export default useStudyRoomSocket;
