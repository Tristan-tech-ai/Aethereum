import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Youtube,
    Globe,
    Image,
    Presentation,
    Layers,
    Zap,
    Clock,
    Brain,
    CheckCircle2,
    Lock,
    ChevronRight,
    Play,
    MessageSquare,
    Star,
    Sparkles,
    Trophy,
    Target,
    BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useContentStore } from "../stores/contentStore";

/* ──────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────── */
const typeIcons = { pdf: FileText, youtube: Youtube, article: Globe, image: Image, pptx: Presentation };
const typeColors = { pdf: "#EF4444", youtube: "#FF0000", article: "#06B6D4", image: "#22C55E", pptx: "#F59E0B" };

const difficultyConfig = {
    beginner: { label: "Beginner", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    intermediate: { label: "Intermediate", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    advanced: { label: "Advanced", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

const subjectEmojis = {
    "Computer Science": "💻",
    "Mathematics": "📐",
    "Physics": "⚛️",
    "Chemistry": "🧪",
    "Biology": "🧬",
    "History": "📜",
    "Economics": "📊",
    "Literature": "📚",
    "Philosophy": "🧠",
    "Engineering": "⚙️",
    "Business": "💼",
    "Art": "🎨",
    "Music": "🎵",
    "Language": "🌐",
    "Other": "📖",
};

/* ──────────────────────────────────────────────────────
   Section Node Component (Duolingo-style)
   ────────────────────────────────────────────────────── */
const SectionNode = ({ section, index, isLast, quizCount }) => {
    const sectionTitle = section?.title || section?.heading || `Section ${index + 1}`;
    const sectionSummary = section?.summary || section?.description || "";
    const keyConcepts = section?.key_concepts || section?.concepts || [];

    return (
        <div className="flex flex-col items-center">
            {/* Node circle */}
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08, duration: 0.35, type: "spring", stiffness: 200 }}
                className="relative z-10 w-[60px] h-[60px] rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-primary-light/60 flex items-center justify-center shadow-lg shadow-primary/25"
            >
                <span className="text-xl font-black text-white">{index + 1}</span>
                {/* Subtle glow ring */}
                <div className="absolute -inset-1 rounded-full bg-primary/10 blur-sm" />
            </motion.div>

            {/* Connector: circle → card */}
            <div className="w-0.5 h-4 bg-gradient-to-b from-primary/40 to-primary/20" />

            {/* Section info card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.1, duration: 0.3 }}
                className="w-full max-w-lg bg-dark-card border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-all duration-200 group"
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold text-primary-light bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Section {index + 1}
                            </span>
                            {quizCount > 0 && (
                                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap size={9} /> {quizCount} quiz
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-bold text-text-primary leading-tight">{sectionTitle}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <BookOpen size={14} className="text-primary-light" />
                    </div>
                </div>

                {sectionSummary && (
                    <p className="text-[12px] text-text-secondary leading-relaxed mb-3 line-clamp-2">
                        {sectionSummary}
                    </p>
                )}

                {keyConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {keyConcepts.slice(0, 5).map((concept, ci) => (
                            <span
                                key={ci}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-dark-secondary/60 border border-border/30 text-text-muted"
                            >
                                {concept}
                            </span>
                        ))}
                        {keyConcepts.length > 5 && (
                            <span className="text-[10px] text-text-muted">+{keyConcepts.length - 5} more</span>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Connector: card → next node */}
            {!isLast && <div className="w-0.5 h-10 bg-gradient-to-b from-primary/20 to-primary/10" />}
        </div>
    );
};

/* ──────────────────────────────────────────────────────
   Empty Sections Placeholder
   ────────────────────────────────────────────────────── */
const PlaceholderNodes = ({ count = 5 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
                <div className="w-[60px] h-[60px] rounded-full bg-dark-secondary border-2 border-border/40 flex items-center justify-center opacity-40">
                    <Lock size={20} className="text-text-muted" />
                </div>
                <div className="w-0.5 h-4 bg-border/20" />
                <div className="w-full max-w-lg h-20 bg-dark-card border border-border/30 rounded-xl animate-pulse opacity-40" />
                {i < count - 1 && <div className="w-0.5 h-10 bg-border/15" />}
            </div>
        ))}
    </>
);

