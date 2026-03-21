import React from "react";
import {
    X,
    BookOpen,
    Clock,
    Layers,
    FileText,
    Youtube,
    Globe,
    Image,
    Presentation,
    Play,
    Tag,
    Calendar,
    AlertCircle,
} from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

/**
 * ContentDetailModal — shows full content details: sections, metadata, estimated duration.
 * Matches DRD: progressive disclosure (expand on click), dark premium design, feedback-rich.
 */

const typeIcons = {
    pdf: FileText,
    youtube: Youtube,
    article: Globe,
    image: Image,
    pptx: Presentation,
};

const typeLabels = {
    pdf: "PDF Document",
    youtube: "YouTube Video",
    article: "Web Article",
    image: "Image / Infographic",
    pptx: "Presentation",
};

const statusConfig = {
    processing: { label: "Processing", variant: "warning", icon: "⏳" },
    ready: { label: "Ready", variant: "success", icon: "✅" },
    failed: { label: "Failed", variant: "danger", icon: "❌" },
};

const ContentDetailModal = ({ isOpen, onClose, content, onStartLearning }) => {
    if (!content) return null;

    const TypeIcon = typeIcons[content.content_type] || FileText;
    const status = statusConfig[content.status] || statusConfig.processing;
    const sections = content.structured_sections || [];
    const analysis = content.ai_analysis || {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-md-drd shrink-0">
                        <TypeIcon size={28} className="text-primary-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-h3 font-heading text-text-primary truncate">
                            {content.title || "Untitled Content"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant={status.variant}>
                                {status.icon} {status.label}
                            </Badge>
                            <Badge variant="primary">
                                <TypeIcon size={12} className="mr-1" />
                                {typeLabels[content.content_type] ||
                                    content.content_type}
                            </Badge>
                            {content.subject_category && (
                                <Badge variant="default">
                                    <Tag size={12} className="mr-1" />
                                    {content.subject_category}
                                </Badge>
                            )}
                            {content.difficulty && (
                                <Badge
                                    variant={
                                        content.difficulty === "beginner"
                                            ? "success"
                                            : content.difficulty ===
                                                "intermediate"
                                              ? "warning"
                                              : "danger"
                                    }
                                >
                                    {content.difficulty}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Metadata Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {content.estimated_duration && (
                        <MetaStat
                            icon={Clock}
                            label="Duration"
                            value={`${content.estimated_duration} min`}
                        />
                    )}
                    {sections.length > 0 && (
                        <MetaStat
                            icon={Layers}
                            label="Sections"
                            value={sections.length}
                        />
                    )}
                    {content.total_pages && (
                        <MetaStat
                            icon={BookOpen}
                            label="Pages"
                            value={content.total_pages}
                        />
                    )}
                    {content.language && (
                        <MetaStat
                            icon={Globe}
                            label="Language"
                            value={content.language.toUpperCase()}
                        />
                    )}
                    {content.created_at && (
                        <MetaStat
                            icon={Calendar}
                            label="Uploaded"
                            value={new Date(
                                content.created_at,
                            ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        />
                    )}
                </div>

                {/* ── Failed Error ── */}
                {content.status === "failed" && content.error_message && (
                    <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-md-drd">
                        <AlertCircle
                            size={18}
                            className="text-danger shrink-0 mt-0.5"
                        />
                        <div>
                            <p className="text-sm font-medium text-danger">
                                Analysis Failed
                            </p>
                            <p className="text-caption text-text-muted mt-1">
                                {content.error_message}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Processing state ── */}
                {content.status === "processing" && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-md-drd">
                        <svg
                            className="animate-spin h-5 w-5 text-primary shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-primary-light">
                                AI is analyzing your content...
                            </p>
                            <p className="text-caption text-text-muted mt-0.5">
                                This may take up to 30 seconds. You can close
                                this modal — processing continues in the
                                background.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Sections List (Quest Map Preview) ── */}
                {sections.length > 0 && (
                    <div>
                        <h3 className="text-body-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                            Sections ({sections.length})
                        </h3>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 bg-dark-secondary rounded-md-drd border border-border/50 hover:border-border transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                        <span className="text-caption font-bold text-primary-light">
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary truncate">
                                            {section.title ||
                                                `Section ${idx + 1}`}
                                        </p>
                                        {section.summary && (
                                            <p className="text-caption text-text-muted truncate mt-0.5">
                                                {section.summary}
                                            </p>
                                        )}
                                    </div>
                                    {section.estimated_minutes && (
                                        <span className="text-caption text-text-disabled shrink-0">
                                            ~{section.estimated_minutes}m
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── AI Analysis Preview ── */}
                {analysis.summary && (
                    <div>
                        <h3 className="text-body-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            AI Summary
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed bg-dark-secondary p-4 rounded-md-drd border border-border/50">
                            {analysis.summary}
                        </p>
                    </div>
                )}

                {/* ── Keywords ── */}
                {analysis.keywords?.length > 0 && (
                    <div>
                        <h3 className="text-body-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.keywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-caption bg-primary/10 text-primary-light rounded-full"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Source URL ── */}
                {content.source_url && (
                    <div>
                        <h3 className="text-body-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Source
                        </h3>
                        <a
                            href={content.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-light hover:underline truncate block"
                        >
                            {content.source_url}
                        </a>
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                    {content.status === "ready" && (
                        <Button onClick={() => onStartLearning?.(content)}>
                            <Play size={16} className="mr-1.5" />
                            Start Learning
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

/** Small metadata stat card */
const MetaStat = ({ icon: Icon, label, value }) => (
    <div className="bg-dark-secondary p-3 rounded-md-drd border border-border/50">
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-text-muted" />
            <span className="text-[11px] text-text-muted uppercase tracking-wider">
                {label}
            </span>
        </div>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
);

export default ContentDetailModal;
