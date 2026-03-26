import { useState } from 'react';
import { CalendarDays, Clock, Target, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAssistantStore } from '../../stores/assistantStore';

/**
 * Form to generate a study plan, and renders the results.
 */
const StudyPlanCard = () => {
    const { studyPlan, studyPlanLoading, studyPlanError, generateStudyPlan } = useAssistantStore();
    const [goal, setGoal] = useState('');
    const [days, setDays] = useState(7);
    const [minutes, setMinutes] = useState(60);
    const [expandedDay, setExpandedDay] = useState(0);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        await generateStudyPlan(goal, days, minutes);
    };

    // ── Form ──────────────────────────────────────────────────────
    if (!studyPlan) {
        return (
            <div className="p-4 space-y-4">
                <div>
                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                        Ceritakan tujuan belajarmu dan Nexera akan membuat jadwal yang dipersonalisasi berdasarkan materi yang sudah kamu upload.
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-text-muted mb-1 block font-medium">
                            Tujuan belajar kamu
                        </label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Contoh: Persiapan ujian Data Structures minggu depan"
                            rows={3}
                            className="w-full resize-none bg-dark-secondary border border-border/40 rounded-xl
                                px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted
                                focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-text-muted mb-1 block font-medium flex items-center gap-1">
                                <CalendarDays size={11} /> Durasi (hari)
                            </label>
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value))))}
                                min={1} max={30}
                                className="w-full bg-dark-secondary border border-border/40 rounded-xl
                                    px-3.5 py-2.5 text-sm text-text-primary
                                    focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted mb-1 block font-medium flex items-center gap-1">
                                <Clock size={11} /> Waktu/hari (menit)
                            </label>
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Math.max(10, Math.min(480, Number(e.target.value))))}
                                min={10} max={480}
                                step={10}
                                className="w-full bg-dark-secondary border border-border/40 rounded-xl
                                    px-3.5 py-2.5 text-sm text-text-primary
                                    focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                </div>

                {studyPlanError && (
                    <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-2.5">
                        {studyPlanError}
                    </p>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={studyPlanLoading || !goal.trim()}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold
                        hover:bg-primary-dark hover:shadow-glow-primary transition-all duration-200
                        disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {studyPlanLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Membuat rencana...
                        </>
                    ) : (
                        <>
                            <Target size={16} />
                            Buat Rencana Belajar
                        </>
                    )}
                </button>
            </div>
        );
    }

    // ── Results ───────────────────────────────────────────────────
    const typeColor = {
        learning: 'bg-primary/15 text-primary-light',
        review:   'bg-amber-500/15 text-amber-400',
        quiz:     'bg-success/15 text-success',
        social:   'bg-secondary/15 text-secondary',
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="bg-dark-elevated border border-primary/20 rounded-xl p-3.5">
                <div className="flex items-start gap-2 mb-2">
                    <Target size={16} className="text-primary-light shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-text-primary">{studyPlan.goal}</p>
                </div>
                <div className="flex gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                        <CalendarDays size={11} /> {studyPlan.duration_days} hari
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={11} /> {studyPlan.daily_minutes} mnt/hari
                    </span>
                </div>
                {studyPlan.motivational_message && (
                    <p className="mt-2 text-xs text-primary-light italic">
                        "{studyPlan.motivational_message}"
                    </p>
                )}
            </div>

            {/* Alerts */}
            {studyPlan.risk_alerts?.length > 0 && (
                <div className="space-y-1">
                    {studyPlan.risk_alerts.map((alert, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg p-2.5">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            <span>{alert}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Daily Plan */}
            <div className="space-y-2">
                {studyPlan.weekly_plan?.map((day, i) => (
                    <div key={i} className="border border-border/40 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-dark-card hover:bg-dark-elevated transition-colors text-sm"
                        >
                            <span className="font-medium text-text-primary">{day.day_label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted">
                                    {day.tasks?.reduce((sum, t) => sum + (t.duration_min || 0), 0)} mnt
                                </span>
                                {expandedDay === i ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                            </div>
                        </button>

                        {expandedDay === i && (
                            <div className="px-3.5 pb-3 space-y-2 bg-dark-card">
                                {day.tasks?.map((task, j) => (
                                    <div key={j} className="flex gap-2 items-start">
                                        <CheckCircle2 size={13} className="text-text-muted shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-medium text-text-primary">{task.title}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeColor[task.type] || 'bg-dark-secondary text-text-muted'}`}>
                                                    {task.type}
                                                </span>
                                            </div>
                                            {task.description && (
                                                <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{task.description}</p>
                                            )}
                                            <p className="text-[10px] text-text-muted mt-0.5">
                                                {task.duration_min} mnt
                                                {task.source_content_title && ` · ${task.source_content_title}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Success metric */}
            {studyPlan.success_metric && (
                <div className="flex gap-2 text-xs text-success bg-success/10 border border-success/20 rounded-lg p-2.5">
                    <CheckCircle2 size={12} className="shrink-0 mt-0.5" />
                    <span><strong>Indikator sukses:</strong> {studyPlan.success_metric}</span>
                </div>
            )}

            {/* Reset */}
            <button
                onClick={() => useAssistantStore.getState().generateStudyPlan && useAssistantStore.setState({ studyPlan: null })}
                className="w-full py-2 rounded-xl border border-border/50 text-text-muted hover:text-text-primary hover:border-border text-xs transition-colors"
            >
                Buat rencana baru
            </button>
        </div>
    );
};

export default StudyPlanCard;
