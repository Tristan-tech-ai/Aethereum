import React, { useState, useEffect } from "react";
import {
    Swords,
    Users,
    BookOpen,
    Search,
    Check,
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
        Promise.resolve(onCreateRaid?.({
            content: selectedContent,
            maxParticipants,
        })).finally(() => {
            setCreating(false);
            handleClose();
        });
    };

    const handleClose = () => {
        setSelectedContent(null);
        setMaxParticipants(5);
        setSearchQuery("");
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
            (
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
            )
        </Modal>
    );
};

export default CreateRaidModal;
