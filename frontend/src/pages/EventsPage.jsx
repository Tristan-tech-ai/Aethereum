import React, { useEffect, useState } from "react";
import { Clock, Users, Trophy, Zap, Star, Radio, Bell, Target, Award, Flame, Loader2 } from "lucide-react";
import api from "../services/api";

const typeIcons = {
    marathon: Flame,
    quiz: Zap,
    competition: Trophy,
    raid: Target,
    launch: Star,
    ama: Users,
    challenge: Star,
    duel: Trophy,
    relay: Award,
};

const normalizeList = (payload, key) => {
    const data = payload?.data ?? payload;
    const root = key ? (data?.[key] ?? data) : data;
    return Array.isArray(root) ? root : (root?.data ?? []);
};

const EventsPage = () => {
    const [tab, setTab] = useState("upcoming");
    const [loading, setLoading] = useState(true);
    const [liveEvents, setLiveEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const [raidsRes, duelsRes, arenaRes, relayRes, challengeRes] = await Promise.allSettled([
                    api.get('/v1/raids/my'),
                    api.get('/v1/duels/my'),
                    api.get('/v1/arena/my'),
                    api.get('/v1/relay/my'),
                    api.get('/v1/challenges/current'),
                ]);

                const raids = raidsRes.status === 'fulfilled' ? normalizeList(raidsRes.value?.data, 'raids') : [];
                const duels = duelsRes.status === 'fulfilled' ? normalizeList(duelsRes.value?.data, 'duels') : [];
                const arenas = arenaRes.status === 'fulfilled' ? normalizeList(arenaRes.value?.data) : [];
                const relays = relayRes.status === 'fulfilled' ? normalizeList(relayRes.value?.data) : [];
                const challengePayload = challengeRes.status === 'fulfilled' ? (challengeRes.value?.data?.data ?? challengeRes.value?.data) : null;
                const challenge = challengePayload?.challenge ?? null;

                const all = [
                    ...raids.map((r) => ({
                        id: `raid-${r.id}`,
                        title: r.content?.title || 'Study Raid',
                        type: 'raid',
                        status: r.status,
                        participants: r.participants?.length || 0,
                        maxParticipants: r.max_participants || 0,
                        host: r.creator?.name || 'Raid Host',
                        date: r.started_at || r.created_at,
                        rewardXp: Number(r.team_score || 0),
                    })),
                    ...duels.map((d) => ({
                        id: `duel-${d.id}`,
                        title: 'Focus Duel',
                        type: 'duel',
                        status: d.status,
                        participants: 2,
                        maxParticipants: 2,
                        host: d.challenger?.name || 'Duel Host',
                        date: d.started_at || d.created_at,
                        rewardXp: 0,
                    })),
                    ...arenas.map((a) => ({
                        id: `arena-${a.id}`,
                        title: a.content?.title || 'Quiz Arena',
                        type: 'quiz',
                        status: a.status,
                        participants: a.participants?.length || 0,
                        maxParticipants: a.max_players || 0,
                        host: a.host?.name || 'Arena Host',
                        date: a.started_at || a.created_at,
                        rewardXp: 0,
                    })),
                    ...relays.map((r) => ({
                        id: `relay-${r.id}`,
                        title: r.content?.title || 'Learning Relay',
                        type: 'relay',
                        status: r.status,
                        participants: r.participants?.length || 0,
                        maxParticipants: r.max_participants || 0,
                        host: r.creator?.name || 'Relay Host',
                        date: r.created_at,
                        rewardXp: 0,
                    })),
                ];

                if (challenge) {
                    all.push({
                        id: `challenge-${challenge.id}`,
                        title: challenge.title,
                        type: 'challenge',
                        status: challenge.is_completed ? 'completed' : 'active',
                        participants: 0,
                        maxParticipants: null,
                        host: 'Community',
                        date: challenge.starts_at,
                        rewardXp: Number(challenge.reward_coins || 0),
                    });
                }

                const isLiveStatus = new Set(['active']);
                const isUpcomingStatus = new Set(['lobby', 'pending', 'accepted', 'summary', 'quiz']);
                const isPastStatus = new Set(['completed', 'declined', 'expired', 'abandoned', 'closed']);

                setLiveEvents(all.filter((e) => isLiveStatus.has(String(e.status))));
                setUpcomingEvents(all.filter((e) => isUpcomingStatus.has(String(e.status))).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)));
                setPastEvents(all.filter((e) => isPastStatus.has(String(e.status))).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
            } catch {
                setLiveEvents([]);
                setUpcomingEvents([]);
                setPastEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={28} />
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading font-bold text-text-primary">Events</h1>
                    <p className="text-body-sm text-text-secondary mt-1">Join live challenges, competitions, and community activities</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:border-border-hover bg-dark-card text-text-secondary hover:text-text-primary text-sm font-medium transition-all">
                        <Bell size={16} />
                        Notification Settings
                    </button>
                </div>
            </div>

            {liveEvents.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Radio size={16} className="text-danger animate-pulse" />
                        <h2 className="text-sm font-semibold text-text-primary">Live Now</h2>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-danger/15 text-danger">{liveEvents.length} ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {liveEvents.map((event) => {
                            const TypeIcon = typeIcons[event.type] || Star;
                            return (
                                <div key={event.id} className="relative overflow-hidden bg-dark-card border border-danger/30 rounded-xl p-5">
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-danger via-danger/80 to-danger animate-pulse" />
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-danger/10"><TypeIcon size={18} className="text-danger" /></div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary">{event.title}</h3>
                                                <p className="text-[11px] text-text-muted">Hosted by {event.host}</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-danger/15 text-danger text-[10px] font-semibold">LIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-[11px] text-text-muted">
                                            <span className="flex items-center gap-1"><Users size={12} />{event.participants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} />In progress</span>
                                            <span className="flex items-center gap-1"><Zap size={12} className="text-accent" />{event.rewardXp} XP</span>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-danger text-white text-xs font-semibold">Join Now</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-1 p-1 bg-dark-card border border-border/40 rounded-lg w-fit">
                {['upcoming', 'past'].map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${tab === t ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-dark-secondary'}`}>
                        {t === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
                    </button>
                ))}
            </div>

            {tab === 'upcoming' && (
                <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                        <div className="bg-dark-card border border-border/60 rounded-xl p-6 text-center text-sm text-text-muted">No upcoming events.</div>
                    ) : upcomingEvents.map((event) => {
                        const TypeIcon = typeIcons[event.type] || Star;
                        const d = event.date ? new Date(event.date) : null;
                        return (
                            <div key={event.id} className="bg-dark-card border border-border/60 rounded-xl p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="text-center sm:w-16 flex-shrink-0">
                                        <p className="text-[10px] text-text-muted uppercase">{d ? d.toLocaleDateString('en-US', { month: 'short' }) : '—'}</p>
                                        <p className="text-xl font-bold text-text-primary font-heading">{d ? d.getDate() : '—'}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10"><TypeIcon size={16} className="text-primary" /></div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-text-primary">{event.title}</h3>
                                                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5 flex-wrap">
                                                    <span className="flex items-center gap-1"><Clock size={11} />{d ? d.toLocaleString() : 'TBD'}</span>
                                                    <span className="flex items-center gap-1"><Users size={11} />{event.participants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                                                    <span>By {event.host}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between ml-12">
                                            <div className="flex items-center gap-3 text-[11px]">
                                                <span className="flex items-center gap-1 text-accent"><Zap size={12} />{event.rewardXp} XP</span>
                                                <span className="flex items-center gap-1 text-primary-light"><Award size={12} />status: {event.status}</span>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white">View</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'past' && (
                <div className="bg-dark-card border border-border/60 rounded-xl overflow-hidden">
                    <div className="flex items-center px-5 py-3 border-b border-border/40 text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                        <span className="flex-1">Event</span>
                        <span className="w-24 text-center hidden sm:block">Date</span>
                        <span className="w-20 text-center hidden sm:block">Players</span>
                        <span className="w-20 text-center">Status</span>
                        <span className="w-20 text-right">Reward</span>
                    </div>
                    {pastEvents.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-text-muted">No past events yet.</div>
                    ) : pastEvents.map((event) => {
                        const TypeIcon = typeIcons[event.type] || Star;
                        const dateText = event.date ? new Date(event.date).toLocaleDateString() : '—';
                        return (
                            <div key={event.id} className="flex items-center px-5 py-3 border-b border-border/20 hover:bg-dark-secondary/30 transition-colors">
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <TypeIcon size={14} className="text-text-muted flex-shrink-0" />
                                    <span className="text-sm text-text-primary truncate">{event.title}</span>
                                </div>
                                <span className="w-24 text-center text-[11px] text-text-muted hidden sm:block">{dateText}</span>
                                <span className="w-20 text-center text-[11px] text-text-muted hidden sm:block">{event.participants}</span>
                                <span className="w-20 text-center text-sm font-semibold text-primary-light">{event.status}</span>
                                <span className="w-20 text-right text-[11px] font-medium text-success">+{event.rewardXp} XP</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
