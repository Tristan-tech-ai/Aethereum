import React, {
    useState,
    useMemo,
    useCallback,
    useRef,
    useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Pin,
    ChevronDown,
    Loader2,
    LayoutGrid,
} from "lucide-react";
import KnowledgeCard, { tierConfig, subjectIcons } from "./KnowledgeCard";

/**
 * KnowledgeCardGrid — DRD §7.3 Cards Tab + Overview pinned grid.
 *
 * Features:
 *   - Filter bar: All | Bronze | Silver | Gold | Diamond + Subject dropdown + Sort
 *   - Responsive grid: 3-col desktop, 2-col tablet, 1-col mobile (DRD §11.2)
 *   - Pin interaction (📌 on click, max 6 pinned)
 *   - Infinite scroll pagination
 *   - Pinned section (6-card grid, 3×2 desktop / 2×3 mobile — DRD §7.3 Overview)
 */

const TIER_FILTERS = [
    { key: "all", label: "All", emoji: "🃏" },
    { key: "bronze", label: "Bronze", emoji: "🥉" },
    { key: "silver", label: "Silver", emoji: "🥈" },
    { key: "gold", label: "Gold", emoji: "🥇" },
    { key: "diamond", label: "Diamond", emoji: "💎" },
];

const SORT_OPTIONS = [
    { key: "date_desc", label: "Newest First" },
    { key: "date_asc", label: "Oldest First" },
    { key: "mastery_desc", label: "Highest Mastery" },
    { key: "mastery_asc", label: "Lowest Mastery" },
    { key: "title_asc", label: "A – Z" },
    { key: "title_desc", label: "Z – A" },
];

const MAX_PINNED = 6;
const PAGE_SIZE = 12;

/* ─── Filter / Sort Helpers ─── */
function filterCards(cards, { tierFilter, subjectFilter, searchQuery }) {
    return cards.filter((card) => {
        if (tierFilter !== "all" && card.tier !== tierFilter) return false;
        if (subjectFilter && card.subject !== subjectFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (
                !card.title?.toLowerCase().includes(q) &&
                !card.subject?.toLowerCase().includes(q)
            )
                return false;
        }
        return true;
    });
}

function sortCards(cards, sortKey) {
    const sorted = [...cards];
    switch (sortKey) {
        case "date_desc":
            return sorted.sort(
                (a, b) =>
                    new Date(b.created_at || 0) - new Date(a.created_at || 0),
            );
        case "date_asc":
            return sorted.sort(
                (a, b) =>
                    new Date(a.created_at || 0) - new Date(b.created_at || 0),
            );
        case "mastery_desc":
            return sorted.sort((a, b) => (b.mastery || 0) - (a.mastery || 0));
        case "mastery_asc":
            return sorted.sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
        case "title_asc":
            return sorted.sort((a, b) =>
                (a.title || "").localeCompare(b.title || ""),
            );
        case "title_desc":
            return sorted.sort((a, b) =>
                (b.title || "").localeCompare(a.title || ""),
            );
        default:
            return sorted;
    }
}

