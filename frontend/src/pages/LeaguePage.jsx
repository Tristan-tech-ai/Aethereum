import React, { useEffect, useState, useMemo } from "react";
import {
    Trophy,
    Crown,
    Medal,
    ArrowUp,
    ArrowDown,
    Minus,
    Loader2,
    Clock,
    ChevronUp,
    ChevronDown,
    Shield,
} from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

/* ── Tier config (matches public/rank assets) ── */
const TIERS = [
    { key: "Bronze",   image: "/rank/bronze (1).webp",          color: "#CD7F32", bg: "from-amber-900/20 to-amber-800/10",   border: "border-amber-700/40"   },
    { key: "Silver",   image: "/rank/silver (2).webp",          color: "#94A3B8", bg: "from-slate-600/20 to-slate-500/10",   border: "border-slate-500/40"   },
    { key: "Gold",     image: "/rank/gold (3).webp",            color: "#EAB308", bg: "from-yellow-700/20 to-yellow-600/10", border: "border-yellow-600/40"  },
    { key: "Platinum", image: "/rank/platinum (4).webp",        color: "#7DD3FC", bg: "from-sky-700/20 to-sky-600/10",       border: "border-sky-500/40"     },
    { key: "Emerald",  image: "/rank/emerald (5).webp",         color: "#10B981", bg: "from-emerald-700/20 to-emerald-600/10", border: "border-emerald-500/40" },
    { key: "Diamond",  image: "/rank/diamond (tertinggi).webp", color: "#A5B4FC", bg: "from-indigo-700/20 to-indigo-600/10", border: "border-indigo-400/40"  },
];

const tierByKey = Object.fromEntries(TIERS.map(t => [t.key, t]));

