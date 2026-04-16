import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    ArrowLeft,
    Clock,
    Users,
    Music,
} from "lucide-react";
import StudyRoomBrowser from "../../components/social/StudyRoomBrowser";
import StudyRoomView from "../../components/social/StudyRoomView";
import { useStudyRoomStore } from "../../stores/studyRoomStore";
import useStudyRoomSocket from "../../hooks/useStudyRoomSocket";

/* ═══════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════ */

const myStats = {
    totalHours: 14,
    roomsJoined: 9,
    favMusic: "Lo-fi",
    longestSession: "2h 30m",
};

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

const StudyRoomsPage = () => {
    const [roomPhase, setRoomPhase] = useState("browse"); // 'browse' | 'inRoom'

    const {
        publicRooms,
        currentRoom,
        roomMembers,
        pomodoroPhase,
        loading,
        fetchPublicRooms,
        createRoom,
        joinRoom,
        leaveRoom,
    } = useStudyRoomStore();

    useEffect(() => {
        fetchPublicRooms();
    }, [fetchPublicRooms]);

    useStudyRoomSocket(
        currentRoom?.id && roomPhase === "inRoom" ? currentRoom.id : null,
        {},
    );

    const normalizedRooms = useMemo(
        () => publicRooms.map((room) => ({
            id: room.id,
            name: room.name || room.title || "Study Room",
            host: room.creator?.username || room.host?.username || room.creator?.name || "host",
            members: room.participants_count || room.current_participants || room.members_count || room.participants?.length || 0,
            max: room.max_participants || room.capacity || 10,
            subject: room.subject_category || room.subject || "General",
            music: room.music_type || room.music || "Lo-fi",
            active: room.status ? room.status !== "closed" : true,
            roomCode: room.room_code,
            participants: (room.participants || []).map((participant) => participant.name || participant.username || "Member"),
            raw: room,
        })),
        [publicRooms],
    );

    const normalizedCurrentRoom = currentRoom ? {
        name: currentRoom.name || currentRoom.title || "Study Room",
        host: currentRoom.creator?.username || currentRoom.host?.username || currentRoom.creator?.name || "host",
        subject: currentRoom.subject_category || currentRoom.subject || "General",
        music: currentRoom.music_type || currentRoom.music || "Lo-fi",
    } : null;

    const normalizedMembers = roomMembers.length > 0
        ? roomMembers.map((member, index) => ({
            id: member.id || index,
            name: member.name || member.username || `Member ${index + 1}`,
            material: member.current_material || "Studying",
            timer: "00:00",
            online: member.is_online ?? true,
            isMe: false,
        }))
        : [{ id: "me", name: "You", material: "Studying", timer: "00:00", online: true, isMe: true }];

    const roomStats = {
        totalHours: publicRooms.reduce((acc, room) => acc + (Number(room.total_hours) || 0), 0),
        roomsJoined: publicRooms.filter((room) => room.joined_at || room.is_member).length,
        favMusic: normalizedRooms[0]?.music || "Lo-fi",
        longestSession: pomodoroPhase === "break" ? "5m" : "25m",
    };

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
            {/* Back + Header */}
            <div className="mb-6">
                <Link
                    to="/community"
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-3"
                >
                    <ArrowLeft size={14} /> Back to Community
                </Link>
                <div>
                    <h1 className="text-h2 font-heading text-text-primary flex items-center gap-2">
                        <BookOpen size={24} className="text-success" />
                        Study Rooms
                    </h1>
                    <p className="text-body-sm text-text-secondary">
                        Ruang belajar virtual — belajar bareng dalam "hening yang nyaman"
                    </p>
                </div>
            </div>

            {/* Stats (only in browse) */}
            {roomPhase === "browse" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Clock size={16} className="mx-auto text-primary-light mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{roomStats.totalHours}h</p>
                        <p className="text-[10px] text-text-muted">Study Room Hours</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Users size={16} className="mx-auto text-success mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{roomStats.roomsJoined}</p>
                        <p className="text-[10px] text-text-muted">Rooms Joined</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Music size={16} className="mx-auto text-accent mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{roomStats.favMusic}</p>
                        <p className="text-[10px] text-text-muted">Fav Music</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <BookOpen size={16} className="mx-auto text-secondary mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{roomStats.longestSession}</p>
                        <p className="text-[10px] text-text-muted">Longest Session</p>
                    </div>
                </div>
            )}

            {/* Browse Phase */}
            {roomPhase === "browse" && (
                <StudyRoomBrowser
                    rooms={normalizedRooms}
                    onJoin={(room) => {
                        joinRoom(room.roomCode || room.raw?.room_code || room.raw?.code).then((joinedRoom) => {
                            if (joinedRoom) {
                                setRoomPhase("inRoom");
                            }
                        });
                    }}
                    onCreate={async () => {
                        const room = await createRoom({});
                        if (room) {
                            setRoomPhase("inRoom");
                        }
                    }}
                />
            )}

            {/* In-Room Phase */}
            {roomPhase === "inRoom" && normalizedCurrentRoom && (
                <StudyRoomView
                    room={normalizedCurrentRoom}
                    participants={normalizedMembers}
                    onLeave={async () => {
                        if (currentRoom?.id) {
                            await leaveRoom(currentRoom.id);
                        }
                        setRoomPhase("browse");
                        fetchPublicRooms();
                    }}
                />
            )}
        </div>
    );
};

export default StudyRoomsPage;
