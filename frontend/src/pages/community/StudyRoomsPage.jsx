import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    ArrowLeft,
    Clock,
    Plus,
    Users,
    Music,
    X,
    Check,
    Globe,
    Lock,
    Headphones,
    Volume2,
    VolumeX,
    RefreshCw,
} from "lucide-react";
import StudyRoomBrowser from "../../components/social/StudyRoomBrowser";
import StudyRoomView from "../../components/social/StudyRoomView";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useStudyRoomStore } from "../../stores/studyRoomStore";
import { useAuthStore } from "../../stores/authStore";
import useStudyRoomSocket from "../../hooks/useStudyRoomSocket";

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

const MUSIC_OPTIONS = [
    { value: "lofi", label: "Lo-fi", desc: "Chilled focus beats" },
    { value: "classical", label: "Classical", desc: "Structured, calm" },
    { value: "nature", label: "Nature", desc: "Ambient background" },
    { value: "silence", label: "Silence", desc: "No audio" },
];

const QUICK_PRESETS = [
    { label: "Late Night", name: "Late Night Study", desc: "Quiet co-study space", music: "lofi", cap: 10 },
    { label: "Focus", name: "Deep Focus Zone", desc: "Zero distraction session", music: "silence", cap: 6 },
    { label: "Exam Prep", name: "Exam Prep Room", desc: "Intensive preparation", music: "classical", cap: 8 },
];

