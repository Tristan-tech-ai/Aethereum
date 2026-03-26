import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Upload,
    FileText,
    Youtube,
    Globe,
    Image,
    Presentation,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Brain,
    BookOpen,
    Layers,
    Zap,
    ArrowRight,
    X,
    Clock,
    BarChart3,
    RefreshCw,
    Eye,
    Loader2,
    Play,
    Terminal,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContentStore } from "../stores/contentStore";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Background AI processing messages — simulates what the server is actually doing
const AI_PROCESSING_STEPS = [
    { text: "✓ File received by server", type: "success" },
    { text: "Reading and parsing document structure...", type: "info" },
    { text: "Extracting text content from material...", type: "info" },
    { text: "Cleaning and normalizing extracted text...", type: "info" },
    { text: "Connecting to Gemini 2.5 Flash AI...", type: "info" },
    { text: "AI analyzing subject matter and scope...", type: "info" },
    { text: "Identifying key concepts and themes...", type: "info" },
    { text: "Classifying subject category and difficulty...", type: "info" },
    { text: "Structuring content into learning sections...", type: "info" },
    { text: "✓ Learning sections identified", type: "success" },
    { text: "Generating quiz questions for Section 1...", type: "info" },
    { text: "Generating quiz questions for Section 2...", type: "info" },
    { text: "Generating quiz questions for Section 3...", type: "info" },
    { text: "✓ Quiz questions validated", type: "success" },
    { text: "Building knowledge profile tags...", type: "info" },
    { text: "Finalizing course metadata...", type: "info" },
    { text: "Almost ready...", type: "info" },
];
const ACTIVE_GENERATION_KEY = "nexera_active_generation_id";
const ACCEPTED_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};
const ACCEPT_STRING = ".pdf,.png,.jpg,.jpeg,.pptx";

const supportedFormats = [
    { icon: FileText, label: "PDF", desc: "Documents & papers", color: "#EF4444" },
    { icon: Youtube, label: "YouTube", desc: "Video lectures & tutorials", color: "#FF0000" },
    { icon: Globe, label: "Web Article", desc: "Blog posts & articles", color: "#06B6D4" },
    { icon: Image, label: "Image", desc: "Diagrams & notes", color: "#22C55E" },
    { icon: Presentation, label: "PowerPoint", desc: "Slide presentations", color: "#F59E0B" },
];

const pipelineSteps = [
    { icon: Upload, label: "Upload", desc: "Drop your material" },
    { icon: Brain, label: "AI Analysis", desc: "Gemini 2.0 Flash" },
    { icon: Layers, label: "Structure", desc: "5–7 learning sections" },
    { icon: Zap, label: "Quizzes", desc: "Auto-generated" },
    { icon: BookOpen, label: "Ready", desc: "Start learning!" },
];

const typeIcons = { pdf: FileText, youtube: Youtube, article: Globe, image: Image, pptx: Presentation };
const typeColors = { pdf: "#EF4444", youtube: "#FF0000", article: "#06B6D4", image: "#22C55E", pptx: "#F59E0B" };

/* ═══════════════════════════════════════════
   GENERATE COURSE PAGE
   ═══════════════════════════════════════════ */

