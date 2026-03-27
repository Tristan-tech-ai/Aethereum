import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, Brain, Calendar, FileText, Trophy, Award, Target, Eye, Layers, GraduationCap, Loader2 } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, BarChart, Bar } from "recharts";
import api from "../services/api";
import Card from "../components/ui/Card";
import LearningHeatmap from "../components/profile/LearningHeatmap";

const REPORT_CACHE = {};
const CACHE_TTL = 60000;

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-dark-elevated border border-border-subtle rounded-md-drd p-3 shadow-lg-drd min-w-[150px]">
            <p className="text-caption text-text-muted mb-1.5 font-medium">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-body-sm text-text-secondary flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                    </span>
                    <span className="text-body-sm font-semibold text-text-primary">{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const HeatmapSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <div className="h-5 w-40 bg-dark-secondary rounded" />
                <div className="h-3 w-32 bg-dark-secondary rounded mt-2" />
            </div>
            <div className="h-8 w-28 bg-dark-secondary rounded-full" />
        </div>
        <div className="h-[120px] bg-dark-secondary rounded" />
        <div className="h-4 w-48 bg-dark-secondary rounded" />
    </div>
);

const ReportPage = () => {
    const [period, setPeriod] = useState("30d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [heatmapLoading, setHeatmapLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setHeatmapLoading(true);

        api.get('/v1/profile/me/heatmap').then((res) => {
            if (!active) return;
            const map = res.data?.data?.heatmap;
            if (map) {
                setHeatmapData(
                    Object.entries(map).map(([date, value]) => ({
                        date,
                        sessions: Number(value.count ?? 0),
                        minutes: Number(value.minutes ?? 0),
                    }))
                );
            } else {
                setHeatmapData([]);
            }
        }).catch(() => {
            if (!active) return;
            setHeatmapData([]);
        }).finally(() => {
            if (!active) return;
            setHeatmapLoading(false);
        });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const cached = REPORT_CACHE[period];
            const isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL);
            
            if (cached) {
                setData(cached.data);
                if (isFresh) {
                    setLoading(false);
                    return;
                }
            }

            if (!cached) setLoading(true);
            try {
                const res = await api.get('/v1/reports/learning', { params: { period } });
                const d = res.data?.data ?? res.data;
                REPORT_CACHE[period] = { data: d, timestamp: Date.now() };
                setData(d);
            } catch {
                if (!cached) setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const stats = data?.stats ?? {};
    const subjectMastery = data?.subject_mastery ?? [];
    const skillRadar = data?.skill_radar ?? [];
    const quizTrend = data?.quiz_trend ?? [];
    const cardTiers = data?.card_tiers ?? [];
    const monthlyComparison = data?.monthly_comparison ?? [];
    const focusDistribution = data?.focus_distribution ?? [];
    const sessionLog = data?.session_log ?? [];
    const milestones = data?.milestones ?? [];

    const totalCardsByTier = useMemo(() => cardTiers.reduce((s, t) => s + Number(t.count ?? 0), 0), [cardTiers]);
    const highFocusSessions = useMemo(() => {
        const a = Number(focusDistribution.find((f) => f.range === '90-100%')?.count ?? 0);
        const b = Number(focusDistribution.find((f) => f.range === '80-89%')?.count ?? 0);
        const total = focusDistribution.reduce((s, d) => s + Number(d.count ?? 0), 0);
        return { high: a + b, total };
    }, [focusDistribution]);

    if (loading) {
        return <div className="px-4 lg:px-8 py-6 max-w-page mx-auto min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
    }

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading text-text-primary flex items-center gap-2"><BarChart3 size={24} className="text-primary" />Learning Report</h1>
                    <p className="text-body-sm text-text-secondary mt-1">Deep analytics on your learning patterns and knowledge mastery</p>
                </div>
                <div className="flex gap-1 bg-dark-secondary p-1 rounded-lg border border-border-subtle">
                    {["7d", "30d", "90d"].map((p) => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-fast ${period === p ? "bg-primary text-white shadow-glow-primary" : "text-text-muted hover:text-text-primary"}`}>
                            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><div className="flex items-start gap-3"><div className="p-2.5 rounded-lg bg-warning/15"><Trophy size={18} className="text-warning" /></div><div><p className="text-caption text-text-muted">Quizzes Passed</p><p className="text-h3 font-bold text-text-primary">{Number(stats.total_quizzes ?? 0)}</p><p className="text-[11px] text-text-muted">avg score {Number(stats.avg_quiz_score ?? 0)}%</p></div></div></Card>
                <Card><div className="flex items-start gap-3"><div className="p-2.5 rounded-lg bg-success/15"><Eye size={18} className="text-success" /></div><div><p className="text-caption text-text-muted">Avg Focus Score</p><p className="text-h3 font-bold text-text-primary">{Number(stats.avg_focus ?? 0)}%</p><p className="text-[11px] text-text-muted">live from sessions</p></div></div></Card>
                <Card><div className="flex items-start gap-3"><div className="p-2.5 rounded-lg bg-info/15"><Layers size={18} className="text-info" /></div><div><p className="text-caption text-text-muted">Materials Done</p><p className="text-h3 font-bold text-text-primary">{Number(stats.materials_completed ?? 0)}</p><p className="text-[11px] text-text-muted">{subjectMastery.length} subjects</p></div></div></Card>
                <Card><div className="flex items-start gap-3"><div className="p-2.5 rounded-lg bg-primary/15"><Award size={18} className="text-primary-light" /></div><div><p className="text-caption text-text-muted">Knowledge Cards</p><p className="text-h3 font-bold text-text-primary">{Number(stats.total_cards ?? 0)}</p><p className="text-[11px] text-text-muted">{Number(cardTiers.find((t) => String(t.tier).toLowerCase() === 'diamond')?.count ?? 0)} diamonds</p></div></div></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><GraduationCap size={16} className="text-accent" /> Subject Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-52 w-52 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                                <PieChart><Pie data={subjectMastery} dataKey="hours" nameKey="subject" cx="50%" cy="50%" innerRadius={45} outerRadius={75} strokeWidth={2} stroke="rgba(0,0,0,0.3)">{subjectMastery.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            {subjectMastery.map((s, i) => (
                                <div key={i} className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} /><span className="text-body-sm text-text-secondary flex-1 truncate">{s.subject}</span><span className="text-body-sm font-semibold text-text-primary">{s.mastery}%</span><span className="text-caption text-text-muted w-10 text-right">{s.hours}h</span></div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Brain size={16} className="text-primary-light" /> Competency Radar</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <RadarChart data={skillRadar} outerRadius="70%"><PolarGrid stroke="rgba(255,255,255,0.08)" /><PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} /><Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: "#7C3AED" }} /><Tooltip content={<ChartTooltip />} /></RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card padding="spacious">
                <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Calendar size={16} className="text-success" /> Study Consistency</h3>
                {heatmapLoading ? <HeatmapSkeleton /> : <LearningHeatmap rawData={heatmapData} />}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-info" /> Monthly Progress</h3>
                    <div className="h-56"><ResponsiveContainer width="100%" height="100%" minWidth={1}><AreaChart data={monthlyComparison}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} width={30} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="hours" name="Hours" stroke="#3B82F6" fill="#3B82F633" strokeWidth={2} dot={false} /><Area type="monotone" dataKey="avgFocus" name="Focus %" stroke="#10B981" fill="#10B98133" strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></div>
                </Card>

                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Trophy size={16} className="text-warning" /> Quiz Performance Trend</h3>
                    <div className="h-56"><ResponsiveContainer width="100%" height="100%" minWidth={1}><LineChart data={quizTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} domain={[0, 100]} width={30} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B", stroke: "#1a0f2e", strokeWidth: 2 }} /><Line type="monotone" dataKey="perfect" name="Perfect Quizzes" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#10B981" }} /></LineChart></ResponsiveContainer></div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Award size={16} className="text-primary-light" /> Knowledge Card Tiers</h3>
                    <div className="space-y-4">
                        {cardTiers.map((tier, i) => {
                            const pct = totalCardsByTier > 0 ? Math.round((Number(tier.count ?? 0) / totalCardsByTier) * 100) : 0;
                            return (
                                <div key={i}><div className="flex items-center justify-between mb-1.5"><span className="text-body-sm text-text-primary font-medium flex items-center gap-2"><span>{tier.emoji}</span>{tier.tier}</span><span className="text-caption text-text-muted">{tier.count} cards · {pct}%</span></div><div className="h-2.5 bg-dark-secondary rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: tier.color }} /></div></div>
                            );
                        })}
                        <div className="flex items-center justify-between pt-3 border-t border-border-subtle"><span className="text-body-sm text-text-secondary font-medium">Total Cards</span><span className="text-h4 font-bold text-text-primary">{totalCardsByTier}</span></div>
                    </div>
                </Card>

                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Target size={16} className="text-success" /> Focus Score Distribution</h3>
                    <div className="h-52"><ResponsiveContainer width="100%" height="100%" minWidth={1}><BarChart data={focusDistribution} layout="vertical" barSize={18}><XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="range" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={65} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="count" name="Sessions" radius={[0, 6, 6, 0]}>{focusDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer></div>
                    <p className="text-caption text-text-muted mt-2 text-center">{highFocusSessions.high} of {highFocusSessions.total} sessions above 80% focus</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card padding="spacious">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-h4 font-heading text-text-primary flex items-center gap-2"><FileText size={16} className="text-info" /> Study Session Log</h3><span className="text-caption text-text-muted">{sessionLog.length} recent</span></div>
                        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-border-subtle"><th className="text-caption text-text-muted font-medium pb-2.5 pr-4">Session</th><th className="text-caption text-text-muted font-medium pb-2.5 pr-4 hidden sm:table-cell">Subject</th><th className="text-caption text-text-muted font-medium pb-2.5 pr-4 text-center">Focus</th><th className="text-caption text-text-muted font-medium pb-2.5 pr-4 text-center">Quiz</th><th className="text-caption text-text-muted font-medium pb-2.5 text-right">XP</th></tr></thead><tbody>{sessionLog.map((s, i) => (<tr key={i} className="border-b border-border-subtle/50 last:border-0"><td className="py-3 pr-4"><p className="text-body-sm text-text-primary font-medium truncate max-w-[220px]">{s.title}</p><p className="text-caption text-text-muted">{s.date} · {s.duration}</p></td><td className="py-3 pr-4 hidden sm:table-cell"><span className="text-caption text-text-secondary">{s.subject}</span></td><td className="py-3 pr-4 text-center"><span className="text-body-sm font-semibold">{s.focus}%</span></td><td className="py-3 pr-4 text-center"><span className="text-body-sm font-semibold">{s.quizScore}%</span></td><td className="py-3 text-right"><span className="text-body-sm font-semibold text-primary-light">+{s.xp}</span></td></tr>))}</tbody></table></div>
                    </Card>
                </div>

                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4"><Target size={16} className="text-primary-light" /> Milestones</h3>
                    <div className="space-y-3">{milestones.map((m, i) => (<div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${m.done ? 'bg-success/5 border border-success/10' : 'bg-dark-secondary/30 border border-border-subtle/50'}`}><span className="text-lg flex-shrink-0">{m.emoji}</span><div className="flex-1 min-w-0"><p className="text-body-sm font-medium text-text-primary">{m.label}</p><p className="text-caption text-text-muted">{m.date}</p>{!m.done && m.progress != null && <div className="mt-1.5"><div className="h-1.5 bg-dark-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${m.progress}%` }} /></div><p className="text-[10px] text-text-muted mt-0.5">{m.progress}%</p></div>}</div>{m.done && <span className="text-success text-xs font-semibold">✓</span>}</div>))}</div>
                </Card>
            </div>
        </div>
    );
};

export default ReportPage;