const StudyRoomsPage = () => {
    const currentUser = useAuthStore((s) => s.user);
    const [roomPhase, setRoomPhase] = useState("browse"); // 'browse' | 'inRoom'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [quickJoinCode, setQuickJoinCode] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");
    const [musicPreset, setMusicPreset] = useState("lofi");
    const [maxCapacity, setMaxCapacity] = useState(10);
    const [isPublic, setIsPublic] = useState(true);
    const [nameError, setNameError] = useState("");

    const {
        publicRooms,
        currentRoom,
        roomMembers,
        pomodoroPhase,
        loading: roomLoading,
        syncingRoom,
        fetchPublicRooms,
        fetchRoom,
        createRoom,
        joinRoom,
        leaveRoom,
        updatePresence,
        sendReaction,
        togglePomodoro,
    } = useStudyRoomStore();

    const [incomingReaction, setIncomingReaction] = useState(null);

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            setNameError("Room name is required.");
            return;
        }
        const room = await createRoom({
            name: roomName.trim(),
            description: roomDescription.trim() || null,
            is_public: isPublic,
            max_capacity: maxCapacity,
            music_preset: musicPreset,
        });
        if (room) {
            closeCreateModal();
            setRoomPhase("inRoom");
        }
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setNameError("");
        setRoomName("");
        setRoomDescription("");
        setMusicPreset("lofi");
        setMaxCapacity(10);
        setIsPublic(true);
    };

    const applyPreset = (p) => {
        setRoomName(p.name);
        setRoomDescription(p.desc);
        setMusicPreset(p.music);
        setMaxCapacity(p.cap);
        setNameError("");
    };

    useEffect(() => {
        fetchPublicRooms();
    }, [fetchPublicRooms]);

    const handleSocketReaction = useCallback((data) => {
        if (data?.emoji) {
            setIncomingReaction({ emoji: data.emoji, user_name: data.user_name, at: Date.now() });
        }
    }, []);

    useStudyRoomSocket(
        currentRoom?.id && roomPhase === "inRoom" ? currentRoom.id : null,
        {
            onReaction: handleSocketReaction,
        },
    );

    useEffect(() => {
        if (roomPhase !== 'inRoom' || !currentRoom?.id) return;

        fetchRoom(currentRoom.id);

        const interval = setInterval(() => {
            fetchRoom(currentRoom.id);
        }, 20000);

        return () => clearInterval(interval);
    }, [roomPhase, currentRoom?.id, fetchRoom]);

    const normalizedRooms = useMemo(
        () => publicRooms.map((room) => ({
            id: room.id,
            name: room.name || room.title || "Study Room",
            host: room.creator?.username || room.host?.username || room.creator?.name || "host",
            members: room.online_members_count || room.current_participants || room.members_count || room.participants?.length || 0,
            max: room.max_capacity || room.max_participants || room.capacity || 10,
            subject: room.subject_category || room.subject || "General",
            music: room.music_preset || room.music_type || room.music || "Lo-fi",
            active: room.status ? room.status !== "closed" : true,
            roomCode: room.room_code,
            participants: (room.online_members_preview || room.participants || []).map((participant) => ({
                id: participant.id,
                name: participant.name || participant.username || 'Member',
                username: participant.username,
                avatar_url: participant.avatar_url,
            })),
            raw: room,
        })),
        [publicRooms],
    );

    const normalizedCurrentRoom = currentRoom ? {
        id: currentRoom.id,
        name: currentRoom.name || currentRoom.title || "Study Room",
        host: currentRoom.creator?.username || currentRoom.host?.username || currentRoom.creator?.name || "host",
        subject: currentRoom.subject_category || currentRoom.subject || "General",
        music: currentRoom.music_preset || currentRoom.music_type || currentRoom.music || "lofi",
        is_host: currentRoom.is_host,
        online_members_count: currentRoom.online_members_count,
        members_count: currentRoom.members_count,
        max_capacity: currentRoom.max_capacity,
        current_pomodoro_phase: currentRoom.current_pomodoro_phase,
        pomodoro_started_at: currentRoom.pomodoro_started_at,
    } : null;

    const normalizedMembers = roomMembers.length > 0
        ? roomMembers.map((member, index) => ({
            id: member.id || index,
            name: member.name || member.username || `Member ${index + 1}`,
            material: member.current_material || "Studying",
            current_material: member.current_material || "Studying",
            joined_at: member.joined_at,
            last_active_at: member.last_active_at,
            is_online: member.is_online ?? true,
            avatar_url: member.avatar_url,
            username: member.username,
            isMe: String(member.id) === String(currentUser?.id),
        }))
        : [];

    const roomStats = {
        totalHours: publicRooms.reduce((acc, room) => acc + (Number(room.total_hours) || 0), 0),
        roomsJoined: publicRooms.filter((room) => room.joined_at || room.is_member).length,
        favMusic: normalizedRooms[0]?.music || "Lo-fi",
        longestSession: pomodoroPhase === "break" ? "5m" : "25m",
    };

    const getMusicIcon = (value, size = 14) => {
        if (value === "silence") return <VolumeX size={size} className="text-text-muted" />;
        if (value === "nature") return <Volume2 size={size} className="text-success" />;
        if (value === "classical") return <Headphones size={size} className="text-secondary" />;
        return <Music size={size} className="text-primary-light" />;
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
                <div className="space-y-4">
                    <Card className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-text-primary">Quick Join Room</p>
                            <p className="text-caption text-text-muted mt-0.5">Masukkan kode room untuk langsung masuk.</p>
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                            <input
                                type="text"
                                value={quickJoinCode}
                                onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                                placeholder="ROOM CODE"
                                maxLength={8}
                                className="flex-1 lg:w-52 bg-dark-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono tracking-widest text-text-primary text-center placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                            <Button
                                variant="secondary"
                                disabled={quickJoinCode.length < 4 || roomLoading}
                                onClick={async () => {
                                    const joined = await joinRoom(quickJoinCode);
                                    if (joined) {
                                        setQuickJoinCode("");
                                        setRoomPhase("inRoom");
                                    }
                                }}
                            >
                                Join
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => fetchPublicRooms(true)}
                                title="Refresh room list"
                            >
                                <RefreshCw size={16} />
                            </Button>
                        </div>
                    </Card>

                    <StudyRoomBrowser
                        rooms={normalizedRooms}
                        onJoin={(room) => {
                            joinRoom(room.roomCode || room.raw?.room_code || room.raw?.code).then((joinedRoom) => {
                                if (joinedRoom) {
                                    setRoomPhase("inRoom");
                                }
                            });
                        }}
                        onCreate={() => setShowCreateModal(true)}
                    />
                </div>
            )}

            {/* In-Room Phase */}
            {roomPhase === "inRoom" && normalizedCurrentRoom && (
                <StudyRoomView
                    room={normalizedCurrentRoom}
                    participants={normalizedMembers}
                    syncing={syncingRoom}
                    incomingReaction={incomingReaction}
                    onSendReaction={(emoji) => currentRoom?.id ? sendReaction(currentRoom.id, emoji) : false}
                    onUpdateStatus={(material) => currentRoom?.id ? updatePresence(currentRoom.id, material) : false}
                    onTogglePomodoro={(phase) => currentRoom?.id ? togglePomodoro(currentRoom.id, phase) : false}
                    onLeave={async () => {
                        if (currentRoom?.id) {
                            await leaveRoom(currentRoom.id);
                        }
                        setRoomPhase("browse");
                        setIncomingReaction(null);
                        fetchPublicRooms();
                    }}
                />
            )}

            {/* Create Room Modal — Enhanced */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeCreateModal}
                title=""
                showClose={false}
                size="md"
            >
                {/* ── Header ── */}
                <div className="-m-6 mb-0 px-5 pt-4 pb-4 rounded-t-[16px] bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border-b border-border relative overflow-hidden shrink-0">
                    {/* Subtle ambient blobs */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/8 rounded-full blur-2xl pointer-events-none" />

                    {/* Close */}
                    <button
                        onClick={closeCreateModal}
                        className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-[6px] transition-colors z-10"
                        aria-label="Close"
                    >
                        <X size={17} />
                    </button>

                    {/* Icon + title */}
                    <div className="flex items-center gap-3 relative">
                        <div className="w-9 h-9 rounded-[10px] bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                            <BookOpen size={18} className="text-primary-light" />
                        </div>
                        <div>
                            <h2 className="text-h4 font-heading text-text-primary leading-tight">Create Study Room</h2>
                            <p className="text-caption text-text-muted mt-0.5">Clean setup, optimized for focus</p>
                        </div>
                    </div>

                    {/* Quick-fill presets */}
                    <div className="mt-3 relative">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-overline text-text-muted mr-0.5">Quick fill:</span>
                            {QUICK_PRESETS.map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => applyPreset(p)}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-dark-secondary/85 border border-border hover:border-primary/50 hover:bg-primary/8 hover:text-primary-light text-text-secondary transition-all whitespace-nowrap"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="pt-4 overflow-y-auto pr-1 space-y-4">

                    {/* SECTION: Room Identity */}
                    <div className="space-y-2.5">
                        <p className="text-overline text-text-muted">ROOM IDENTITY</p>

                        {/* Name + char counter */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-body-sm font-medium text-text-secondary">
                                    Room Name <span className="text-danger">*</span>
                                </label>
                                <span className={`text-caption tabular-nums ${
                                    roomName.length > 65 ? "text-warning" : "text-text-muted"
                                }`}>
                                    {roomName.length}<span className="text-text-muted/50">/80</span>
                                </span>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={roomName}
                                onChange={(e) => { setRoomName(e.target.value); if (nameError) setNameError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                                placeholder="e.g. Late Night Study, CS Focus Room..."
                                maxLength={80}
                                className={`w-full bg-dark-secondary border rounded-[8px] px-3 py-2.5 text-sm text-text-primary focus:outline-none placeholder:text-text-muted transition-colors ${
                                    nameError
                                        ? "border-danger focus:border-danger"
                                        : "border-border focus:border-primary"
                                }`}
                            />
                            {nameError && (
                                <p className="mt-1.5 text-caption text-danger flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 rounded-full bg-danger/20 text-danger text-[9px] flex items-center justify-center font-bold">!</span>
                                    {nameError}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-body-sm font-medium text-text-secondary mb-1.5">
                                Description{" "}
                                <span className="text-text-muted font-normal text-caption">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={roomDescription}
                                onChange={(e) => setRoomDescription(e.target.value)}
                                placeholder="What's the vibe? What are you studying?"
                                maxLength={200}
                                className="w-full bg-dark-secondary border border-border rounded-[8px] px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted transition-colors"
                            />
                        </div>
                    </div>

                    {/* SECTION: Settings */}
                    <div className="space-y-3.5 pt-2 border-t border-border-subtle">
                        <p className="text-overline text-text-muted">SETTINGS</p>

                        {/* Visibility — card toggle */}
                        <div>
                            <label className="block text-body-sm font-medium text-text-secondary mb-2">Visibility</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: true, icon: <Globe size={15} />, label: "Public", desc: "Visible to all users" },
                                    { value: false, icon: <Lock size={15} />, label: "Private", desc: "Invite code required" },
                                ].map((opt) => (
                                    <button
                                        key={String(opt.value)}
                                        type="button"
                                        onClick={() => setIsPublic(opt.value)}
                                        className={`relative flex items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-left transition-all ${
                                            isPublic === opt.value
                                                ? "border-primary bg-primary/8"
                                                : "border-border bg-dark-secondary hover:border-border-hover"
                                        }`}
                                    >
                                        <span className="leading-none text-text-secondary">{opt.icon}</span>
                                        <div>
                                            <p className={`text-xs font-semibold ${
                                                isPublic === opt.value ? "text-primary-light" : "text-text-primary"
                                            }`}>{opt.label}</p>
                                            <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{opt.desc}</p>
                                        </div>
                                        {isPublic === opt.value && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                <Check size={9} strokeWidth={3} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Capacity — range slider */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-body-sm font-medium text-text-secondary">Capacity</label>
                                <div className="flex items-center gap-1.5 bg-dark-secondary border border-border rounded-[6px] px-2.5 py-1">
                                    <Users size={11} className="text-text-muted" />
                                    <span className="text-sm font-semibold text-text-primary font-mono tabular-nums">{maxCapacity}</span>
                                    <span className="text-caption text-text-muted">people</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="20"
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(124,58,237,0.2)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                                style={{
                                    background: `linear-gradient(to right, #7C3AED ${((maxCapacity - 2) / 18) * 100}%, #1A1A2E ${((maxCapacity - 2) / 18) * 100}%)`,
                                }}
                            />
                            <div className="flex justify-between mt-1.5">
                                <span className="text-caption text-text-muted">2</span>
                                <span className="text-caption text-text-muted">20</span>
                            </div>
                        </div>

                        {/* Music vibe cards — 2×2 */}
                        <div>
                            <label className="block text-body-sm font-medium text-text-secondary mb-2">Music Vibe</label>
                            <div className="grid grid-cols-2 gap-2">
                                {MUSIC_OPTIONS.map((m) => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setMusicPreset(m.value)}
                                        className={`relative flex items-center gap-2.5 rounded-[8px] border p-2.5 text-left transition-all ${
                                            musicPreset === m.value
                                                ? "border-primary bg-primary/8"
                                                : "border-border bg-dark-secondary hover:border-border-hover"
                                        }`}
                                    >
                                        <span className="w-7 h-7 rounded-[6px] bg-dark-card border border-border-subtle flex items-center justify-center shrink-0">
                                            {getMusicIcon(m.value, 14)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-semibold truncate ${
                                                musicPreset === m.value ? "text-primary-light" : "text-text-primary"
                                            }`}>{m.label}</p>
                                            <p className="text-[10px] text-text-muted truncate mt-0.5 leading-tight">{m.desc}</p>
                                        </div>
                                        {musicPreset === m.value && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <Check size={9} strokeWidth={3} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border-subtle" />

                    {/* SECTION: Live Preview */}
                    <div>
                        <p className="text-overline text-text-muted mb-2">PREVIEW</p>
                        <div className="rounded-[10px] border border-border bg-dark-card/70 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[8px] bg-dark-secondary flex items-center justify-center shrink-0 relative">
                                <BookOpen size={18} className="text-success" />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-dark-card" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${
                                    roomName ? "text-text-primary" : "text-text-muted italic"
                                }`}>
                                    {roomName || "Your room name will appear here"}
                                </p>
                                <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                                    <span className="text-[11px] text-text-muted flex items-center gap-0.5">
                                        <Users size={10} /> 1/{maxCapacity}
                                    </span>
                                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                                        {isPublic ? <Globe size={10} /> : <Lock size={10} />} {isPublic ? "Public" : "Private"}
                                    </span>
                                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                                        {getMusicIcon(musicPreset, 10)} {MUSIC_OPTIONS.find((m) => m.value === musicPreset)?.label}
                                    </span>
                                </div>
                                {roomDescription && (
                                    <p className="text-[10px] text-text-muted mt-0.5 truncate">{roomDescription}</p>
                                )}
                            </div>
                            <span className="shrink-0 px-2 py-1 rounded text-[10px] font-semibold bg-primary/15 text-primary-light leading-none">
                                Draft
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer actions */}
                <div className="mt-4 pt-3 border-t border-border-subtle shrink-0 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="text-sm text-text-muted hover:text-text-secondary transition-colors px-3 py-2 rounded-[6px] hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <Button
                            disabled={!roomName.trim() || roomLoading}
                            loading={roomLoading}
                            onClick={handleCreateRoom}
                        >
                            <Plus size={16} className="mr-1.5" /> Create Room
                        </Button>
                </div>
            </Modal>
        </div>
    );
};

export default StudyRoomsPage;
