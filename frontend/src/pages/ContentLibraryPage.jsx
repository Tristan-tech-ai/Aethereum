import React, { useState, useEffect, useCallback } from "react";
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
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Clock,
    Layers,
    RefreshCw,
} from "lucide-react";
import { useContentStore } from "../stores/contentStore";
import useContentPolling from "../hooks/useContentPolling";
import ContentUploadModal from "../components/learning/ContentUploadModal";
import ContentDetailModal from "../components/learning/ContentDetailModal";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";

// ─── Constants ───────────────────────────────
const typeIcons = {
    pdf: FileText,
    youtube: Youtube,
    article: Globe,
    image: Image,
    pptx: Presentation,
};

const typeColors = {
    pdf: "text-danger",
    youtube: "text-danger",
    article: "text-info",
    image: "text-warning",
    pptx: "text-primary-light",
};

const statusConfig = {
    processing: { label: "Processing", variant: "warning", pulse: true },
    ready: { label: "Ready", variant: "success", pulse: false },
    failed: { label: "Failed", variant: "danger", pulse: false },
};

const subjectOptions = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Economics",
    "Literature",
    "Philosophy",
    "Engineering",
    "Business",
    "Art",
    "Music",
    "Language",
    "Other",
];

const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "az", label: "A – Z" },
    { value: "za", label: "Z – A" },
];

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

    const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
    const [uploadOpen, setUploadOpen] = useState(false);
    const [detailContent, setDetailContent] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Auto-poll processing items
    useContentPolling(contents);

    // Fetch on mount & filter change
    useEffect(() => {
        fetchContents(1);
    }, [
        filters.status,
        filters.content_type,
        filters.subject_category,
        filters.sort,
    ]);

    // Local search — filter on top of fetched contents
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
        if (content.status === "ready") {
            navigate(`/learn/${content.id}`);
        }
    };

    const handleUploadSuccess = () => {
        fetchContents(1);
    };

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading text-text-primary">
                        Content Library
                    </h1>
                    <p className="text-body-sm text-text-secondary mt-1">
                        {pagination.total} material
                        {pagination.total !== 1 ? "s" : ""} in your library
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Plus size={18} className="mr-1.5" />
                    Upload Material
                </Button>
            </div>

            {/* ── Search & Filters Bar ── */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-dark-secondary text-text-primary text-sm rounded-[8px] border border-border hover:border-border-hover focus:border-primary focus:outline-none transition-colors placeholder:text-text-muted"
                        />
                    </div>

                    {/* View toggle + Filter button */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-10 px-3 flex items-center gap-2 text-sm rounded-[8px] border transition-colors ${
                                showFilters
                                    ? "bg-primary/10 border-primary/30 text-primary-light"
                                    : "bg-dark-secondary border-border text-text-secondary hover:border-border-hover"
                            }`}
                        >
                            <Filter size={16} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>

                        <div className="flex bg-dark-secondary border border-border rounded-[8px] overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2.5 transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-primary/15 text-primary-light"
                                        : "text-text-muted hover:text-text-primary"
                                }`}
                                title="Grid view"
                            >
                                <Grid3X3 size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2.5 transition-colors ${
                                    viewMode === "list"
                                        ? "bg-primary/15 text-primary-light"
                                        : "text-text-muted hover:text-text-primary"
                                }`}
                                title="List view"
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Expanded Filters ── */}
                {showFilters && (
                    <div className="flex flex-wrap gap-3 p-4 bg-dark-card border border-border rounded-md-drd animate-[fadeIn_200ms_ease-out]">
                        {/* Status */}
                        <FilterSelect
                            label="Status"
                            value={filters.status}
                            onChange={(v) => setFilter("status", v)}
                            options={[
                                { value: "", label: "All" },
                                { value: "processing", label: "⏳ Processing" },
                                { value: "ready", label: "✅ Ready" },
                                { value: "failed", label: "❌ Failed" },
                            ]}
                        />

                        {/* Content Type */}
                        <FilterSelect
                            label="Type"
                            value={filters.content_type}
                            onChange={(v) => setFilter("content_type", v)}
                            options={[
                                { value: "", label: "All" },
                                { value: "pdf", label: "📄 PDF" },
                                { value: "youtube", label: "🎬 YouTube" },
                                { value: "article", label: "🌐 Article" },
                                { value: "image", label: "🖼️ Image" },
                                { value: "pptx", label: "📊 PPTX" },
                            ]}
                        />

                        {/* Subject */}
                        <FilterSelect
                            label="Subject"
                            value={filters.subject_category}
                            onChange={(v) => setFilter("subject_category", v)}
                            options={[
                                { value: "", label: "All" },
                                ...subjectOptions.map((s) => ({
                                    value: s,
                                    label: s,
                                })),
                            ]}
                        />

                        {/* Sort */}
                        <FilterSelect
                            label="Sort"
                            value={filters.sort}
                            onChange={(v) => setFilter("sort", v)}
                            options={sortOptions}
                        />

                        {/* Reset */}
                        <button
                            onClick={() => {
                                resetFilters();
                                setSearchQuery("");
                            }}
                            className="text-caption text-text-muted hover:text-primary-light transition-colors self-end pb-1"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            {loading && contents.length === 0 ? (
                <LoadingSkeleton viewMode={viewMode} />
            ) : filteredContents.length === 0 ? (
                <EmptyState
                    onUpload={() => setUploadOpen(true)}
                    hasFilters={
                        !!searchQuery ||
                        !!filters.status ||
                        !!filters.content_type ||
                        !!filters.subject_category
                    }
                />
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContents.map((content) => (
                        <ContentGridCard
                            key={content.id}
                            content={content}
                            onView={() => setDetailContent(content)}
                            onDelete={() => setDeleteConfirm(content)}
                            onStart={() => handleStartLearning(content)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredContents.map((content) => (
                        <ContentListRow
                            key={content.id}
                            content={content}
                            onView={() => setDetailContent(content)}
                            onDelete={() => setDeleteConfirm(content)}
                            onStart={() => handleStartLearning(content)}
                        />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.current_page <= 1}
                        onClick={() =>
                            fetchContents(pagination.current_page - 1)
                        }
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-body-sm text-text-secondary">
                        Page {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                            pagination.current_page >= pagination.last_page
                        }
                        onClick={() =>
                            fetchContents(pagination.current_page + 1)
                        }
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            {/* ── Modals ── */}
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

            {/* Delete Confirmation */}
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

/** Grid card for a single content item */
const ContentGridCard = ({ content, onView, onDelete, onStart }) => {
    const TypeIcon = typeIcons[content.content_type] || FileText;
    const color = typeColors[content.content_type] || "text-text-muted";
    const status = statusConfig[content.status] || statusConfig.processing;
    const sections = content.structured_sections || [];

    return (
        <Card hover className="group relative flex flex-col" onClick={onView}>
            {/* Type Icon + Title */}
            <div className="flex items-start gap-3 mb-3">
                <div
                    className={`p-2 rounded-md-drd bg-dark-secondary shrink-0 ${color}`}
                >
                    <TypeIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                        {content.title || "Untitled"}
                    </h3>
                    {content.subject_category && (
                        <p className="text-caption text-text-muted mt-0.5 truncate">
                            {content.subject_category}
                        </p>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
                <span
                    className={`relative inline-flex items-center px-2.5 py-1 text-caption font-semibold rounded-full ${
                        status.variant === "success"
                            ? "bg-success/15 text-success"
                            : status.variant === "warning"
                              ? "bg-warning/15 text-warning"
                              : "bg-danger/15 text-danger"
                    }`}
                >
                    {status.pulse && (
                        <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current animate-pulse mr-1" />
                    )}
                    <span className={status.pulse ? "ml-2" : ""}>
                        {status.label}
                    </span>
                </span>
                {content.difficulty && (
                    <Badge variant="default">{content.difficulty}</Badge>
                )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-caption text-text-muted mt-auto">
                {sections.length > 0 && (
                    <span className="flex items-center gap-1">
                        <Layers size={12} /> {sections.length} sections
                    </span>
                )}
                {content.estimated_duration && (
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {content.estimated_duration}m
                    </span>
                )}
                {content.total_pages && (
                    <span className="flex items-center gap-1">
                        <BookOpen size={12} /> {content.total_pages}p
                    </span>
                )}
            </div>

            {/* Hover actions */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {content.status === "ready" && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart();
                        }}
                        className="p-1.5 bg-primary/20 text-primary-light rounded-sm-drd hover:bg-primary/30 transition-colors"
                        title="Start Learning"
                    >
                        <Play size={14} />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 bg-danger/20 text-danger rounded-sm-drd hover:bg-danger/30 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </Card>
    );
};

/** List row for a single content item */
const ContentListRow = ({ content, onView, onDelete, onStart }) => {
    const TypeIcon = typeIcons[content.content_type] || FileText;
    const color = typeColors[content.content_type] || "text-text-muted";
    const status = statusConfig[content.status] || statusConfig.processing;
    const sections = content.structured_sections || [];

    return (
        <div
            onClick={onView}
            className="group flex items-center gap-4 p-4 bg-dark-card border border-border rounded-md-drd hover:-translate-y-0.5 hover:shadow-md-drd cursor-pointer transition-all duration-200"
        >
            {/* Icon */}
            <div
                className={`p-2 rounded-md-drd bg-dark-secondary shrink-0 ${color}`}
            >
                <TypeIcon size={18} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                    {content.title || "Untitled"}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {content.subject_category && (
                        <span className="text-caption text-text-muted">
                            {content.subject_category}
                        </span>
                    )}
                    {sections.length > 0 && (
                        <span className="text-caption text-text-disabled flex items-center gap-1">
                            <Layers size={11} /> {sections.length} sections
                        </span>
                    )}
                    {content.estimated_duration && (
                        <span className="text-caption text-text-disabled flex items-center gap-1">
                            <Clock size={11} /> {content.estimated_duration}m
                        </span>
                    )}
                </div>
            </div>

            {/* Status */}
            <Badge variant={status.variant}>{status.label}</Badge>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {content.status === "ready" && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart();
                        }}
                        className="p-1.5 bg-primary/20 text-primary-light rounded-sm-drd hover:bg-primary/30 transition-colors"
                        title="Start Learning"
                    >
                        <Play size={14} />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    className="p-1.5 bg-white/5 text-text-muted rounded-sm-drd hover:bg-white/10 hover:text-text-primary transition-colors"
                    title="View details"
                >
                    <Eye size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 bg-danger/20 text-danger rounded-sm-drd hover:bg-danger/30 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

/** Empty state — DRD-compliant illustration + CTA */
const EmptyState = ({ onUpload, hasFilters }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BookOpen size={36} className="text-primary-light" />
        </div>
        {hasFilters ? (
            <>
                <h3 className="text-h4 font-heading text-text-primary mb-2">
                    No results found
                </h3>
                <p className="text-body-sm text-text-secondary max-w-sm">
                    Try adjusting your filters or search query.
                </p>
            </>
        ) : (
            <>
                <h3 className="text-h4 font-heading text-text-primary mb-2">
                    Your knowledge journey starts here!
                </h3>
                <p className="text-body-sm text-text-secondary max-w-sm mb-6">
                    Upload your first material — a PDF, YouTube video, or web
                    article — and let AI transform it into an interactive
                    learning experience.
                </p>
                <Button onClick={onUpload}>
                    <Plus size={18} className="mr-1.5" />
                    Upload Material
                </Button>
            </>
        )}
    </div>
);

/** Loading skeleton */
const LoadingSkeleton = ({ viewMode }) => (
    <div
        className={
            viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
        }
    >
        {Array.from({ length: 6 }).map((_, i) => (
            <div
                key={i}
                className={`bg-dark-card border border-border rounded-md-drd animate-pulse ${
                    viewMode === "grid" ? "p-5 h-[160px]" : "p-4 h-[72px]"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-secondary rounded-md-drd" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-dark-secondary rounded w-2/3" />
                        <div className="h-2 bg-dark-secondary rounded w-1/3" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/** Delete confirmation modal */
const DeleteConfirmModal = ({ content, deleting, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
        <div className="relative bg-dark-elevated rounded-lg-drd p-6 max-w-sm w-full shadow-lg-drd animate-[scaleIn_200ms_ease-out]">
            <h3 className="text-h4 font-heading text-text-primary mb-2">
                Delete Content?
            </h3>
            <p className="text-body-sm text-text-secondary mb-6">
                "
                <strong className="text-text-primary">
                    {content.title || "Untitled"}
                </strong>
                " will be permanently deleted along with its knowledge cards and
                quiz data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel} disabled={deleting}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} loading={deleting}>
                    <Trash2 size={16} className="mr-1.5" />
                    Delete
                </Button>
            </div>
        </div>
        <style>{`
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
);

/** Small filter dropdown */
const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[11px] text-text-muted uppercase tracking-wider">
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 px-3 bg-dark-secondary text-text-primary text-caption rounded-[6px] border border-border hover:border-border-hover focus:border-primary focus:outline-none cursor-pointer transition-colors appearance-none min-w-[120px]"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

export default ContentLibraryPage;