const GenerateCoursePage = () => {
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [uploadResult, setUploadResult] = useState(null);
    const [activeGenerationId, setActiveGenerationId] = useState(
        () => localStorage.getItem(ACTIVE_GENERATION_KEY) || null
    );
    const fileInputRef = useRef(null);

    // Processing log state
    const [logMessages, setLogMessages] = useState([]);
    const logTimerRef = useRef(null);
    const aiStepRef = useRef(0);
    const aiPhaseStartedRef = useRef(false);
    const logScrollRef = useRef(null);
    const statusCheckTimerRef = useRef(null);

    const { contents, uploading, uploadProgress, uploadFile, uploadUrl, fetchContents, fetchContent, startPolling, stopPolling } = useContentStore();

    // Fetch recent content on mount
    useEffect(() => {
        fetchContents(1);
    }, []);

    // Auto-poll any processing items
    useEffect(() => {
        contents.filter(c => c.status === "processing").forEach(c => startPolling(c.id));
    }, [contents]);

    // Resume polling after navigating away/back
    useEffect(() => {
        if (!activeGenerationId) return;
        startPolling(activeGenerationId);
    }, [activeGenerationId, startPolling]);

    // ── Processing Log: watch upload lifecycle ──
    const prevUploadingRef = useRef(false);
    useEffect(() => {
        const started = uploading && !prevUploadingRef.current;
        prevUploadingRef.current = uploading;

        if (started) {
            // Reset log for new upload
            setLogMessages([{ id: 0, text: "Preparing upload...", type: "info" }]);
            aiStepRef.current = 0;
            aiPhaseStartedRef.current = false;
        }
        // NOTE: intentionally NOT clearing the interval when uploading stops.
        // The API returns 201 fast (job dispatched to queue) so we keep
        // the terminal alive until uploadResult is set by handleSubmit.
    }, [uploading]);

    // ── Processing Log: start AI cycling ──
    // File uploads: starts when file bytes finish (progress=100).
    // URL uploads: starts immediately (no progress events).
    const prevProgressRef = useRef(0);
    useEffect(() => {
        if (!uploading) { prevProgressRef.current = 0; return; }

        const shouldStart = !aiPhaseStartedRef.current && (
            uploadProgress >= 100 ||
            (uploadProgress === 0 && prevProgressRef.current === 0)
        );

        if (shouldStart) {
            aiPhaseStartedRef.current = true;
            const isFileUpload = uploadProgress >= 100;
            setLogMessages(prev => [
                ...prev,
                isFileUpload
                    ? { id: Date.now(), text: "✓ File transferred to server", type: "success" }
                    : { id: Date.now(), text: "Sending to server...", type: "info" },
                { id: Date.now() + 1, text: "Extracting content from document...", type: "info" },
            ]);
            aiStepRef.current = 0;
            logTimerRef.current = setInterval(() => {
                const step = AI_PROCESSING_STEPS[aiStepRef.current];
                if (step) {
                    setLogMessages(prev => [...prev, { id: Date.now() + aiStepRef.current, ...step }]);
                    aiStepRef.current++;
                }
                // When all steps are done: DON'T self-clear.
                // The blinking cursor keeps showing the terminal is active.
                // The interval will be cleared only when uploadResult arrives.
            }, 3000);
        }
        prevProgressRef.current = uploadProgress;
    }, [uploadProgress, uploading]);

    // Cleanup interval on unmount
    useEffect(() => () => { if (logTimerRef.current) clearInterval(logTimerRef.current); }, []);

    // Keep processing log alive while backend job is still running, even if user
    // moved away from this page and came back later.
    // IMPORTANT: completion detection must query by content id directly; relying
    // only on `contents` can miss active item after list replacement/filtering.
    useEffect(() => {
        if (!activeGenerationId) return;

        const ensureLiveLog = () => {
            if (logMessages.length === 0) {
                setLogMessages([
                    { id: Date.now(), text: "Resuming generation status...", type: "info" },
                    { id: Date.now() + 1, text: "AI processing still running on server queue...", type: "info" },
                ]);
            }
            if (!logTimerRef.current) {
                logTimerRef.current = setInterval(() => {
                    const step = AI_PROCESSING_STEPS[aiStepRef.current % AI_PROCESSING_STEPS.length];
                    if (step) {
                        setLogMessages(prev => [...prev, { id: Date.now() + aiStepRef.current, ...step }]);
                        aiStepRef.current++;
                    }
                }, 3000);
            }
        };

        const finalize = (active) => {
            if (logTimerRef.current) {
                clearInterval(logTimerRef.current);
                logTimerRef.current = null;
            }
            if (statusCheckTimerRef.current) {
                clearInterval(statusCheckTimerRef.current);
                statusCheckTimerRef.current = null;
            }
            stopPolling(activeGenerationId);
            localStorage.removeItem(ACTIVE_GENERATION_KEY);
            setActiveGenerationId(null);

            if (active?.status === "ready") {
                setUploadResult({ success: true, message: "Course generated successfully!" });
            } else if (active?.status === "failed") {
                setUploadResult({ success: false, message: active.error_message || "Course generation failed." });
            }
        };

        const checkStatus = async () => {
            const active = await fetchContent(activeGenerationId);
            if (!active) return;

            if (active.status === "processing") {
                ensureLiveLog();
                return;
            }
            finalize(active);
        };

        // Immediate check + periodic checks while active
        checkStatus();
        statusCheckTimerRef.current = setInterval(checkStatus, 3000);

        return () => {
            if (statusCheckTimerRef.current) {
                clearInterval(statusCheckTimerRef.current);
                statusCheckTimerRef.current = null;
            }
        };
    }, [activeGenerationId, fetchContent, logMessages.length, stopPolling]);

    // ── Processing Log: scroll to bottom on new messages ──
    useEffect(() => {
        if (logScrollRef.current) {
            logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
        }
    }, [logMessages]);

    // ── Processing Log: show completion message ──
    const prevUploadResultRef = useRef(null);
    useEffect(() => {
        if (!uploadResult || uploadResult === prevUploadResultRef.current) return;
        prevUploadResultRef.current = uploadResult;
        if (logTimerRef.current) { clearInterval(logTimerRef.current); logTimerRef.current = null; }
        if (uploadResult.success) {
            setLogMessages(prev => [
                ...prev,
                { id: Date.now(), text: "✓ Course generated successfully!", type: "success" },
                { id: Date.now() + 1, text: "Your course is ready to study in the library.", type: "success" },
            ]);
        } else {
            setLogMessages(prev => [
                ...prev,
                { id: Date.now(), text: `✗ ${uploadResult.message}`, type: "error" },
            ]);
        }
    }, [uploadResult]);

    // Derived stats from real data
    const recentGenerations = contents.slice(0, 4);
    const totalCourses = contents.length;
    const totalSections = contents.reduce((sum, c) => sum + (c.structured_sections?.length ?? 0), 0);
    const totalQuizzes = contents.reduce((sum, c) => sum + (c.quiz_count ?? 0), 0);
    const readyContents = contents.filter(c => c.status === "ready");

    /* ── URL type detection ── */
    const detectUrlType = (inputUrl) => {
        if (!inputUrl) return null;
        if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be")) return "youtube";
        try { new URL(inputUrl); return "article"; }
        catch { return null; }
    };
    const urlType = url ? detectUrlType(url) : null;

    /* ── File validation ── */
    const validateFile = useCallback((f) => {
        if (!f) return "";
        if (f.size > MAX_FILE_SIZE) return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 20 MB.`;
        const ext = f.name.split(".").pop().toLowerCase();
        if (!["pdf", "png", "jpg", "jpeg", "pptx"].includes(ext)) return `Unsupported file type (.${ext}).`;
        return "";
    }, []);

    /* ── Drag & Drop ── */
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            const err = validateFile(droppedFile);
            setFileError(err);
            if (!err) { setFile(droppedFile); setUrl(""); }
        }
    };
    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            const err = validateFile(selected);
            setFileError(err);
            if (!err) { setFile(selected); setUrl(""); }
        }
        e.target.value = "";
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        setUploadResult(null);
        setLogMessages([]);
        prevUploadResultRef.current = null;
        let result;
        if (file) result = await uploadFile(file, title);
        else if (url) result = await uploadUrl(url, title);
        else return;

        if (result?.success) {
            const contentId = result?.content?.id;
            if (contentId) {
                localStorage.setItem(ACTIVE_GENERATION_KEY, String(contentId));
                setActiveGenerationId(String(contentId));
                startPolling(contentId);
            }
            setLogMessages(prev => [
                ...prev,
                { id: Date.now(), text: "✓ Upload accepted. Generation queued on server.", type: "success" },
            ]);
            setFile(null); setFileError(""); setUrl(""); setTitle("");
            // Keep the log panel visible — don't auto-clear
        } else {
            setUploadResult({ success: false, message: result?.error || "Upload failed. Please try again." });
        }
    };

    const canSubmit = (file || (url && urlType)) && !uploading && !fileError;

    const getFileIcon = (f) => {
        if (!f) return FileText;
        const ext = f.name.split(".").pop().toLowerCase();
        if (ext === "pdf") return FileText;
        if (["png", "jpg", "jpeg"].includes(ext)) return Image;
        if (ext === "pptx") return Presentation;
        return FileText;
    };
    const FileIcon = getFileIcon(file);

    return (
        <div className="px-4 lg:px-8 py-6 space-y-8 max-w-page mx-auto">

            {/* ═══ Header ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                            <Sparkles size={16} className="text-primary-light" />
                        </div>
                        <h1 className="text-h2 font-heading font-bold text-text-primary">
                            Generate Course
                        </h1>
                    </div>
                    <p className="text-body-sm text-text-secondary">
                        Upload any learning material and let AI transform it into a structured course with quizzes
                    </p>
                </div>
                <Link
                    to="/library"
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-light hover:text-primary transition-colors"
                >
                    View My Library <ArrowRight size={14} />
                </Link>
            </div>

            {/* ═══ AI Pipeline Steps ═══ */}
            <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">How it works</p>
                <div className="flex items-center justify-between gap-2 overflow-x-auto">
                    {pipelineSteps.map((step, i) => (
                        <React.Fragment key={step.label}>
                            <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <step.icon size={18} className="text-primary-light" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-semibold text-text-primary">{step.label}</p>
                                    <p className="text-[10px] text-text-muted">{step.desc}</p>
                                </div>
                            </div>
                            {i < pipelineSteps.length - 1 && (
                                <div className="flex-shrink-0 w-8 h-px bg-border/60 hidden sm:block" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ═══ Main Upload Area ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Upload zone (2 cols) */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Drag & Drop */}
                    <div className="bg-dark-card border border-border/60 rounded-xl p-6">
                        <p className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Upload size={16} className="text-primary-light" />
                            Upload Material
                        </p>

                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`
                                relative border-2 border-dashed rounded-xl p-10
                                flex flex-col items-center justify-center gap-3
                                cursor-pointer transition-all duration-200
                                ${uploading ? "pointer-events-none opacity-60" : ""}
                                ${dragActive
                                    ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(124,58,237,0.15)]"
                                    : file
                                      ? "border-emerald-500/40 bg-emerald-500/5"
                                      : fileError
                                        ? "border-red-500/40 bg-red-500/5"
                                        : "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
                                }
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPT_STRING}
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <FileIcon size={24} className="text-emerald-400" />
                                    </div>
                                    <p className="text-sm text-text-primary font-medium truncate max-w-full">
                                        {file.name}
                                    </p>
                                    <p className="text-[11px] text-text-muted">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(""); }}
                                        className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <X size={12} /> Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                                        ${dragActive ? "bg-primary/15" : "bg-white/[0.03]"}`}
                                    >
                                        <Upload size={28} className={dragActive ? "text-primary-light" : "text-text-muted"} />
                                    </div>
                                    <p className="text-sm text-text-primary font-medium">
                                        {dragActive ? "Drop your file here!" : "Drag & drop your learning material"}
                                    </p>
                                    <p className="text-[11px] text-text-muted">or click to browse — max 20 MB</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {["PDF", "Image", "PPTX"].map((t) => (
                                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-dark-secondary text-text-muted font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {fileError && (
                            <div className="flex items-center gap-2 mt-3 text-[11px] text-red-400">
                                <AlertCircle size={14} /> {fileError}
                            </div>
                        )}

                        {/* OR Divider */}
                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-dark-card text-[11px] text-text-muted">OR paste a URL</span>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="https://youtube.com/watch?v=... or any article URL"
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); setFile(null); setFileError(""); }}
                                disabled={uploading}
                                className="w-full bg-dark-secondary border border-border/40 rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                            {urlType && (
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-0.5 rounded
                                    ${urlType === "youtube" ? "bg-red-500/15 text-red-400" : "bg-cyan-500/15 text-cyan-400"}`}
                                >
                                    {urlType === "youtube" ? "YouTube" : "Article"}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <input
                            type="text"
                            placeholder="Course title (optional — AI will auto-generate)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                            className="w-full mt-3 bg-dark-secondary border border-border/40 rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />

                        {/* Upload Progress / Processing Log */}
                        <AnimatePresence>
                        {(uploading || logMessages.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 overflow-hidden"
                            >
                                {/* Upload bytes progress bar — only for file uploads with real progress */}
                                {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mb-3 space-y-1.5">
                                        <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-text-muted text-right font-mono">{uploadProgress}%</p>
                                    </div>
                                )}

                                {/* Indeterminate bar — URL uploads or waiting for server response */}
                                {uploading && uploadProgress === 0 && (
                                    <div className="mb-3">
                                        <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full w-1/3 bg-gradient-to-r from-primary to-primary-light rounded-full"
                                                animate={{ x: ["−100%", "300%"] }}
                                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Terminal-style log panel */}
                                <div className="rounded-xl overflow-hidden border border-primary/30 bg-[#06060c]">
                                    {/* Terminal title bar */}
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-secondary/60 border-b border-border/30">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-2 flex-1">
                                            <Terminal size={11} className="text-text-muted" />
                                            <span className="text-[10px] text-text-muted font-mono">nexera — course generator</span>
                                        </div>
                                        {uploading && (
                                            <Loader2 size={12} className="animate-spin text-primary-light" />
                                        )}
                                        {!uploading && uploadResult?.success && (
                                            <CheckCircle2 size={12} className="text-emerald-400" />
                                        )}
                                    </div>

                                    {/* Log messages */}
                                    <div
                                        ref={logScrollRef}
                                        className="p-4 max-h-52 overflow-y-auto space-y-1.5"
                                    >
                                        <AnimatePresence initial={false}>
                                            {logMessages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex items-start gap-2 font-mono text-[12px] leading-relaxed"
                                                >
                                                    <span className={`flex-shrink-0 select-none ${
                                                        msg.type === "success" ? "text-emerald-400" :
                                                        msg.type === "error" ? "text-red-400" :
                                                        "text-primary-light/60"
                                                    }`}>
                                                        {msg.type === "success" ? "✓" : msg.type === "error" ? "✗" : "›"}
                                                    </span>
                                                    <span className={
                                                        msg.type === "success" ? "text-emerald-300" :
                                                        msg.type === "error" ? "text-red-300" :
                                                        "text-text-secondary/80"
                                                    }>
                                                        {msg.text}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {/* Blinking cursor while active */}
                                        {uploading && (
                                            <motion.div
                                                className="font-mono text-[12px] text-primary-light"
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >▊</motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* View in library link after success */}
                                {!uploading && uploadResult?.success && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-3 flex items-center justify-between"
                                    >
                                        <span className="text-[11px] text-emerald-400">Processing complete!</span>
                                        <Link
                                            to="/library"
                                            className="flex items-center gap-1 text-[11px] font-medium text-primary-light hover:text-primary transition-colors"
                                        >
                                            Go to Library <ArrowRight size={12} />
                                        </Link>
                                    </motion.div>
                                )}
                                {!uploading && uploadResult?.success && (
                                    <button
                                        onClick={() => { setLogMessages([]); setUploadResult(null); }}
                                        className="mt-2 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
                                    >
                                        Clear log
                                    </button>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={`w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                                ${canSubmit
                                    ? "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                    : "bg-dark-secondary text-text-muted cursor-not-allowed"
                                }`}
                        >
                            <Sparkles size={16} />
                            {uploading
                                ? uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "AI processing..."
                                : "Generate Course with AI"}
                        </button>
                    </div>
                </div>

                {/* Right: Supported Formats (1 col) */}
                <div className="space-y-5">
                    {/* Formats Card */}
                    <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                        <p className="text-sm font-semibold text-text-primary mb-4">Supported Formats</p>
                        <div className="space-y-3">
                            {supportedFormats.map((fmt) => (
                                <div key={fmt.label} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${fmt.color}15` }}
                                    >
                                        <fmt.icon size={15} style={{ color: fmt.color }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-primary">{fmt.label}</p>
                                        <p className="text-[10px] text-text-muted">{fmt.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Info Card */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={16} className="text-primary-light" />
                            <p className="text-sm font-semibold text-text-primary">Powered by AI</p>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                            Gemini 2.5 Flash analyzes your content, identifies key concepts,
                            structures it into learning sections, and auto-generates quizzes
                            to test your understanding.
                        </p>
                        <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-[10px] text-text-muted">Powered by <span className="text-primary-light font-semibold">Nexera AI</span></p>
                        </div>
                        <div className="space-y-2">
                            {[
                                "Smart section breakdown",
                                "Auto-generated quiz questions",
                                "Subject & topic classification",
                                "Knowledge card creation",
                            ].map((feat) => (
                                <div key={feat} className="flex items-center gap-2 text-[11px] text-text-secondary">
                                    <CheckCircle2 size={12} className="text-primary-light flex-shrink-0" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                        <p className="text-sm font-semibold text-text-primary mb-3">Your Stats</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-dark-secondary/50 rounded-lg">
                                <p className="text-lg font-bold text-text-primary font-heading">{totalCourses}</p>
                                <p className="text-[10px] text-text-muted">Courses Created</p>
                            </div>
                            <div className="text-center p-3 bg-dark-secondary/50 rounded-lg">
                                <p className="text-lg font-bold text-text-primary font-heading">{totalSections}</p>
                                <p className="text-[10px] text-text-muted">Sections Generated</p>
                            </div>
                            <div className="text-center p-3 bg-dark-secondary/50 rounded-lg">
                                <p className="text-lg font-bold text-text-primary font-heading">{totalQuizzes}</p>
                                <p className="text-[10px] text-text-muted">Quizzes Created</p>
                            </div>
                            <div className="text-center p-3 bg-dark-secondary/50 rounded-lg">
                                <p className="text-lg font-bold text-text-primary font-heading">{readyContents.length}</p>
                                <p className="text-[10px] text-text-muted">Ready to Study</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Recent Generations ═══ */}
            <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <Clock size={14} className="text-text-muted" />
                        Recent Generations
                    </p>
                    <Link to="/library" className="text-[11px] text-primary-light hover:text-primary transition-colors">
                        View all in library
                    </Link>
                </div>

                {recentGenerations.length === 0 ? (
                    <div className="py-10 text-center text-text-muted text-xs">
                        No courses yet — upload your first material above!
                    </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {recentGenerations.map((gen) => {
                        const TypeIcon = typeIcons[gen.content_type] || FileText;
                        const color = typeColors[gen.content_type] || "#7C3AED";
                        const isProcessing = gen.status === "processing";
                        const isFailed = gen.status === "failed";
                        const sectionCount = gen.structured_sections?.length ?? 0;

                        return (
                            <div
                                key={gen.id}
                                className="bg-dark-secondary/40 border border-border/30 rounded-lg p-4 hover:border-border/60 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: `${color}15` }}
                                    >
                                        <TypeIcon size={14} style={{ color }} />
                                    </div>
                                    {isProcessing ? (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                                            <Loader2 size={10} className="animate-spin" /> Processing
                                        </span>
                                    ) : isFailed ? (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/15 text-red-400">
                                            Failed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                            <CheckCircle2 size={10} /> Ready
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-xs font-semibold text-text-primary line-clamp-2 mb-1">{gen.title}</h4>
                                <p className="text-[10px] text-text-muted mb-3">{gen.subject_category ?? "General"}</p>

                                {!isProcessing ? (
                                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Layers size={10} /> {sectionCount} sections
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap size={10} /> {gen.quiz_count ?? 0} quizzes
                                        </span>
                                    </div>
                                ) : (
                                    <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full animate-pulse" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                                    <span className="text-[10px] text-text-muted">
                                        {gen.created_at ? new Date(gen.created_at).toLocaleDateString() : ""}
                                    </span>
                                    {gen.status === "ready" && (
                                        <button
                                            onClick={() => navigate(`/course/${gen.id}`)}
                                            className="flex items-center gap-1 text-[10px] font-medium text-primary-light opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Play size={10} /> Study
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}
            </div>
        </div>
    );
};

export default GenerateCoursePage;
