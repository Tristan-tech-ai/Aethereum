import React, { useState, useEffect } from "react";
import {
    Swords,
    Users,
    BookOpen,
    Search,
    Copy,
    Check,
    Link2,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useContentStore } from "../../stores/contentStore";

const maxParticipantOptions = [
    { value: 2, label: "2", desc: "Duo" },
    { value: 3, label: "3", desc: "Trio" },
    { value: 4, label: "4", desc: "Squad" },
    { value: 5, label: "5", desc: "Full Party" },
];

const CreateRaidModal = ({ isOpen, onClose, onCreateRaid }) => {
    const [selectedContent, setSelectedContent] = useState(null);
    const [maxParticipants, setMaxParticipants] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [inviteCode, setInviteCode] = useState(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [creating, setCreating] = useState(false);

    const { contents, fetchContents } = useContentStore();

    // Fetch user's ready contents when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchContents(1);
        }
    }, [isOpen, fetchContents]);

    const readyContents = (contents || []).filter(
        (c) =>
            c.status === "ready" &&
            (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.subject_category
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())),
    );

    const handleCreate = () => {
        if (!selectedContent) return;
        setCreating(true);

        // Generate a random 8-char invite code (would come from backend in prod)
        const code = Array.from({ length: 8 }, () =>
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
                Math.floor(Math.random() * 32),
            ),
        ).join("");

        // Simulate creation delay
        setTimeout(() => {
            setInviteCode(code);
            setCreating(false);
        }, 800);
    };

    const handleCopyCode = () => {
        if (!inviteCode) return;
        navigator.clipboard.writeText(inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleCopyLink = () => {
        if (!inviteCode) return;
        const link = `${window.location.origin}/social?raid=${inviteCode}`;
        navigator.clipboard.writeText(link);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleStartRaid = () => {
        onCreateRaid?.({
            content: selectedContent,
            maxParticipants,
            inviteCode,
        });
        handleClose();
    };

    const handleClose = () => {
        setSelectedContent(null);
        setMaxParticipants(5);
        setSearchQuery("");
        setInviteCode(null);
        setCodeCopied(false);
        setCreating(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="⚔️ Create Study Raid"
            size="md"
        >
            {!inviteCode ? (
                <>
                    {/* Step 1: Select Content */}
                    <div className="mb-5">
                        <label className="block text-body-sm font-medium text-text-secondary mb-2">
                            <BookOpen
                                size={14}
                                className="inline mr-1.5 -mt-0.5"
                            />
                            Select Material
                        </label>
                        <div className="relative mb-3">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                type="text"
                                placeholder="Search your materials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 bg-dark-secondary text-text-primary text-sm rounded-[8px] pl-9 pr-4 border border-border focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1 -mx-1 px-1">
                            {readyContents.length > 0 ? (
                                readyContents.map((content) => (
                                    <button
                                        key={content.id}
                                        onClick={() =>
                                            setSelectedContent(content)
                                        }
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm-drd transition-all text-left ${
                                            selectedContent?.id === content.id
                                                ? "bg-primary/15 ring-1 ring-primary/40"
                                                : "hover:bg-white/[0.03]"
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-sm-drd bg-dark-secondary flex items-center justify-center shrink-0">
                                            <BookOpen
                                                size={14}
                                                className="text-text-muted"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">
                                                {content.title || "Untitled"}
                                            </p>
                                            <p className="text-[11px] text-text-muted">
                                                {content.subject_category ||
                                                    "General"}{" "}
                                                · {content.content_type}
                                            </p>
                                        </div>
                                        {selectedContent?.id === content.id && (
                                            <Check
                                                size={16}
                                                className="text-primary-light shrink-0"
                                            />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <BookOpen
                                        size={24}
                                        className="mx-auto text-text-muted mb-2"
                                    />
                                    <p className="text-caption text-text-muted">
                                        {searchQuery
                                            ? "No matching materials found"
                                            : "No ready materials yet. Upload content first!"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Max Participants */}
                    <div className="mb-6">
                        <label className="block text-body-sm font-medium text-text-secondary mb-2">
                            <Users
                                size={14}
                                className="inline mr-1.5 -mt-0.5"
                            />
                            Max Participants
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {maxParticipantOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() =>
                                        setMaxParticipants(opt.value)
                                    }
                                    className={`flex flex-col items-center gap-1 p-3 rounded-md-drd border transition-all ${
                                        maxParticipants === opt.value
                                            ? "border-primary bg-primary/10 text-primary-light"
                                            : "border-border bg-dark-secondary text-text-secondary hover:border-white/10"
                                    }`}
                                >
                                    <span className="text-lg font-bold">
                                        {opt.label}
                                    </span>
                                    <span className="text-[10px]">
                                        {opt.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    {selectedContent && (
                        <div className="bg-dark-secondary rounded-md-drd p-3.5 mb-5 border border-border-subtle">
                            <p className="text-caption text-text-muted mb-1">
                                Raid Summary
                            </p>
                            <p className="text-sm text-text-primary font-medium truncate">
                                {selectedContent.title}
                            </p>
                            <p className="text-caption text-text-muted mt-1">
                                Up to {maxParticipants} raiders · Cooperative
                                learning
                            </p>
                        </div>
                    )}

                    {/* Create Button */}
                    <Button
                        className="w-full"
                        onClick={handleCreate}
                        disabled={!selectedContent}
                        loading={creating}
                    >
                        <Swords size={16} className="mr-1.5" />
                        Create Raid
                    </Button>
                </>
            ) : (
                /* Step 3: Share Invite Code */
                <div className="text-center">
                    <div className="text-4xl mb-3">⚔️</div>
                    <h3 className="text-h3 font-heading text-text-primary mb-1">
                        Raid Created!
                    </h3>
                    <p className="text-sm text-text-secondary mb-5">
                        Share this code with your raid party
                    </p>

                    {/* Invite Code Display */}
                    <div className="inline-flex items-center gap-3 bg-dark-card border border-border rounded-md-drd px-5 py-3.5 mb-4">
                        <span className="text-h2 font-mono text-text-primary tracking-[0.2em]">
                            {inviteCode}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            className="p-1.5 text-text-muted hover:text-primary-light transition-colors"
                            title="Copy code"
                        >
                            {codeCopied ? (
                                <Check size={18} className="text-success" />
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    </div>

                    <div className="flex gap-3 justify-center mb-6">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyCode}
                        >
                            <Copy size={14} className="mr-1.5" />
                            {codeCopied ? "Copied!" : "Copy Code"}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyLink}
                        >
                            <Link2 size={14} className="mr-1.5" />
                            Copy Link
                        </Button>
                    </div>

                    <div className="bg-dark-secondary rounded-md-drd p-3 mb-5 text-left border border-border-subtle">
                        <p className="text-caption text-text-muted mb-1">
                            Material
                        </p>
                        <p className="text-sm text-text-primary font-medium truncate">
                            {selectedContent?.title}
                        </p>
                        <p className="text-caption text-text-muted mt-1">
                            {maxParticipants} max players
                        </p>
                    </div>

                    <Button className="w-full" onClick={handleStartRaid}>
                        Go to Lobby
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default CreateRaidModal;
