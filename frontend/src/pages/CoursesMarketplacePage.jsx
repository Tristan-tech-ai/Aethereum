import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    X,
    Star,
    Crown,
    Zap,
    BookOpen,
    Clock,
    Users,
    Globe,
    ShoppingCart,
    CheckCircle2,
    Loader2,
    Filter,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Play,
    Lock,
    Coins,
    Gift,
    Sparkles,
    TrendingUp,
    FileText,
    Youtube,
    Image,
    Presentation,
    LayoutGrid,
    List,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceStore } from "../stores/marketplaceStore";
import { useAuthStore } from "../stores/authStore";

// ─── Constants ───────────────────────────────────────────────────────────────

const SUBJECTS = [
    "Computer Science", "Mathematics", "Physics", "Chemistry",
    "Biology", "Economics", "Philosophy", "History", "Engineering",
    "Business", "Art", "Language", "Literature", "Music", "Other",
];

const SORT_OPTIONS = [
    { value: "recent", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
];

const TYPE_TABS = [
    { value: "", label: "All Courses", icon: Globe },
    { value: "free", label: "Free", icon: Gift },
    { value: "paid", label: "Paid", icon: Coins },
    { value: "pro", label: "Pro", icon: Crown },
];

const typeIcons = {
    pdf: FileText,
    youtube: Youtube,
    article: Globe,
    image: Image,
    pptx: Presentation,
};

const typeColors = {
    pdf: "text-red-400",
    youtube: "text-red-500",
    article: "text-cyan-400",
    image: "text-emerald-400",
    pptx: "text-amber-400",
};

const difficultyConfig = {
    beginner: { label: "Beginner", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    intermediate: { label: "Intermediate", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    advanced: { label: "Advanced", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

const CoinBadge = ({ amount, size = "sm", className = "" }) => (
    <span className={`inline-flex items-center gap-1 font-semibold font-mono ${
        size === "lg" ? "text-base" : "text-xs"
    } ${className}`}>
        <Zap size={size === "lg" ? 16 : 12} className="text-amber-400" />
        <span className="text-amber-400">{amount.toLocaleString()}</span>
    </span>
);

const ProBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
        bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30
        text-amber-400 uppercase tracking-wider">
        <Crown size={9} />
        PRO
    </span>
);

const FreeBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
        bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
        FREE
    </span>
);

// ─── Course Card ─────────────────────────────────────────────────────────────

const CourseCard = ({ course, onBuy, onView }) => {
    const TypeIcon = typeIcons[course.content_type] ?? FileText;
    const diff = difficultyConfig[course.difficulty] ?? difficultyConfig.beginner;

    const isPro = course.is_pro;
    const isFree = !isPro && course.coin_price === 0;
    const isPurchased = course.is_purchased;
    const isOwner = course.is_owner;
    const canAccess = course.can_access;

    return (
        <motion.div
            variants={fadeUp}
            className={`group relative flex flex-col rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200
                hover:translate-y-[-2px] hover:shadow-xl
                ${isPro
                    ? "bg-gradient-to-b from-[#1a1230] to-dark-card border-amber-500/25 hover:border-amber-500/50 hover:shadow-amber-500/10"
                    : "bg-dark-card border-border-subtle hover:border-primary/30 hover:shadow-primary/5"
                }`}
            onClick={() => onView(course)}
        >
            {/* Thumbnail / Header */}
            <div className={`relative h-36 flex items-center justify-center shrink-0 overflow-hidden
                ${isPro ? "bg-gradient-to-br from-amber-900/20 via-dark-secondary to-dark-card" : "bg-dark-secondary/60"}`}
            >
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title}
                        className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                        <TypeIcon size={36} className={typeColors[course.content_type] ?? "text-text-muted"} />
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {isPro && <ProBadge />}
                    {isFree && !isPro && <FreeBadge />}
                </div>

                {/* Owned indicator */}
                {(isPurchased || isOwner) && (
                    <div className="absolute bottom-2 right-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                            bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 size={9} /> {isOwner ? "Yours" : "Owned"}
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                {/* Subject + Type */}
                <div className="flex items-center gap-2 flex-wrap">
                    {course.subject_icon && (
                        <span className="text-sm">{course.subject_icon}</span>
                    )}
                    <span className="text-caption text-text-muted truncate">{course.subject_category ?? "General"}</span>
                    <span className="ml-auto">
                        <TypeIcon size={13} className={typeColors[course.content_type] ?? "text-text-muted"} />
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug flex-1">
                    {course.title}
                </h3>

                {/* Author */}
                {course.author && (
                    <p className="text-caption text-text-muted">
                        by <span className="text-text-secondary">@{course.author.username ?? course.author.name}</span>
                    </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 text-caption text-text-muted flex-wrap">
                    {course.estimated_duration && (
                        <span className="flex items-center gap-1">
                            <Clock size={11} />{Math.round(course.estimated_duration / 60)}h
                        </span>
                    )}
                    {course.total_pages && (
                        <span className="flex items-center gap-1">
                            <BookOpen size={11} />{course.total_pages}p
                        </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${diff.color}`}>
                        {diff.label}
                    </span>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                    {isFree ? (
                        <FreeBadge />
                    ) : (
                        <CoinBadge amount={course.coin_price} />
                    )}

                    {canAccess ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(course); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                bg-primary/15 hover:bg-primary/25 border border-primary/20 hover:border-primary/40
                                text-primary-light text-xs font-semibold transition-all"
                        >
                            <Play size={11} /> Open
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onBuy(course); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                ${isPro
                                    ? "bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 hover:border-amber-500/50 text-amber-400"
                                    : "bg-primary/15 hover:bg-primary/25 border border-primary/20 hover:border-primary/40 text-primary-light"
                                }`}
                        >
                            <ShoppingCart size={11} /> Buy
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Purchase Modal ───────────────────────────────────────────────────────────

const PurchaseModal = ({ course, userBalance, onConfirm, onClose, purchasing }) => {
    if (!course) return null;

    const hasEnough = (userBalance ?? 0) >= course.coin_price;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    className={`relative w-full max-w-md rounded-2xl border p-6 shadow-xl
                        ${course.is_pro
                            ? "bg-gradient-to-b from-[#1a1230] to-dark-card border-amber-500/25"
                            : "bg-dark-secondary border-border-default"
                        }`}
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                >
                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="flex items-start gap-4 mb-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                            ${course.is_pro ? "bg-amber-500/15" : "bg-primary/15"}`}>
                            {course.is_pro ? <Crown size={24} className="text-amber-400" /> : <ShoppingCart size={24} className="text-primary-light" />}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-text-primary mb-0.5">
                                {course.is_pro ? "Unlock Pro Course" : "Purchase Course"}
                            </h3>
                            <p className="text-sm text-text-secondary line-clamp-2">{course.title}</p>
                        </div>
                    </div>

                    {/* Course info */}
                    <div className="rounded-xl border border-border-subtle bg-dark-card p-4 mb-5 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Subject</span>
                            <span className="text-text-primary font-medium">{course.subject_category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Difficulty</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${difficultyConfig[course.difficulty]?.color}`}>
                                {difficultyConfig[course.difficulty]?.label}
                            </span>
                        </div>
                        {course.estimated_duration && (
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Duration</span>
                                <span className="text-text-primary">{Math.round(course.estimated_duration / 60)}h</span>
                            </div>
                        )}
                        <div className="border-t border-border-subtle pt-3 flex justify-between">
                            <span className="text-text-muted text-sm">Course Price</span>
                            <CoinBadge amount={course.coin_price} size="lg" />
                        </div>
                    </div>

                    {/* Balance check */}
                    <div className={`rounded-xl border p-3.5 mb-5 flex items-center justify-between text-sm
                        ${hasEnough
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-red-500/5 border-red-500/20"
                        }`}>
                        <span className="text-text-secondary flex items-center gap-1.5">
                            <Zap size={14} className="text-amber-400" /> Your Balance
                        </span>
                        <div className="flex items-center gap-2">
                            <CoinBadge amount={userBalance ?? 0} size="lg" />
                            {!hasEnough && (
                                <span className="text-red-400 text-xs font-medium flex items-center gap-1">
                                    <AlertCircle size={12} /> Not enough
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(course.id)}
                            disabled={!hasEnough || purchasing}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                                ${course.is_pro
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                    : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                }`}
                        >
                            {purchasing ? (
                                <><Loader2 size={16} className="animate-spin" /> Processing...</>
                            ) : (
                                <><Zap size={16} /> Confirm Purchase</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CoursesMarketplacePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        courses,
        purchasedCourses,
        loading,
        purchasedLoading,
        purchasing,
        error,
        purchaseError,
        pagination,
        userBalance,
        filters,
        fetchCourses,
        fetchPurchased,
        fetchWalletBalance,
        purchaseCourse,
        setFilter,
        resetFilters,
    } = useMarketplaceStore();

    const [searchInput, setSearchInput] = useState(filters.q ?? "");
    const [showFilters, setShowFilters] = useState(false);
    const [buyModal, setBuyModal] = useState(null); // course being purchased
    const [successToast, setSuccessToast] = useState(null);
    const [activeTab, setActiveTab] = useState("browse"); // "browse" | "purchased"

    // Initial load
    useEffect(() => {
        fetchCourses(1);
        fetchWalletBalance();
    }, []);

    // Refetch when filters change (except q which is debounced)
    useEffect(() => {
        fetchCourses(1);
    }, [filters.type, filters.subject, filters.difficulty, filters.sort]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilter("q", searchInput);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Refetch when q changes
    useEffect(() => {
        fetchCourses(1);
    }, [filters.q]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "purchased") fetchPurchased();
    };

    const handleBuy = (course) => {
        setBuyModal(course);
    };

    const handleView = (course) => {
        if (course.can_access || course.is_purchased || course.is_owner) {
            navigate(`/course/${course.id}`);
        } else {
            setBuyModal(course);
        }
    };

    const handleConfirmPurchase = async (courseId) => {
        const result = await purchaseCourse(courseId);
        if (result.success) {
            setBuyModal(null);
            setSuccessToast(`Course purchased! -${result.coins_spent} coins`);
            setTimeout(() => setSuccessToast(null), 3000);
        }
    };

    const handlePageChange = (page) => {
        fetchCourses(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Derived
    const activeFilterCount = [filters.type, filters.subject, filters.difficulty]
        .filter(Boolean).length;

    // Pro courses for featured section
    const proCourses = useMemo(
        () => courses.filter((c) => c.is_pro).slice(0, 3),
        [courses]
    );

    const displayCourses = activeTab === "purchased" ? purchasedCourses : courses;

    return (
        <div className="max-w-page mx-auto px-4 lg:px-8 py-6 space-y-8">
            {/* ═══ Header ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Globe size={18} className="text-white" />
                        </div>
                        Course Marketplace
                    </h1>
                    <p className="text-sm text-text-secondary mt-1 ml-[46px]">
                        Discover and unlock courses with Nexera coins
                    </p>
                </div>

                {/* Wallet Balance */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Zap size={16} className="text-amber-400" />
                        <div>
                            <p className="text-[10px] text-amber-400/70 font-mono uppercase tracking-wider leading-none">Balance</p>
                            <p className="text-base font-bold text-amber-400 font-mono leading-tight">
                                {userBalance === null ? "…" : userBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══ Pro Featured Banner (only on browse tab when no type filter) ═══ */}
            {activeTab === "browse" && !filters.type && proCourses.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-2xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-[#1a1230] via-dark-secondary to-dark-card"
                >
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary/5 blur-3xl" />
                    </div>

                    <div className="relative p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Crown size={18} className="text-amber-400" />
                            <h2 className="text-base font-bold text-amber-400">Featured Pro Courses</h2>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                                Expert Content
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {proCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => handleView(course)}
                                    className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/15 bg-amber-500/5
                                        hover:border-amber-500/30 hover:bg-amber-500/10 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                                        <span className="text-lg">{course.subject_icon ?? "📚"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug">
                                            {course.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CoinBadge amount={course.coin_price} />
                                            {course.can_access && (
                                                <span className="text-[9px] text-emerald-400 font-semibold">OWNED</span>
                                            )}
                                        </div>
                                    </div>
                                    {!course.can_access && (
                                        <Lock size={13} className="text-amber-400/50 group-hover:text-amber-400 transition-colors shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ═══ Tabs ═══ */}
            <div className="flex items-center gap-1 border-b border-border-subtle">
                {[
                    { id: "browse", label: "Browse", icon: Globe },
                    { id: "purchased", label: "My Courses", icon: CheckCircle2 },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => handleTabChange(id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px
                            ${activeTab === id
                                ? "border-primary text-primary-light"
                                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"
                            }`}
                    >
                        <Icon size={15} /> {label}
                        {id === "purchased" && purchasedCourses.length > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary-light">
                                {purchasedCourses.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ═══ Search + Filters (browse tab only) ═══ */}
            {activeTab === "browse" && (
                <div className="space-y-3">
                    {/* Search bar + filter toggle */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search courses by title or subject..."
                                className="w-full pl-10 pr-10 py-2.5 bg-dark-card border border-border-subtle rounded-xl text-sm text-text-primary
                                    placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilter("sort", e.target.value)}
                            className="px-3 py-2.5 bg-dark-card border border-border-subtle rounded-xl text-sm text-text-primary
                                focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                                ${showFilters || activeFilterCount > 0
                                    ? "bg-primary/10 border-primary/30 text-primary-light"
                                    : "bg-dark-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default"
                                }`}
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-light">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Type tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {TYPE_TABS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setFilter("type", filters.type === value ? "" : value)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                                    ${filters.type === value
                                        ? value === "pro"
                                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                            : value === "free"
                                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                            : "bg-primary/15 border-primary/30 text-primary-light"
                                        : "bg-dark-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default"
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Advanced filters panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-dark-card rounded-xl border border-border-subtle">
                                    {/* Subject filter */}
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted mb-1.5 block font-medium">Subject</label>
                                        <select
                                            value={filters.subject}
                                            onChange={(e) => setFilter("subject", e.target.value)}
                                            className="w-full px-3 py-2 bg-dark-secondary border border-border-subtle rounded-lg text-sm text-text-primary
                                                focus:outline-none focus:border-primary/50 cursor-pointer"
                                        >
                                            <option value="">All Subjects</option>
                                            {SUBJECTS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Difficulty filter */}
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted mb-1.5 block font-medium">Difficulty</label>
                                        <select
                                            value={filters.difficulty}
                                            onChange={(e) => setFilter("difficulty", e.target.value)}
                                            className="w-full px-3 py-2 bg-dark-secondary border border-border-subtle rounded-lg text-sm text-text-primary
                                                focus:outline-none focus:border-primary/50 cursor-pointer"
                                        >
                                            <option value="">All Levels</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>

                                    {/* Reset */}
                                    {activeFilterCount > 0 && (
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => { resetFilters(); setSearchInput(""); }}
                                                className="px-4 py-2 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default text-sm transition-all"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ═══ Course Grid ═══ */}
            <section>
                {/* Header row */}
                {activeTab === "browse" && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-text-secondary">
                            {loading ? (
                                <span className="flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Loading courses...</span>
                            ) : (
                                <span>{pagination.total.toLocaleString()} course{pagination.total !== 1 ? "s" : ""} found</span>
                            )}
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-2 mb-4">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && courses.length === 0 && (
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" variants={stagger} initial="hidden" animate="show">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-border-subtle bg-dark-card overflow-hidden animate-pulse">
                                <div className="h-36 bg-dark-secondary" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-dark-secondary rounded w-3/4" />
                                    <div className="h-3 bg-dark-secondary rounded w-1/2" />
                                    <div className="h-3 bg-dark-secondary rounded w-2/3" />
                                    <div className="h-8 bg-dark-secondary rounded mt-2" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Purchased tab content */}
                {activeTab === "purchased" && (
                    purchasedLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 size={28} className="animate-spin text-primary" />
                        </div>
                    ) : purchasedCourses.length === 0 ? (
                        <div className="flex flex-col items-center py-20 gap-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-dark-card border border-border-subtle flex items-center justify-center">
                                <ShoppingCart size={28} className="text-text-muted" />
                            </div>
                            <div>
                                <p className="text-text-primary font-semibold">No Purchased Courses</p>
                                <p className="text-sm text-text-muted mt-1">Browse the marketplace to find courses to unlock.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab("browse")}
                                className="px-5 py-2.5 rounded-xl bg-primary/15 border border-primary/25 text-primary-light text-sm font-semibold hover:bg-primary/25 transition-all"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            variants={stagger} initial="hidden" animate="show"
                        >
                            {purchasedCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onBuy={handleBuy}
                                    onView={handleView}
                                />
                            ))}
                        </motion.div>
                    )
                )}

                {/* Browse tab course grid */}
                {activeTab === "browse" && !loading && courses.length === 0 && (
                    <div className="flex flex-col items-center py-20 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-dark-card border border-border-subtle flex items-center justify-center">
                            <Search size={28} className="text-text-muted" />
                        </div>
                        <div>
                            <p className="text-text-primary font-semibold">No courses found</p>
                            <p className="text-sm text-text-muted mt-1">Try adjusting your filters or search query.</p>
                        </div>
                        <button
                            onClick={() => { resetFilters(); setSearchInput(""); }}
                            className="px-5 py-2.5 rounded-xl bg-dark-card border border-border-subtle text-text-secondary text-sm font-medium hover:text-text-primary transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {activeTab === "browse" && courses.length > 0 && (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        variants={stagger} initial="hidden" animate="show"
                    >
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onBuy={handleBuy}
                                onView={handleView}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {activeTab === "browse" && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            disabled={pagination.current_page <= 1}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-subtle text-sm text-text-secondary
                                hover:text-text-primary hover:border-border-default disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={15} /> Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                                            ${pagination.current_page === page
                                                ? "bg-primary text-white"
                                                : "text-text-secondary hover:text-text-primary hover:bg-dark-card border border-border-subtle"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={pagination.current_page >= pagination.last_page}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-subtle text-sm text-text-secondary
                                hover:text-text-primary hover:border-border-default disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </section>

            {/* ═══ Purchase Modal ═══ */}
            {buyModal && (
                <PurchaseModal
                    course={buyModal}
                    userBalance={userBalance}
                    onConfirm={handleConfirmPurchase}
                    onClose={() => setBuyModal(null)}
                    purchasing={purchasing}
                />
            )}

            {/* ═══ Purchase Error Toast ═══ */}
            <AnimatePresence>
                {purchaseError && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
                            bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium shadow-lg"
                    >
                        <AlertCircle size={16} /> {purchaseError}
                    </motion.div>
                )}
                {successToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
                            bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium shadow-lg"
                    >
                        <CheckCircle2 size={16} /> {successToast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoursesMarketplacePage;