/* ── Countdown helper ── */
function useCountdown(endIso) {
    const [left, setLeft] = useState("");
    useEffect(() => {
        if (!endIso) return;
        const tick = () => {
            const diff = new Date(endIso) - Date.now();
            if (diff <= 0) { setLeft("Season ended"); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setLeft(`${d}d ${h}h ${m}m`);
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [endIso]);
    return left;
}

/* ── Zone label helper ── */
function getZone(rank, zones, canPromote, canDemote) {
    if (rank <= zones.promotion && canPromote)
        return { label: "Promotion Zone", icon: ArrowUp, color: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (rank > zones.safe && canDemote)
        return { label: "Demotion Zone", icon: ArrowDown, color: "text-red-400", bg: "bg-red-500/10" };
    return { label: "Safe Zone", icon: Minus, color: "text-blue-400", bg: "bg-blue-500/10" };
}

/* ══════════════════════════════════════════════ */
const LeaguePage = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get("/v1/league")
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const tier = data?.tier ? tierByKey[data.tier] : TIERS[0];
    const countdown = useCountdown(data?.season?.ends_at);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!data?.season) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <Shield size={48} className="mx-auto mb-4 text-text-muted" />
                <h2 className="text-xl font-heading font-bold text-text-primary mb-2">No Active League Season</h2>
                <p className="text-text-secondary text-sm">A new league season will start soon. Keep learning to be ready!</p>
            </div>
        );
    }

    const { standings, my_rank, my_xp, zones, can_promote, can_demote } = data;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ── Header: Tier + Season ── */}
            <div className={`relative overflow-hidden rounded-2xl border ${tier.border} bg-gradient-to-br ${tier.bg} p-6`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 opacity-10">
                    <img src={tier.image} alt={tier.key} className="w-full h-full object-contain" />
                </div>
                <div className="relative flex items-center gap-5">
                    <img
                        src={tier.image}
                        alt={tier.key}
                        className="w-20 h-20 object-contain drop-shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-heading font-extrabold" style={{ color: tier.color }}>
                                {tier.key} League
                            </h1>
                        </div>
                        <p className="text-text-secondary text-sm mb-2">{data.season.name}</p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Clock size={12} /> {countdown}</span>
                            <span>Your rank: <strong className="text-text-primary">#{my_rank ?? "–"}</strong></span>
                            <span>XP earned: <strong className="text-primary-light">{my_xp?.toLocaleString() ?? 0}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Zone indicator */}
                {my_rank && (() => {
                    const z = getZone(my_rank, zones, can_promote, can_demote);
                    return (
                        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${z.bg} ${z.color}`}>
                            <z.icon size={13} />
                            {z.label}
                        </div>
                    );
                })()}
            </div>

            {/* ── Zone legend ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Promote", desc: `Top ${zones.promotion}`, icon: ChevronUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "Stay", desc: `#${zones.promotion + 1} – #${zones.safe}`, icon: Minus, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Demote", desc: `#${zones.safe + 1} – #${zones.demotion}`, icon: ChevronDown, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                ].map(z => (
                    <div key={z.label} className={`rounded-xl border p-3 text-center ${z.bg}`}>
                        <z.icon size={18} className={`mx-auto mb-1 ${z.color}`} />
                        <div className={`text-sm font-semibold ${z.color}`}>{z.label}</div>
                        <div className="text-xs text-text-muted">{z.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── Tier roadmap ── */}
            <div className="flex items-center justify-between gap-1 bg-dark-card border border-border/60 rounded-xl px-4 py-3">
                {TIERS.map((t, i) => (
                    <div key={t.key} className={`flex flex-col items-center gap-1 flex-1 ${t.key === tier.key ? "opacity-100 scale-110" : "opacity-40"} transition-all`}>
                        <img src={t.image} alt={t.key} className="w-8 h-8 object-contain" />
                        <span className="text-[10px] font-medium" style={{ color: t.color }}>{t.key}</span>
                        {t.key === tier.key && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: t.color }} />}
                    </div>
                ))}
            </div>

            {/* ── Standings table ── */}
            <div className="bg-dark-card border border-border/60 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
                    <Trophy size={16} className="text-primary" />
                    <span className="font-heading font-bold text-sm text-text-primary">Standings</span>
                    <span className="text-xs text-text-muted ml-auto">{standings.length} players</span>
                </div>

                <div className="divide-y divide-border/30">
                    {standings.map((entry, i) => {
                        const rank = i + 1;
                        const isMe = entry.user_id === user?.id;
                        const z = getZone(rank, zones, can_promote, can_demote);

                        return (
                            <div
                                key={entry.user_id}
                                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                                    isMe ? "bg-primary/8 border-l-2 border-primary" : "hover:bg-white/[0.02]"
                                }`}
                            >
                                {/* Rank # */}
                                <div className="w-8 text-center shrink-0">
                                    {rank === 1 ? <Crown size={18} className="text-yellow-400 mx-auto" /> :
                                     rank === 2 ? <Medal size={18} className="text-slate-400 mx-auto" /> :
                                     rank === 3 ? <Medal size={18} className="text-amber-600 mx-auto" /> :
                                     <span className="text-sm font-mono font-semibold text-text-muted">{rank}</span>}
                                </div>

                                {/* Avatar */}
                                <img
                                    src={entry.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || "U")}&background=1a1a2e&color=a78bfa&size=32`}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-border/40 shrink-0"
                                />

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm font-medium truncate ${isMe ? "text-primary-light" : "text-text-primary"}`}>
                                            {entry.name || entry.username}
                                        </span>
                                        {isMe && <span className="text-[10px] bg-primary/20 text-primary-light px-1.5 py-0.5 rounded font-mono">YOU</span>}
                                    </div>
                                    <span className="text-xs text-text-muted">Lv. {entry.level}</span>
                                </div>

                                {/* Zone indicator */}
                                <z.icon size={14} className={`shrink-0 ${z.color}`} />

                                {/* XP */}
                                <div className="w-20 text-right shrink-0">
                                    <span className="text-sm font-semibold text-text-primary">{entry.xp_earned?.toLocaleString()}</span>
                                    <span className="text-xs text-text-muted ml-1">XP</span>
                                </div>
                            </div>
                        );
                    })}

                    {standings.length === 0 && (
                        <div className="py-12 text-center text-text-muted text-sm">
                            No players in this block yet. Start learning to join!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaguePage;