/* ─── Pinned Cards Section ─── */
const PinnedSection = ({ cards, onCardClick, onPinToggle }) => {
    if (!cards || cards.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Pin size={16} className="text-primary-light" />
                <h3 className="text-h4 font-heading text-text-primary">
                    Pinned Cards
                </h3>
                <span className="text-caption text-text-muted">
                    ({cards.length}/{MAX_PINNED})
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="flex justify-center"
                    >
                        <KnowledgeCard
                            title={card.title}
                            subject={card.subject || card.subject_category}
                            mastery={card.mastery || card.mastery_percentage}
                            tier={card.tier}
                            quizScore={card.quiz_score || card.quiz_avg_score}
                            focusScore={
                                card.focus_score || card.focus_integrity
                            }
                            timeSpent={card.time_spent || card.time_invested}
                            pinned
                            likes={card.likes || 0}
                            onClick={() => onCardClick?.(card)}
                            onPinToggle={() => onPinToggle?.(card)}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/* ─── Subject Dropdown ─── */
const SubjectDropdown = ({ value, onChange, subjects }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm text-text-secondary bg-dark-secondary
          border border-border rounded-sm-drd hover:border-border-hover transition-colors"
            >
                {value
                    ? (subjectIcons[value]?.emoji || "📚") + " " + value
                    : "Subject"}
                <ChevronDown
                    size={14}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 z-30 w-52 bg-dark-elevated border border-border rounded-md-drd
              shadow-lg-drd overflow-hidden"
                    >
                        <button
                            onClick={() => {
                                onChange("");
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-body-sm hover:bg-white/5 transition-colors
                ${!value ? "text-primary-light" : "text-text-secondary"}`}
                        >
                            All Subjects
                        </button>
                        {subjects.map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    onChange(s);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-body-sm hover:bg-white/5 transition-colors
                  ${value === s ? "text-primary-light" : "text-text-secondary"}`}
                            >
                                {subjectIcons[s]?.emoji || "📚"} {s}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Sort Dropdown ─── */
const SortDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const current = SORT_OPTIONS.find((o) => o.key === value);
    const isDesc = value.endsWith("_desc");

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm text-text-secondary bg-dark-secondary
          border border-border rounded-sm-drd hover:border-border-hover transition-colors"
            >
                {isDesc ? <SortDesc size={14} /> : <SortAsc size={14} />}
                {current?.label || "Sort"}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 z-30 w-44 bg-dark-elevated border border-border rounded-md-drd
              shadow-lg-drd overflow-hidden"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => {
                                    onChange(opt.key);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-body-sm hover:bg-white/5 transition-colors
                  ${value === opt.key ? "text-primary-light" : "text-text-secondary"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Main Grid ─── */
const KnowledgeCardGrid = ({
    cards = [],
    onCardClick,
    onPinToggle,
    showPinnedSection = true,
    loading = false,
    emptyMessage = "No Knowledge Cards yet. Complete a learning session to earn your first card!",
    className = "",
}) => {
    const [tierFilter, setTierFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [sortKey, setSortKey] = useState("date_desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef(null);

    // Unique subjects from cards
    const subjects = useMemo(
        () =>
            [
                ...new Set(
                    cards
                        .map((c) => c.subject || c.subject_category)
                        .filter(Boolean),
                ),
            ].sort(),
        [cards],
    );

    // Pinned cards (max 6)
    const pinnedCards = useMemo(
        () => cards.filter((c) => c.is_pinned || c.pinned).slice(0, MAX_PINNED),
        [cards],
    );

    // Filtered + sorted list (exclude pinned from main grid if showing pinned section)
    const processedCards = useMemo(() => {
        const filterable = showPinnedSection
            ? cards.filter((c) => !(c.is_pinned || c.pinned))
            : cards;
        const filtered = filterCards(filterable, {
            tierFilter,
            subjectFilter,
            searchQuery,
        });
        return sortCards(filtered, sortKey);
    }, [
        cards,
        tierFilter,
        subjectFilter,
        searchQuery,
        sortKey,
        showPinnedSection,
    ]);

    const visibleCards = processedCards.slice(0, visibleCount);
    const hasMore = visibleCount < processedCards.length;

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((prev) =>
                        Math.min(prev + PAGE_SIZE, processedCards.length),
                    );
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, processedCards.length]);

    // Reset visible count on filter change
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [tierFilter, subjectFilter, searchQuery, sortKey]);

    const handlePinToggle = useCallback(
        (card) => {
            const isPinned = card.is_pinned || card.pinned;
            if (!isPinned && pinnedCards.length >= MAX_PINNED) return; // max 6
            onPinToggle?.(card);
        },
        [pinnedCards.length, onPinToggle],
    );

    return (
        <div className={`w-full max-w-card-grid mx-auto ${className}`}>
            {/* Pinned section (DRD §7.3 Overview — 6-card grid) */}
            {showPinnedSection && (
                <PinnedSection
                    cards={pinnedCards}
                    onCardClick={onCardClick}
                    onPinToggle={handlePinToggle}
                />
            )}

            {/* Filter bar (DRD §7.3 Cards Tab) */}
            <div className="mb-6 space-y-3">
                {/* Tier pills */}
                <div className="flex flex-wrap items-center gap-2">
                    {TIER_FILTERS.map((tf) => (
                        <button
                            key={tf.key}
                            onClick={() => setTierFilter(tf.key)}
                            className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors border
                ${
                    tierFilter === tf.key
                        ? "bg-primary/15 text-primary-light border-primary/30"
                        : "bg-dark-secondary text-text-muted border-border hover:border-border-hover hover:text-text-secondary"
                }`}
                        >
                            {tf.emoji} {tf.label}
                        </button>
                    ))}
                </div>

                {/* Search + Subject + Sort */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                            type="text"
                            placeholder="Search cards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-body-sm text-text-primary bg-dark-secondary
                border border-border rounded-sm-drd placeholder:text-text-muted
                focus:outline-none focus:border-border-focus transition-colors"
                        />
                    </div>
                    <SubjectDropdown
                        value={subjectFilter}
                        onChange={setSubjectFilter}
                        subjects={subjects}
                    />
                    <SortDropdown value={sortKey} onChange={setSortKey} />
                    <span className="text-caption text-text-muted ml-auto">
                        {processedCards.length} card
                        {processedCards.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Card grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2
                        size={24}
                        className="text-primary-light animate-spin"
                    />
                    <span className="ml-2 text-text-muted">
                        Loading cards...
                    </span>
                </div>
            ) : processedCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <LayoutGrid size={40} className="text-text-muted mb-3" />
                    <p className="text-text-muted max-w-sm">{emptyMessage}</p>
                </div>
            ) : (
                <>
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center"
                    >
                        <AnimatePresence mode="popLayout">
                            {visibleCards.map((card, i) => (
                                <motion.div
                                    key={card.id || i}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: Math.min(i * 0.03, 0.3),
                                    }}
                                >
                                    <KnowledgeCard
                                        title={card.title}
                                        subject={
                                            card.subject ||
                                            card.subject_category
                                        }
                                        mastery={
                                            card.mastery ||
                                            card.mastery_percentage
                                        }
                                        tier={card.tier}
                                        quizScore={
                                            card.quiz_score ||
                                            card.quiz_avg_score
                                        }
                                        focusScore={
                                            card.focus_score ||
                                            card.focus_integrity
                                        }
                                        timeSpent={
                                            card.time_spent ||
                                            card.time_invested
                                        }
                                        pinned={card.is_pinned || card.pinned}
                                        likes={card.likes || 0}
                                        onClick={() => onCardClick?.(card)}
                                        onPinToggle={() =>
                                            handlePinToggle(card)
                                        }
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Infinite scroll sentinel */}
                    {hasMore && (
                        <div
                            ref={sentinelRef}
                            className="flex items-center justify-center py-6"
                        >
                            <Loader2
                                size={20}
                                className="text-text-muted animate-spin"
                            />
                            <span className="ml-2 text-caption text-text-muted">
                                Loading more...
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default KnowledgeCardGrid;
