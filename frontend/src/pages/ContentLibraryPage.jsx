import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Grid3X3,
    List,
    Filter,
    FileText,
    Youtube,
    Globe,
    Image,
    Presentation,
    Trash2,
    Eye,
    Play,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Clock,
    Layers,
    X,
    Sparkles,
    Upload,
    ArrowRight,
    CheckCircle2,
    Loader2,
    AlertCircle,
    SlidersHorizontal,
    ArrowUpDown,
    Zap,
    GraduationCap,
    FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContentStore } from "../stores/contentStore";
import useContentPolling from "../hooks/useContentPolling";
import ContentUploadModal from "../components/learning/ContentUploadModal";
import ContentDetailModal from "../components/learning/ContentDetailModal";
import Button from "../components/ui/Button";

// ─── Constants ───────────────────────────────
const typeIcons = {
    pdf: FileText,
    youtube: Youtube,
    article: Globe,
    image: Image,
    pptx: Presentation,
};

const typeColors = {
    pdf: { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", accent: "#EF4444" },
    youtube: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", accent: "#FF0000" },
    article: { text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", accent: "#06B6D4" },
    image: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", accent: "#22C55E" },
    pptx: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", accent: "#F59E0B" },
};

const typeLabels = {
    pdf: "PDF",
    youtube: "YouTube",
    article: "Article",
    image: "Image",
    pptx: "PPTX",
};

const statusConfig = {
    processing: { label: "Processing", icon: Loader2, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", spin: true },
    ready: { label: "Ready", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", spin: false },
    failed: { label: "Failed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", spin: false },
};

const difficultyColors = {
    beginner: "text-emerald-400 bg-emerald-400/10",
    intermediate: "text-amber-400 bg-amber-400/10",
    advanced: "text-red-400 bg-red-400/10",
};

const subjectOptions = [
    "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
    "History", "Economics", "Literature", "Philosophy", "Engineering",
    "Business", "Art", "Music", "Language", "Other",
];

const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "az", label: "A → Z" },
    { value: "za", label: "Z → A" },
];

// ─── Animation Variants ──────────────────────
const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── Utility ─────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Page Component ──────────────────────────
const ContentLibraryPage = () => {
    const navigate = useNavigate();
    const {
        contents,
        loading,
        pagination,
        filters,
        fetchContents,
        deleteContent,
        setFilter,
        resetFilters,
    } = useContentStore();

    const [viewMode, setViewMode] = useState("grid");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [detailContent, setDetailContent] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const searchRef = useRef(null);

    // Auto-poll processing items
    useContentPolling(contents);

    // Fetch on mount & filter change
    useEffect(() => {
        fetchContents(1);
    }, [filters.status, filters.content_type, filters.subject_category, filters.sort]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Computed stats
    const stats = useMemo(() => {
        const readyCount = contents.filter((c) => c.status === "ready").length;
        const processingCount = contents.filter((c) => c.status === "processing").length;
        return { total: pagination.total, ready: readyCount, processing: processingCount };
    }, [contents, pagination.total]);

    // Active filter count
    const activeFilterCount = [filters.status, filters.content_type, filters.subject_category]
        .filter(Boolean).length + (filters.sort !== "recent" ? 1 : 0);

    // Local search filter
    const filteredContents = contents.filter((c) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.title?.toLowerCase().includes(q) ||
            c.subject_category?.toLowerCase().includes(q) ||
            c.content_type?.toLowerCase().includes(q)
        );
    });

    // ─── Handlers ─────────────────────────────
    const handleDelete = async (content) => {
        setDeleting(true);
        await deleteContent(content.id);
        setDeleting(false);
        setDeleteConfirm(null);
    };

    const handleStartLearning = (content) => {
        if (content.status === "ready") navigate(`/course/${content.id}`);
    };

    const handleUploadSuccess = () => fetchContents(1);

    const handleTypeFilter = (type) => {
        setFilter("content_type", filters.content_type === type ? "" : type);
    };

    const clearAllFilters = () => {
        resetFilters();
        setSearchQuery("");
    };

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">

            {/* ═══ Header Section ═══ */}
            <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <FolderOpen size={18} className="text-white" />
                            </div>
                            My Library
                        </h1>
                        <p className="text-sm text-text-secondary mt-1 ml-[46px]">
                            Your personal knowledge collection
                        </p>
                    </div>
                    <Button onClick={() => setUploadOpen(true)} className="shadow-lg shadow-primary/20">
                        <Plus size={18} className="mr-1.5" />
                        Upload Material
                    </Button>
                </div>

                {/* ═══ Quick Stats ═══ */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total", value: stats.total, icon: BookOpen, color: "text-primary-light", bg: "bg-primary/10" },
                        { label: "Ready", value: stats.ready, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                        { label: "Processing", value: stats.processing, icon: Loader2, color: "text-amber-400", bg: "bg-amber-400/10", spin: stats.processing > 0 },
                    ].map(({ label, value, icon: Icon, color, bg, spin }) => (
                        <div key={label} className="bg-dark-card border border-border/60 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                                <Icon size={16} className={`${color} ${spin ? "animate-spin" : ""}`} />
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${color}`}>{value}</p>
                                <p className="text-[11px] text-text-muted">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Search & Filter Toolbar ═══ */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Enhanced Search */}
                    <div className="flex-1 relative group">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-light transition-colors pointer-events-none" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-20 bg-dark-card text-text-primary text-sm rounded-xl border border-border/60 hover:border-border-hover focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-text-muted"
                        />
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={14} />
                            </button>
                        ) : (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-disabled bg-dark-secondary px-1.5 py-0.5 rounded border border-border/40 font-mono hidden sm:block">
                                Ctrl+K
                            </span>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Sort dropdown */}
                        <div className="relative">
                            <select
                                value={filters.sort}
                                onChange={(e) => setFilter("sort", e.target.value)}
                                className="h-11 pl-9 pr-3 bg-dark-card text-text-primary text-sm rounded-xl border border-border/60 hover:border-border-hover focus:border-primary/50 focus:outline-none cursor-pointer transition-all appearance-none min-w-[130px]"
                            >
                                {sortOptions.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>

                        {/* Advanced Filters Toggle */}
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`h-11 px-3.5 flex items-center gap-2 text-sm rounded-xl border transition-all ${
                                showAdvancedFilters || activeFilterCount > 0
                                    ? "bg-primary/10 border-primary/30 text-primary-light"
                                    : "bg-dark-card border-border/60 text-text-secondary hover:border-border-hover hover:text-text-primary"
                            }`}
                        >
                            <SlidersHorizontal size={15} />
                            <span className="hidden sm:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-dark-card border border-border/60 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2.5 transition-all ${viewMode === "grid" ? "bg-primary/15 text-primary-light" : "text-text-muted hover:text-text-primary"}`}
                                title="Grid view"
                            >
                                <Grid3X3 size={16} />
                            </button>
                            <div className="w-px bg-border/40" />
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2.5 transition-all ${viewMode === "list" ? "bg-primary/15 text-primary-light" : "text-text-muted hover:text-text-primary"}`}
                                title="List view"
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ Content Type Quick-Filter Chips ═══ */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {Object.entries(typeIcons).map(([type, Icon]) => {
                        const isActive = filters.content_type === type;
                        const colors = typeColors[type];
                        return (
                            <button
                                key={type}
                                onClick={() => handleTypeFilter(type)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                                    isActive
                                        ? `${colors.bg} ${colors.text} ${colors.border}`
                                        : "bg-dark-card border-border/40 text-text-muted hover:text-text-secondary hover:border-border-hover"
                                }`}
                            >
                                <Icon size={13} />
                                {typeLabels[type]}
                            </button>
                        );
                    })}

                    {/* Active filter badges */}
                    {(filters.status || filters.subject_category) && (
                        <>
                            <div className="w-px h-5 bg-border/40 mx-1" />
                            {filters.status && (
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-light border border-primary/20">
                                    {filters.status}
                                    <button onClick={() => setFilter("status", "")} className="ml-0.5 hover:text-white"><X size={11} /></button>
                                </span>
                            )}
                            {filters.subject_category && (
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-light border border-primary/20">
                                    {filters.subject_category}
                                    <button onClick={() => setFilter("subject_category", "")} className="ml-0.5 hover:text-white"><X size={11} /></button>
                                </span>
                            )}
                        </>
                    )}

                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="text-[11px] text-text-muted hover:text-primary-light transition-colors whitespace-nowrap ml-1">
                            Clear all
                        </button>
                    )}
                </div>

                {/* ═══ Advanced Filter Panel ═══ */}
                <AnimatePresence>
                    {showAdvancedFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-4 p-4 bg-dark-card border border-border/60 rounded-xl">
                                <FilterSelect
                                    label="Status"
                                    value={filters.status}
                                    onChange={(v) => setFilter("status", v)}
                                    options={[
                                        { value: "", label: "All statuses" },
                                        { value: "processing", label: "⏳ Processing" },
                                        { value: "ready", label: "✅ Ready" },
                                        { value: "failed", label: "❌ Failed" },
                                    ]}
                                />
                                <FilterSelect
                                    label="Subject"
                                    value={filters.subject_category}
                                    onChange={(v) => setFilter("subject_category", v)}
                                    options={[
                                        { value: "", label: "All subjects" },
                                        ...subjectOptions.map((s) => ({ value: s, label: s })),
                                    ]}
                                />
                                <div className="flex items-end">
                                    <button
                                        onClick={clearAllFilters}
                                        className="h-9 px-3 text-xs text-text-muted hover:text-primary-light transition-colors"
                                    >
                                        Reset all
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ Results Count ═══ */}
            {!loading && filteredContents.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">
                        Showing <span className="text-text-secondary font-medium">{filteredContents.length}</span>
                        {filteredContents.length !== pagination.total && <> of {pagination.total}</>} material{pagination.total !== 1 ? "s" : ""}
                    </p>
                </div>
            )}

            {/* ═══ Content Grid / List ═══ */}
            {loading && contents.length === 0 ? (
                <LoadingSkeleton viewMode={viewMode} />
            ) : filteredContents.length === 0 ? (
                <EmptyState
                    onUpload={() => setUploadOpen(true)}
                    hasFilters={!!searchQuery || !!filters.status || !!filters.content_type || !!filters.subject_category}
                />
            ) : viewMode === "grid" ? (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filteredContents.map((content) => (
                        <motion.div key={content.id} variants={fadeUp}>
                            <ContentGridCard
                                content={content}
                                onView={() => setDetailContent(content)}
                                onDelete={() => setDeleteConfirm(content)}
                                onStart={() => handleStartLearning(content)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                >
                    {filteredContents.map((content) => (
                        <motion.div key={content.id} variants={fadeUp}>
                            <ContentListRow
                                content={content}
                                onView={() => setDetailContent(content)}
                                onDelete={() => setDeleteConfirm(content)}
                                onStart={() => handleStartLearning(content)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ═══ Pagination ═══ */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.current_page <= 1}
                        onClick={() => fetchContents(pagination.current_page - 1)}
                        className="rounded-lg"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                        .map((page, idx, arr) => (
                            <React.Fragment key={page}>
                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                    <span className="text-text-disabled text-xs px-1">…</span>
                                )}
                                <button
                                    onClick={() => fetchContents(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                        page === pagination.current_page
                                            ? "bg-primary text-white"
                                            : "text-text-muted hover:bg-dark-card hover:text-text-primary"
                                    }`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => fetchContents(pagination.current_page + 1)}
                        className="rounded-lg"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            {/* ═══ Modals ═══ */}
            <ContentUploadModal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
            <ContentDetailModal
                isOpen={!!detailContent}
                onClose={() => setDetailContent(null)}
                content={detailContent}
                onStartLearning={handleStartLearning}
            />
            {deleteConfirm && (
                <DeleteConfirmModal
                    content={deleteConfirm}
                    deleting={deleting}
                    onConfirm={() => handleDelete(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

/** Enhanced Grid Card */
const ContentGridCard = ({ content, onView, onDelete, onStart }) => {
    const TypeIcon = typeIcons[content.content_type] || FileText;
    const colors = typeColors[content.content_type] || typeColors.article;
    const status = statusConfig[content.status] || statusConfig.processing;
    const StatusIcon = status.icon;
    const sections = content.structured_sections || [];
    const diffClass = difficultyColors[content.difficulty?.toLowerCase()] || "";

    return (
        <div
            onClick={onView}
            className="group relative bg-dark-card border border-border/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-250 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
        >
            {/* Color accent stripe */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}44)` }} />

            <div className="p-4">
                {/* Top row: icon, status, actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border}`}>
                            <TypeIcon size={18} />
                        </div>
                        <div>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
                                {typeLabels[content.content_type] || "File"}
                            </span>
                            {content.difficulty && (
                                <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${diffClass}`}>
                                    {content.difficulty}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${status.bg} ${status.color} border ${status.border}`}>
                        <StatusIcon size={10} className={status.spin ? "animate-spin" : ""} />
                        {status.label}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
                    {content.title || "Untitled"}
                </h3>

                {/* Subject */}
                {content.subject_category && (
                    <p className="text-[11px] text-text-muted mb-3 truncate">{content.subject_category}</p>
                )}

                {/* Metadata chips */}
                <div className="flex items-center gap-3 text-[11px] text-text-muted mt-auto pt-3 border-t border-border/30">
                    {sections.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Layers size={11} className="text-primary-light/60" />
                            {sections.length}
                        </span>
                    )}
                    {content.estimated_duration && (
                        <span className="flex items-center gap-1">
                            <Clock size={11} className="text-primary-light/60" />
                            {content.estimated_duration}m
                        </span>
                    )}
                    {content.total_pages && (
                        <span className="flex items-center gap-1">
                            <BookOpen size={11} className="text-primary-light/60" />
                            {content.total_pages}p
                        </span>
                    )}
                    <span className="ml-auto text-text-disabled">
                        {formatDate(content.created_at)}
                    </span>
                </div>
            </div>

            {/* Hover overlay actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-250 flex items-end justify-between p-4 pointer-events-none group-hover:pointer-events-auto">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 backdrop-blur-sm transition-colors border border-red-500/20"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
                {content.status === "ready" ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark backdrop-blur-sm transition-colors shadow-lg shadow-primary/25"
                    >
                        <Play size={13} />
                        Learn
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-text-primary text-xs font-medium rounded-lg hover:bg-white/15 backdrop-blur-sm transition-colors border border-white/10"
                    >
                        <Eye size={13} />
                        Details
                    </button>
                )}
            </div>
        </div>
    );
};

/** Enhanced List Row */
const ContentListRow = ({ content, onView, onDelete, onStart }) => {
    const TypeIcon = typeIcons[content.content_type] || FileText;
    const colors = typeColors[content.content_type] || typeColors.article;
    const status = statusConfig[content.status] || statusConfig.processing;
    const StatusIcon = status.icon;
    const sections = content.structured_sections || [];

    return (
        <div
            onClick={onView}
            className="group flex items-center gap-4 p-4 bg-dark-card border border-border/50 rounded-xl hover:border-border-hover cursor-pointer transition-all duration-200"
        >
            {/* Left accent + Icon */}
            <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-0.5 rounded-full transition-colors" style={{ backgroundColor: colors.accent + "00" }} />
                <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} group-hover:scale-105 transition-transform`}>
                    <TypeIcon size={17} />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors">
                        {content.title || "Untitled"}
                    </h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {content.subject_category && (
                        <span className="text-[11px] text-text-muted">{content.subject_category}</span>
                    )}
                    {sections.length > 0 && (
                        <span className="text-[11px] text-text-disabled flex items-center gap-1">
                            <Layers size={10} /> {sections.length} sections
                        </span>
                    )}
                    {content.estimated_duration && (
                        <span className="text-[11px] text-text-disabled flex items-center gap-1">
                            <Clock size={10} /> {content.estimated_duration}m
                        </span>
                    )}
                    <span className="text-[11px] text-text-disabled">{formatDate(content.created_at)}</span>
                </div>
            </div>

            {/* Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${status.bg} ${status.color} border ${status.border} shrink-0`}>
                <StatusIcon size={11} className={status.spin ? "animate-spin" : ""} />
                {status.label}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {content.status === "ready" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(); }}
                        className="p-1.5 bg-primary/15 text-primary-light rounded-lg hover:bg-primary/25 transition-colors"
                        title="Start Learning"
                    >
                        <Play size={14} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className="p-1.5 bg-white/5 text-text-muted rounded-lg hover:bg-white/10 hover:text-text-primary transition-colors"
                    title="View details"
                >
                    <Eye size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

/** Enhanced Empty State */
const EmptyState = ({ onUpload, hasFilters }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        {hasFilters ? (
            <>
                <div className="w-16 h-16 rounded-2xl bg-dark-secondary flex items-center justify-center mb-5">
                    <Search size={28} className="text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No results found</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                    Try adjusting your filters or search query to find what you're looking for.
                </p>
            </>
        ) : (
            <>
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                        <GraduationCap size={36} className="text-primary-light" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Start your knowledge journey</h3>
                <p className="text-sm text-text-secondary max-w-md mb-8">
                    Upload any learning material and our AI will transform it into an interactive course with sections, quizzes, and knowledge cards.
                </p>

                {/* How it works steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
                    {[
                        { icon: Upload, title: "Upload", desc: "PDF, YouTube, or article" },
                        { icon: Sparkles, title: "AI Processes", desc: "Sections & quizzes generated" },
                        { icon: Zap, title: "Learn & Earn", desc: "XP, coins, and cards" },
                    ].map(({ icon: Icon, title, desc }, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-card border border-border/40">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon size={15} className="text-primary-light" />
                            </div>
                            <p className="text-xs font-semibold text-text-primary">{title}</p>
                            <p className="text-[10px] text-text-muted">{desc}</p>
                        </div>
                    ))}
                </div>

                <Button onClick={onUpload} className="shadow-lg shadow-primary/20">
                    <Plus size={18} className="mr-1.5" />
                    Upload Your First Material
                </Button>
            </>
        )}
    </div>
);

/** Enhanced Loading Skeleton */
const LoadingSkeleton = ({ viewMode }) => (
    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
        {Array.from({ length: 6 }).map((_, i) => (
            <div
                key={i}
                className={`bg-dark-card border border-border/50 rounded-xl overflow-hidden ${viewMode === "list" ? "p-4" : ""}`}
                style={{ animationDelay: `${i * 80}ms` }}
            >
                {viewMode === "grid" && <div className="h-1 w-full bg-dark-secondary" />}
                <div className={`${viewMode === "grid" ? "p-4" : ""}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-secondary rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-dark-secondary rounded-md w-3/4 animate-pulse" />
                            <div className="h-2.5 bg-dark-secondary rounded-md w-1/2 animate-pulse" />
                        </div>
                        {viewMode === "grid" && <div className="w-14 h-5 bg-dark-secondary rounded-md animate-pulse" />}
                    </div>
                    {viewMode === "grid" && (
                        <div className="flex gap-3 mt-4 pt-3 border-t border-border/20">
                            <div className="h-2.5 bg-dark-secondary rounded w-10 animate-pulse" />
                            <div className="h-2.5 bg-dark-secondary rounded w-12 animate-pulse" />
                            <div className="h-2.5 bg-dark-secondary rounded w-8 animate-pulse ml-auto" />
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
);

/** Delete Confirmation Modal */
const DeleteConfirmModal = ({ content, deleting, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-dark-elevated rounded-xl p-6 max-w-sm w-full shadow-2xl border border-border/60"
        >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Delete Content?</h3>
            <p className="text-sm text-text-secondary mb-6">
                "<strong className="text-text-primary">{content.title || "Untitled"}</strong>" will be permanently deleted along with its knowledge cards and quiz data.
            </p>
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} loading={deleting}>
                    <Trash2 size={15} className="mr-1.5" />
                    Delete
                </Button>
            </div>
        </motion.div>
    </div>
);

/** Filter Select */
const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-text-muted uppercase tracking-wider font-medium">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 px-3 bg-dark-secondary text-text-primary text-xs rounded-lg border border-border/60 hover:border-border-hover focus:border-primary/50 focus:outline-none cursor-pointer transition-all appearance-none min-w-[130px]"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

export default ContentLibraryPage;
