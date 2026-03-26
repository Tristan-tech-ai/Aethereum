import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Image,
    Swords,
    Timer,
    Send,
    X,
    Loader2,
    ChevronDown,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import { usePostStore } from "../../stores/postStore";
import { useSocialStore } from "../../stores/socialStore";
import { useAuthStore } from "../../stores/authStore";

const MAX_BODY = 500;

const PostComposer = ({ onPosted }) => {
    const user = useAuthStore((s) => s.user);
    const { createPost, uploadImage, submitting } = usePostStore();
    const { myRaids, myDuels } = useSocialStore();

    const [body, setBody] = useState("");
    const [mode, setMode] = useState("text"); // text | image | raid_invite | duel_invite
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showRaidPicker, setShowRaidPicker] = useState(false);
    const [showDuelPicker, setShowDuelPicker] = useState(false);
    const [selectedRaid, setSelectedRaid] = useState(null);
    const [selectedDuel, setSelectedDuel] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    const openRaids = myRaids.filter((r) => ["lobby", "active"].includes(r.status));
    const openDuels = myDuels.filter((d) => d.status === "active");

    const reset = () => {
        setBody("");
        setMode("text");
        setImagePreview(null);
        setImageFile(null);
        setSelectedRaid(null);
        setSelectedDuel(null);
        setShowRaidPicker(false);
        setShowDuelPicker(false);
        setError(null);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5 MB");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setMode("image");
        setError(null);
    };

    const handleSubmit = async () => {
        setError(null);
        try {
            let payload = { post_type: mode, body: body.trim() || null };

            if (mode === "image") {
                if (!imageFile) { setError("Please select an image"); return; }
                setUploading(true);
                const uploaded = await uploadImage(imageFile);
                setUploading(false);
                if (!uploaded?.full_url) { setError("Image upload failed"); return; }
                payload.image_url = uploaded.full_url;
            }

            if (mode === "raid_invite") {
                if (!selectedRaid) { setError("Please select a raid to invite to"); return; }
                payload.ref_id   = selectedRaid.id;
                payload.ref_meta = { title: selectedRaid.title || "Study Raid", code: selectedRaid.join_code, status: selectedRaid.status };
            }

            if (mode === "duel_invite") {
                if (!selectedDuel) { setError("Please select a duel to share"); return; }
                payload.ref_id   = selectedDuel.id;
                payload.ref_meta = { title: "Focus Duel", status: selectedDuel.status };
            }

            const result = await createPost(payload);
            if (result.ok) {
                reset();
                onPosted?.();
            } else {
                setError(result.error);
            }
        } catch (e) {
            setUploading(false);
            setError("Something went wrong");
        }
    };

    const canSubmit = (() => {
        if (mode === "text") return body.trim().length > 0;
        if (mode === "image") return !!imageFile;
        if (mode === "raid_invite") return !!selectedRaid;
        if (mode === "duel_invite") return !!selectedDuel;
        return false;
    })();

    return (
        <div className="bg-dark-card border border-border/60 rounded-2xl p-4 space-y-3">
            {/* Top row */}
            <div className="flex gap-3">
                <Avatar name={user?.name} src={user?.avatar_url} size="sm" className="shrink-0 mt-0.5" />
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                    placeholder={
                        mode === "text"        ? "Share something with the community..."
                        : mode === "image"     ? "Add a caption (optional)..."
                        : mode === "raid_invite" ? "Write something about your raid..."
                        : "Write something about your duel..."
                    }
                    rows={3}
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none leading-relaxed"
                />
            </div>

            {/* Image preview */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative ml-10"
                    >
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-56 rounded-xl object-cover border border-border/40"
                        />
                        <button
                            onClick={() => { setImagePreview(null); setImageFile(null); setMode("text"); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                            <X size={12} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Raid picker */}
            <AnimatePresence>
                {showRaidPicker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-10 space-y-1"
                    >
                        <p className="text-[11px] text-text-muted mb-1">Select a raid to invite:</p>
                        {openRaids.length === 0 ? (
                            <p className="text-xs text-text-disabled italic">No active raids. Start one first!</p>
                        ) : (
                            openRaids.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => { setSelectedRaid(r); setShowRaidPicker(false); setMode("raid_invite"); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                                        selectedRaid?.id === r.id
                                            ? "bg-primary/15 border-primary/40 text-primary-light"
                                            : "bg-dark-secondary border-border/40 text-text-secondary hover:border-primary/30"
                                    }`}
                                >
                                    <span className="font-medium">{r.title || "Study Raid"}</span>
                                    <span className="ml-2 text-text-muted">{r.status}</span>
                                    {r.join_code && <span className="ml-2 font-mono text-text-disabled">#{r.join_code}</span>}
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Duel picker */}
            <AnimatePresence>
                {showDuelPicker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-10 space-y-1"
                    >
                        <p className="text-[11px] text-text-muted mb-1">Select a duel to share:</p>
                        {openDuels.length === 0 ? (
                            <p className="text-xs text-text-disabled italic">No active duels. Challenge someone first!</p>
                        ) : (
                            openDuels.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => { setSelectedDuel(d); setShowDuelPicker(false); setMode("duel_invite"); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                                        selectedDuel?.id === d.id
                                            ? "bg-red-500/15 border-red-500/40 text-red-400"
                                            : "bg-dark-secondary border-border/40 text-text-secondary hover:border-red-500/30"
                                    }`}
                                >
                                    <span className="font-medium">Focus Duel</span>
                                    <span className="ml-2 text-text-muted">{d.status}</span>
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected invite cards */}
            {selectedRaid && !showRaidPicker && (
                <div className="ml-10 flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary-light">
                    <Swords size={13} />
                    <span className="font-medium">{selectedRaid.title || "Study Raid"}</span>
                    {selectedRaid.join_code && <span className="font-mono text-text-muted ml-1">#{selectedRaid.join_code}</span>}
                    <button onClick={() => { setSelectedRaid(null); setMode("text"); }} className="ml-auto text-text-muted hover:text-text-primary">
                        <X size={12} />
                    </button>
                </div>
            )}
            {selectedDuel && !showDuelPicker && (
                <div className="ml-10 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                    <Timer size={13} />
                    <span className="font-medium">Focus Duel</span>
                    <button onClick={() => { setSelectedDuel(null); setMode("text"); }} className="ml-auto text-text-muted hover:text-text-primary">
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Error */}
            {error && <p className="ml-10 text-xs text-red-400">{error}</p>}

            {/* Divider + actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40 ml-10">
                <div className="flex items-center gap-1">
                    {/* Image */}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <button
                        onClick={() => fileRef.current?.click()}
                        className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                            mode === "image" ? "bg-emerald-500/15 text-emerald-400" : "text-text-muted hover:text-text-primary hover:bg-dark-secondary"
                        }`}
                        title="Add image"
                    >
                        <Image size={16} />
                        <span className="hidden sm:inline text-[11px]">Photo</span>
                    </button>

                    {/* Raid invite */}
                    <button
                        onClick={() => { setShowRaidPicker((v) => !v); setShowDuelPicker(false); }}
                        className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                            mode === "raid_invite" ? "bg-primary/15 text-primary-light" : "text-text-muted hover:text-text-primary hover:bg-dark-secondary"
                        }`}
                        title="Invite to raid"
                    >
                        <Swords size={16} />
                        <span className="hidden sm:inline text-[11px]">Raid</span>
                        <ChevronDown size={10} className={`transition-transform ${showRaidPicker ? "rotate-180" : ""}`} />
                    </button>

                    {/* Duel invite */}
                    <button
                        onClick={() => { setShowDuelPicker((v) => !v); setShowRaidPicker(false); }}
                        className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                            mode === "duel_invite" ? "bg-red-500/15 text-red-400" : "text-text-muted hover:text-text-primary hover:bg-dark-secondary"
                        }`}
                        title="Share duel"
                    >
                        <Timer size={16} />
                        <span className="hidden sm:inline text-[11px]">Duel</span>
                        <ChevronDown size={10} className={`transition-transform ${showDuelPicker ? "rotate-180" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {body.length > 0 && (
                        <span className={`text-[10px] font-mono ${body.length > MAX_BODY * 0.8 ? "text-amber-400" : "text-text-disabled"}`}>
                            {MAX_BODY - body.length}
                        </span>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting || uploading}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            canSubmit && !submitting && !uploading
                                ? "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25"
                                : "bg-dark-secondary text-text-disabled cursor-not-allowed"
                        }`}
                    >
                        {(submitting || uploading) ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Send size={13} />
                        )}
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostComposer;
