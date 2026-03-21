import React, { useState, useRef, useCallback } from "react";
import {
    Upload,
    FileText,
    Youtube,
    Globe,
    Image,
    Presentation,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { useContentStore } from "../../stores/contentStore";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ACCEPTED_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
};
const ACCEPT_STRING = ".pdf,.png,.jpg,.jpeg,.pptx";

const ContentUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [uploadResult, setUploadResult] = useState(null); // { success, message }
    const fileInputRef = useRef(null);

    const { uploading, uploadProgress, uploadFile, uploadUrl, error } =
        useContentStore();

    // ── URL type auto-detection ──
    const detectUrlType = (inputUrl) => {
        if (!inputUrl) return null;
        if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be"))
            return "youtube";
        try {
            new URL(inputUrl);
            return "article";
        } catch {
            return null;
        }
    };

    const urlType = url ? detectUrlType(url) : null;

    // ── File validation ──
    const validateFile = useCallback((f) => {
        if (!f) return "";
        if (f.size > MAX_FILE_SIZE)
            return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 20 MB.`;
        const ext = f.name.split(".").pop().toLowerCase();
        const validExts = ["pdf", "png", "jpg", "jpeg", "pptx"];
        if (!validExts.includes(ext))
            return `Unsupported file type (.${ext}). Use PDF, Image, or PPTX.`;
        return "";
    }, []);

    // ── File type icon helper ──
    const getFileIcon = (f) => {
        if (!f) return FileText;
        const ext = f.name.split(".").pop().toLowerCase();
        if (ext === "pdf") return FileText;
        if (["png", "jpg", "jpeg"].includes(ext)) return Image;
        if (ext === "pptx") return Presentation;
        return FileText;
    };

    // ── Drag & drop ──
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover")
            setDragActive(true);
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
            if (!err) setFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            const err = validateFile(selected);
            setFileError(err);
            if (!err) setFile(selected);
        }
        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    // ── Submit ──
    const handleSubmit = async () => {
        setUploadResult(null);

        let result;
        if (file) {
            result = await uploadFile(file, title);
        } else if (url) {
            result = await uploadUrl(url, title);
        } else {
            return;
        }

        if (result.success) {
            setUploadResult({
                success: true,
                message: "Content uploaded! AI is now analyzing it...",
            });
            // Auto-close after brief success feedback
            setTimeout(() => {
                resetForm();
                onClose();
                onUploadSuccess?.(result.content);
            }, 1500);
        } else {
            setUploadResult({
                success: false,
                message: result.error || "Upload failed. Please try again.",
            });
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileError("");
        setUrl("");
        setTitle("");
        setUploadResult(null);
    };

    const handleClose = () => {
        if (!uploading) {
            resetForm();
            onClose();
        }
    };

    const FileIcon = getFileIcon(file);
    const canSubmit = (file || (url && urlType)) && !uploading && !fileError;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Upload Learning Material"
            size="md"
        >
            <div className="space-y-5">
                {/* ── Drag & Drop Zone ── */}
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`
            relative border-2 border-dashed rounded-md-drd p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-all duration-200
            ${uploading ? "pointer-events-none opacity-60" : ""}
            ${
                dragActive
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    : file
                      ? "border-success bg-success/5"
                      : fileError
                        ? "border-danger bg-danger/5"
                        : "border-border hover:border-border-hover hover:bg-white/[0.02]"
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
                            <FileIcon size={32} className="text-success" />
                            <p className="text-sm text-text-primary font-medium truncate max-w-full">
                                {file.name}
                            </p>
                            <p className="text-caption text-text-muted">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setFileError("");
                                }}
                                className="text-caption text-danger hover:underline transition-colors"
                            >
                                Remove
                            </button>
                        </>
                    ) : (
                        <>
                            <div
                                className={`p-3 rounded-full transition-colors ${dragActive ? "bg-primary/15" : "bg-white/5"}`}
                            >
                                <Upload
                                    size={28}
                                    className={
                                        dragActive
                                            ? "text-primary"
                                            : "text-text-muted"
                                    }
                                />
                            </div>
                            <p className="text-sm text-text-primary font-medium">
                                {dragActive
                                    ? "Drop your file here!"
                                    : "Drag & drop your file here"}
                            </p>
                            <p className="text-caption text-text-muted">
                                or click to browse
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="default">PDF</Badge>
                                <Badge variant="default">Image</Badge>
                                <Badge variant="default">PPTX</Badge>
                                <span className="text-[10px] text-text-disabled">
                                    max 20MB
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* File validation error */}
                {fileError && (
                    <div className="flex items-center gap-2 text-caption text-danger">
                        <AlertCircle size={14} />
                        <span>{fileError}</span>
                    </div>
                )}

                {/* ── OR Divider ── */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-dark-elevated text-text-muted text-caption">
                            OR
                        </span>
                    </div>
                </div>

                {/* ── URL Input ── */}
                <div className="relative">
                    <Input
                        label="Paste URL"
                        placeholder="YouTube or article URL..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setFile(null);
                            setFileError("");
                        }}
                        disabled={uploading}
                    />
                    {urlType && (
                        <div className="absolute right-3 top-[38px]">
                            {urlType === "youtube" ? (
                                <Badge variant="danger">
                                    <Youtube size={12} className="mr-1" />{" "}
                                    YouTube
                                </Badge>
                            ) : (
                                <Badge variant="info">
                                    <Globe size={12} className="mr-1" /> Article
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Title ── */}
                <Input
                    label="Title (optional)"
                    placeholder="AI will auto-generate if empty"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                />

                {/* ── Upload Progress ── */}
                {uploading && (
                    <div className="space-y-3">
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-primary"
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
                                <span className="text-caption text-primary-light">
                                    {uploadProgress < 100
                                        ? "Uploading..."
                                        : "AI is analyzing your content..."}
                                </span>
                            </div>
                            <span className="text-caption text-text-muted font-mono">
                                {uploadProgress}%
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Result feedback ── */}
                {uploadResult && (
                    <div
                        className={`flex items-center gap-3 p-3 rounded-md-drd border ${
                            uploadResult.success
                                ? "bg-success/5 border-success/20"
                                : "bg-danger/5 border-danger/20"
                        }`}
                    >
                        {uploadResult.success ? (
                            <CheckCircle2
                                size={18}
                                className="text-success shrink-0"
                            />
                        ) : (
                            <AlertCircle
                                size={18}
                                className="text-danger shrink-0"
                            />
                        )}
                        <span
                            className={`text-sm ${uploadResult.success ? "text-success" : "text-danger"}`}
                        >
                            {uploadResult.message}
                        </span>
                    </div>
                )}

                {/* API-level error */}
                {error && !uploadResult && (
                    <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-md-drd">
                        <AlertCircle
                            size={16}
                            className="text-danger shrink-0"
                        />
                        <span className="text-caption text-danger">
                            {error}
                        </span>
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={uploading}
                        disabled={!canSubmit}
                    >
                        <Upload size={16} className="mr-1.5" />
                        Upload & Analyze
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ContentUploadModal;
