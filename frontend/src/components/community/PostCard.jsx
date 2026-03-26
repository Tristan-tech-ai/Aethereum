import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    Trash2,
    Swords,
    Timer,
    Send,
    X,
    Image as ImageIcon,
    Loader2,
    MoreHorizontal,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { usePostStore } from "../../stores/postStore";
import { useAuthStore } from "../../stores/authStore";

/* ── Time formatter ─────────── */
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/* ── Invite embed ──────────────*/
const InviteEmbed = ({ type, refMeta = {} }) => {
    const isRaid = type === "raid_invite";
    return (
        <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 ${
            isRaid
                ? "bg-primary/8 border-primary/25 text-primary-light"
                : "bg-red-500/8 border-red-500/25 text-red-400"
        }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isRaid ? "bg-primary/15" : "bg-red-500/15"}`}>
                {isRaid ? <Swords size={17} /> : <Timer size={17} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">
                    {refMeta.title || (isRaid ? "Study Raid Invite" : "Focus Duel Invite")}
                </p>
                {refMeta.code && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                        Code: <span className="font-mono font-bold">{refMeta.code}</span>
                    </p>
                )}
                <p className={`text-[10px] mt-0.5 capitalize ${isRaid ? "text-primary-light/60" : "text-red-400/60"}`}>
                    {refMeta.status || "open"}
                </p>
            </div>
            <Link
                to={isRaid ? "/community/raids" : "/community/duels"}
                className={`p-1.5 rounded-lg transition-colors ${isRaid ? "hover:bg-primary/20" : "hover:bg-red-500/20"}`}
                title="Join"
            >
                <ExternalLink size={13} />
            </Link>
        </div>
    );
};

/* ── Comment item ──────────── */
const CommentItem = ({ comment, postId, canDelete }) => {
    const { deleteComment } = usePostStore();
    return (
        <div className="flex gap-2 group">
            <Avatar name={comment.user?.name} src={comment.user?.avatar_url} size="xs" className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="bg-dark-secondary rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-text-primary">{comment.user?.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed break-words">{comment.body}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-text-disabled">{timeAgo(comment.created_at)}</span>
                    {canDelete && (
                        <button
                            onClick={() => deleteComment(postId, comment.id)}
                            className="text-[10px] text-text-disabled hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Post Card ─────────────── */
const PostCard = ({ post }) => {
    const user = useAuthStore((s) => s.user);
    const { toggleLike, deletePost, fetchComments, addComment } = usePostStore();

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [commentSending, setCommentSending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [imgOpen, setImgOpen] = useState(false);

    const isOwn = user?.id === post.user?.id;

    const handleToggleComments = useCallback(async () => {
        setShowComments((v) => !v);
        if (!commentsLoaded) {
            setCommentsLoading(true);
            const data = await fetchComments(post.id);
            setComments(data);
            setCommentsLoaded(true);
            setCommentsLoading(false);
        }
    }, [commentsLoaded, fetchComments, post.id]);

    const handleSendComment = async () => {
        if (!commentInput.trim()) return;
        setCommentSending(true);
        const newComment = await addComment(post.id, commentInput.trim());
        if (newComment) {
            setComments((c) => [...c, newComment]);
        }
        setCommentInput("");
        setCommentSending(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="bg-dark-card border border-border/50 rounded-2xl overflow-hidden group"
        >
            {/* Top accent by type */}
            <div className={`h-0.5 w-full ${
                post.post_type === "raid_invite"  ? "bg-gradient-to-r from-primary to-primary/20"
                : post.post_type === "duel_invite" ? "bg-gradient-to-r from-red-500 to-red-500/20"
                : post.post_type === "image"       ? "bg-gradient-to-r from-emerald-500 to-emerald-500/20"
                : "bg-gradient-to-r from-border/40 to-transparent"
            }`} />

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <Avatar
                            name={post.user?.name}
                            src={post.user?.avatar_url}
                            size="sm"
                        />
                        <div>
                            <p className="text-sm font-semibold text-text-primary leading-tight">
                                {post.user?.name ?? "Unknown"}
                            </p>
                            <p className="text-[11px] text-text-muted">
                                @{post.user?.username} · {timeAgo(post.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Actions menu */}
                    {isOwn && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu((v) => !v)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-secondary transition-colors"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                        className="absolute right-0 top-8 bg-dark-elevated border border-border/60 rounded-xl shadow-xl z-20 min-w-[120px] overflow-hidden"
                                    >
                                        <button
                                            onClick={() => { deletePost(post.id); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Body text */}
                {post.body && (
                    <p className="text-sm text-text-secondary leading-relaxed mb-2 whitespace-pre-wrap break-words">
                        {post.body}
                    </p>
                )}

                {/* Image content */}
                {post.post_type === "image" && post.image_url && (
                    <>
                        <div
                            className="mt-2 cursor-pointer rounded-xl overflow-hidden border border-border/30"
                            onClick={() => setImgOpen(true)}
                        >
                            <img
                                src={post.image_url}
                                alt="Post"
                                className="w-full max-h-80 object-cover hover:opacity-95 transition-opacity"
                            />
                        </div>
                        {/* Lightbox */}
                        <AnimatePresence>
                            {imgOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                                    onClick={() => setImgOpen(false)}
                                >
                                    <button
                                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                                        onClick={() => setImgOpen(false)}
                                    >
                                        <X size={24} />
                                    </button>
                                    <img
                                        src={post.image_url}
                                        alt="Post full"
                                        className="max-w-full max-h-full rounded-xl object-contain"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Invite embed */}
                {(post.post_type === "raid_invite" || post.post_type === "duel_invite") && (
                    <InviteEmbed type={post.post_type} refMeta={post.ref_meta ?? {}} />
                )}

                {/* Actions bar */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                    {/* Like */}
                    <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                            post.liked_by_me ? "text-red-400" : "text-text-muted hover:text-red-400"
                        }`}
                    >
                        <Heart size={15} fill={post.liked_by_me ? "currentColor" : "none"} />
                        <span>{post.likes_count > 0 ? post.likes_count : ""}</span>
                    </button>

                    {/* Comments */}
                    <button
                        onClick={handleToggleComments}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                            showComments ? "text-primary-light" : "text-text-muted hover:text-primary-light"
                        }`}
                    >
                        <MessageCircle size={15} />
                        <span>{post.comments_count > 0 ? post.comments_count : ""}</span>
                    </button>
                </div>
            </div>

            {/* Comments section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border/30 px-4 py-3 space-y-2.5 bg-dark-secondary/30"
                    >
                        {commentsLoading ? (
                            <div className="flex justify-center py-3">
                                <Loader2 size={18} className="animate-spin text-text-muted" />
                            </div>
                        ) : (
                            <>
                                {comments.length === 0 && (
                                    <p className="text-[11px] text-text-disabled text-center py-2">
                                        No comments yet. Be the first!
                                    </p>
                                )}
                                {comments.map((c) => (
                                    <CommentItem
                                        key={c.id}
                                        comment={c}
                                        postId={post.id}
                                        canDelete={user?.id === c.user_id || isOwn}
                                    />
                                ))}
                            </>
                        )}

                        {/* Comment input */}
                        <div className="flex gap-2 pt-1">
                            <Avatar name={user?.name} src={user?.avatar_url} size="xs" className="shrink-0 mt-1" />
                            <div className="flex-1 flex gap-1.5">
                                <input
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value.slice(0, 500))}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-dark-card border border-border/50 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                />
                                <button
                                    onClick={handleSendComment}
                                    disabled={!commentInput.trim() || commentSending}
                                    className="p-2 rounded-xl bg-primary/10 text-primary-light hover:bg-primary/20 disabled:opacity-40 transition-colors"
                                >
                                    {commentSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PostCard;