/* ──────────────────────────────────────────────────────
   COURSE DETAIL PAGE
   ────────────────────────────────────────────────────── */
const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentContent, loading, fetchContent } = useContentStore();

    // Pre-seed from cache synchronously — avoids flashing the skeleton when the
    // content was already loaded (e.g. navigating from Library card → detail page).
    const [content, setContent] = useState(() => {
        const cached = useContentStore.getState().currentContent;
        return cached && String(cached.id) === String(id) ? cached : null;
    });

    useEffect(() => {
        if (!id) return;
        // fetchContent is a no-op (returns cache) if IDs already match
        fetchContent(id).then(c => { if (c) setContent(c); });
    }, [id]);

    // data is always available instantly on re-visit (from useState initializer above)
    const data = content || currentContent;

    if (loading && !data) {
        return (
            <div className="px-4 lg:px-8 py-12 max-w-3xl mx-auto flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse" />
                <div className="h-6 w-64 bg-dark-secondary rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-dark-secondary rounded-lg animate-pulse opacity-60" />
                <div className="mt-8 space-y-6 w-full">
                    <PlaceholderNodes count={4} />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="px-4 lg:px-8 py-12 max-w-3xl mx-auto text-center">
                <BookOpen size={48} className="text-text-muted mx-auto mb-4" />
                <h2 className="text-h3 font-heading text-text-primary mb-2">Course not found</h2>
                <p className="text-text-secondary text-sm mb-6">This course may have been deleted or is still processing.</p>
                <Link to="/library" className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Library
                </Link>
            </div>
        );
    }

    const TypeIcon = typeIcons[data.content_type] || FileText;
    const typeColor = typeColors[data.content_type] || "#7C3AED";
    const sections = data.structured_sections || data.sections || [];
    const hasSections = sections.length > 0;
    const sectionCount = sections.length;
    const quizCount = data.quiz_count ?? 0;
    const estimatedDuration = data.estimated_duration ?? Math.max(sectionCount * 8, 10);
    const difficulty = data.difficulty?.toLowerCase() || "intermediate";
    const diffConf = difficultyConfig[difficulty] || difficultyConfig.intermediate;
    const subjectEmoji = subjectEmojis[data.subject_category] || "📖";
    const isProcessing = data.status === "processing";

    return (
        <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-8">

            {/* ── Back button ── */}
            <Link
                to="/library"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Library
            </Link>

            {/* ── Course Hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-dark-card border border-border/60 rounded-2xl p-6 md:p-8"
            >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Left: Icon + subject */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ background: `${typeColor}15`, border: `1px solid ${typeColor}30` }}
                    >
                        {subjectEmoji}
                    </div>

                    {/* Right: Metadata */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {/* Type badge */}
                            <span
                                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border"
                                style={{ color: typeColor, background: `${typeColor}15`, borderColor: `${typeColor}30` }}
                            >
                                <TypeIcon size={10} />
                                {data.content_type?.toUpperCase()}
                            </span>

                            {/* Difficulty */}
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${diffConf.bg} ${diffConf.color}`}>
                                {diffConf.label}
                            </span>

                            {/* Status */}
                            {isProcessing && (
                                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 animate-pulse">
                                    Processing…
                                </span>
                            )}
                        </div>

                        <h1 className="text-h2 font-heading font-bold text-text-primary mb-1 leading-tight">
                            {data.title}
                        </h1>

                        {data.subject_category && (
                            <p className="text-sm text-text-secondary mb-4">{data.subject_category}</p>
                        )}

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <Layers size={14} className="text-primary-light" />
                                <span><strong className="text-text-primary">{sectionCount}</strong> sections</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap size={14} className="text-amber-400" />
                                <span><strong className="text-text-primary">{quizCount}</strong> quizzes</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-text-muted" />
                                <span>~<strong className="text-text-primary">{estimatedDuration}</strong> min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-5 border-t border-border/40 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate(`/learn/${data.id}`)}
                        disabled={isProcessing || !hasSections}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-200
                            ${isProcessing || !hasSections
                                ? "bg-dark-secondary text-text-muted cursor-not-allowed"
                                : "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01]"
                            }`}
                    >
                        <Play size={16} />
                        {isProcessing ? "Processing..." : hasSections ? "Start Learning" : "Awaiting Sections"}
                    </button>
                    <Link
                        to="/library"
                        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-medium text-text-secondary border border-border/60 hover:border-border hover:text-text-primary transition-all"
                    >
                        <ArrowLeft size={15} /> Library
                    </Link>
                </div>
            </motion.div>

            {/* ── What you'll earn ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Brain, label: "XP Points", value: `+${sectionCount * 50 + quizCount * 30}`, color: "text-primary-light" },
                    { icon: Trophy, label: "Coins", value: `+${sectionCount * 20 + quizCount * 15}`, color: "text-amber-400" },
                    { icon: Target, label: "Knowledge", value: "Card", color: "text-emerald-400" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-dark-card border border-border/40 rounded-xl p-4 text-center">
                        <Icon size={20} className={`${color} mx-auto mb-2`} />
                        <p className={`text-base font-bold ${color}`}>{value}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Section Path Title ── */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Layers size={14} className="text-primary-light" />
                    </div>
                    <h2 className="text-h3 font-heading font-bold text-text-primary">Learning Path</h2>
                </div>
                <p className="text-sm text-text-secondary pl-9">
                    {hasSections
                        ? `${sectionCount} sections to conquer — each ends with a quiz and summary challenge`
                        : "Sections are being generated by AI..."}
                </p>
            </div>

            {/* ── Duolingo-style Node Path ── */}
            <div className="flex flex-col items-center gap-0 pb-12">
                {hasSections ? (
                    sections.map((section, i) => {
                        // distribute quizzes evenly per section (approximate)
                        const sectionQuizzes = quizCount > 0 ? (i < quizCount ? 1 : 0) : 0;
                        return (
                            <SectionNode
                                key={i}
                                section={section}
                                index={i}
                                isLast={i === sections.length - 1}
                                quizCount={sectionQuizzes}
                            />
                        );
                    })
                ) : (
                    <PlaceholderNodes count={Math.max(sectionCount, 5)} />
                )}

                {/* Final node — Summary & Card */}
                {hasSections && (
                    <div className="flex flex-col items-center">
                        {/* Connector from last section */}
                        <div className="w-0.5 h-10 bg-gradient-to-b from-primary/20 to-amber-400/20" />
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: sections.length * 0.08, duration: 0.35, type: "spring" }}
                            className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300/60 flex items-center justify-center shadow-lg shadow-amber-500/25"
                        >
                            <Trophy size={24} className="text-white" />
                        </motion.div>
                        {/* Connector: trophy → card */}
                        <div className="w-0.5 h-4 bg-gradient-to-b from-amber-400/30 to-amber-400/10" />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sections.length * 0.08 + 0.1, duration: 0.3 }}
                            className="w-full max-w-lg bg-gradient-to-br from-amber-500/10 to-amber-400/5 border border-amber-400/30 rounded-xl p-5 text-center"
                        >
                            <h3 className="text-sm font-bold text-amber-300 mb-1">Final Summary & Knowledge Card</h3>
                            <p className="text-[12px] text-text-secondary">
                                Write your own summary to unlock your personalized Knowledge Card and earn full XP rewards.
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetailPage;
