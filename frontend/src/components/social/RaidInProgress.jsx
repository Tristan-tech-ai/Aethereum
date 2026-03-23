import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    MessageCircle,
    Send,
    BookOpen,
    Trophy,
    AlertTriangle,
    ChevronRight,
    Users,
    X,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

/**
 * RaidInProgress — real-time cooperative learning view per DRD §9.1 & PRD §7 (Study Raid).
 *
 * Layout (desktop):
 *   Left: Participant cards (name + % progress + status emoji)
 *   Center: Learning content (reading interface — same as Document Dungeon)
 *   Right: Chat sidebar (text only, 200 char limit)
 *
 * Top: Shared team progress bar
 *
 * In production, progress updates come from WebSocket (Reverb).
 * For now, opponent progress is simulated.
 */

// Simulated learning sections — in prod, fetched from content analysis
const demoSections = [
    {
        id: 1,
        title: "Introduction to Data Structures",
        content:
            "Data structures are ways of organizing and storing data so it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs.\n\nUnderstanding data structures is fundamental to writing efficient algorithms and is a core topic in computer science education.\n\n**Why Data Structures Matter:**\n\n- They determine how data is stored in memory\n- They affect the time complexity of operations\n- Choosing the right structure can dramatically improve performance\n- They are essential for solving complex computational problems",
    },
    {
        id: 2,
        title: "Arrays and Linked Lists",
        content:
            "An **array** is a collection of elements stored in contiguous memory locations. Arrays offer O(1) access time by index but O(n) for insertion and deletion.\n\nA **linked list** stores elements in nodes, where each node points to the next. Linked lists offer O(1) insertion/deletion at the head but O(n) access time.\n\n**Key Differences:**\n\n- Memory: Arrays use contiguous memory; linked lists use scattered nodes\n- Access: Arrays support random access; linked lists require traversal\n- Insertion: Linked lists are better for frequent insertions/deletions\n- Cache: Arrays have better cache locality due to contiguous storage",
    },
    {
        id: 3,
        title: "Stacks and Queues",
        content:
            "**Stacks** follow LIFO (Last In, First Out) — think of a stack of plates. Key operations: push, pop, peek.\n\n**Queues** follow FIFO (First In, First Out) — think of a line at a store. Key operations: enqueue, dequeue, front.\n\n**Applications:**\n\n- Stack: Function call stack, undo operations, expression parsing, backtracking\n- Queue: BFS traversal, task scheduling, printer queues, message buffers\n\nBoth can be implemented using arrays or linked lists.",
    },
    {
        id: 4,
        title: "Trees and Binary Search Trees",
        content:
            "A **tree** is a hierarchical data structure with a root node and child nodes. Each node can have zero or more children.\n\nA **Binary Search Tree (BST)** is a tree where each node has at most 2 children, and left child < parent < right child.\n\n**BST Operations (average case):**\n\n- Search: O(log n)\n- Insert: O(log n)\n- Delete: O(log n)\n\n**Note:** In the worst case (unbalanced), BST degrades to O(n). Self-balancing trees (AVL, Red-Black) maintain O(log n) guarantees.",
    },
    {
        id: 5,
        title: "Graphs and Hash Tables",
        content:
            "**Graphs** consist of vertices (nodes) and edges (connections). They can be directed/undirected, weighted/unweighted.\n\n**Common algorithms:** BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, Prim.\n\n**Hash Tables** store key-value pairs using a hash function for O(1) average lookup.\n\n**Collision handling:** Chaining (linked lists at each bucket) or Open Addressing (probing).\n\n**Real-world uses:**\n\n- Graphs: Social networks, routing, dependency management\n- Hash Tables: Databases, caching, symbol tables, dictionaries",
    },
];

// Demo participants
const demoParticipants = [
    {
        id: "me",
        name: "You",
        level: 22,
        progress: 0,
        status: "learning",
        isMe: true,
    },
    {
        id: "p2",
        name: "Budi Santoso",
        level: 24,
        progress: 0,
        status: "learning",
        isMe: false,
    },
    {
        id: "p3",
        name: "Siti Rahma",
        level: 31,
        progress: 0,
        status: "learning",
        isMe: false,
    },
];

const RaidInProgress = ({
    raid = {},
    participants: externalParticipants,
    onComplete,
    className = "",
}) => {
    const { contentTitle = "Data Structures & Algorithms" } = raid;

    // ── Sections & reading state ──
    const [currentSection, setCurrentSection] = useState(0);
    const [completedSections, setCompletedSections] = useState(new Set());
    const [sectionScrolled, setSectionScrolled] = useState(false);

    // ── Participants ──
    const [participants, setParticipants] = useState(
        externalParticipants || demoParticipants,
    );

    // ── Chat ──
    const [chatMessages, setChatMessages] = useState([
        { id: 1, user: "Budi Santoso", text: "Let's do this 💪", time: "now" },
        { id: 2, user: "Siti Rahma", text: "Good luck team!", time: "now" },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [showChat, setShowChat] = useState(false); // mobile toggle
    const chatEndRef = useRef(null);

    // ── Focus tracking ──
    const [myDistractions, setMyDistractions] = useState(0);

    // My progress based on completed sections
    const myProgress = Math.round(
        (completedSections.size / demoSections.length) * 100,
    );

    // Team average progress
    const teamProgress = Math.round(
        participants.reduce(
            (sum, p) => sum + (p.isMe ? myProgress : p.progress),
            0,
        ) / participants.length,
    );

    // ── Simulate opponent progress ──
    useEffect(() => {
        const interval = setInterval(() => {
            setParticipants((prev) =>
                prev.map((p) => {
                    if (p.isMe) return { ...p, progress: myProgress };
                    // Random progress increment (simulated)
                    const increment =
                        Math.random() < 0.3
                            ? Math.floor(Math.random() * 8 + 2)
                            : 0;
                    const newProgress = Math.min(100, p.progress + increment);
                    // Update status
                    let status = "learning";
                    if (newProgress >= 100) status = "completed";
                    else if (Math.random() < 0.05) status = "quiz";
                    return { ...p, progress: newProgress, status };
                }),
            );
        }, 3000);
        return () => clearInterval(interval);
    }, [myProgress]);

    // Auto-generate simulated chat messages
    useEffect(() => {
        const messages = [
            { user: "Budi Santoso", text: "Arrays section is interesting!" },
            { user: "Siti Rahma", text: "BST is tricky but I get it now" },
            { user: "Budi Santoso", text: "Almost done with Trees 🌳" },
            { user: "Siti Rahma", text: "Who's on the last section?" },
        ];
        let idx = 0;
        const interval = setInterval(() => {
            if (idx >= messages.length) return;
            setChatMessages((prev) => [
                ...prev,
                { id: Date.now(), ...messages[idx], time: "just now" },
            ]);
            idx++;
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Focus tracking — tab switches
    useEffect(() => {
        const handleBlur = () => {
            setMyDistractions((p) => p + 1);
        };
        window.addEventListener("blur", handleBlur);
        return () => window.removeEventListener("blur", handleBlur);
    }, []);

    // ── Handlers ──
    const handleCompleteSection = () => {
        setCompletedSections((prev) => new Set([...prev, currentSection]));
        setSectionScrolled(false);

        if (completedSections.size + 1 >= demoSections.length) {
            // All sections done — trigger completion
            setTimeout(() => {
                onComplete?.({
                    sectionsCompleted: demoSections.length,
                    focusIntegrity: Math.max(0, 100 - myDistractions * 5),
                    distractions: myDistractions,
                    participants,
                });
            }, 600);
        } else {
            // Move to next uncompleted section
            const nextIdx = demoSections.findIndex(
                (_, i) => i > currentSection && !completedSections.has(i),
            );
            if (nextIdx !== -1) setCurrentSection(nextIdx);
        }
    };

    const handleSendChat = useCallback(() => {
        const text = chatInput.trim();
        if (!text) return;
        setChatMessages((prev) => [
            ...prev,
            { id: Date.now(), user: "You", text, time: "now" },
        ]);
        setChatInput("");
    }, [chatInput]);

    const handleChatKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendChat();
        }
    };

    const getStatusEmoji = (status) => {
        switch (status) {
            case "learning":
                return "📖";
            case "quiz":
                return "⚔️";
            case "completed":
                return "✅";
            default:
                return "⏳";
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* ── Top Bar: Title + Team Progress ── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚔️</span>
                        <h2 className="text-h4 font-heading text-text-primary">
                            {contentTitle}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="primary">RAID ACTIVE</Badge>
                        {/* Mobile chat toggle */}
                        <button
                            onClick={() => setShowChat((v) => !v)}
                            className="lg:hidden p-2 text-text-muted hover:text-primary-light transition-colors relative"
                        >
                            <MessageCircle size={18} />
                            {chatMessages.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Shared Team Progress Bar */}
                <div>
                    <div className="flex justify-between text-caption mb-1">
                        <span className="text-text-muted flex items-center gap-1">
                            <Users size={12} /> Team Progress
                        </span>
                        <span className="text-text-secondary font-medium">
                            {teamProgress}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-dark-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${teamProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Three-Column Layout ── */}
            <div className="flex gap-4">
                {/* ── Left: Participant Cards ── */}
                <div className="hidden md:block w-48 shrink-0 space-y-2">
                    <p className="text-caption text-text-muted font-medium uppercase tracking-wider mb-1">
                        Raiders
                    </p>
                    {participants.map((p) => (
                        <Card
                            key={p.id}
                            padding="compact"
                            className={`transition-all ${p.isMe ? "ring-1 ring-primary/30" : ""}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar name={p.name} size="xs" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-text-primary truncate">
                                        {p.name}
                                    </p>
                                    <p className="text-[10px] text-text-muted">
                                        Lv.{p.level}
                                    </p>
                                </div>
                                <span className="text-sm" title={p.status}>
                                    {getStatusEmoji(p.status)}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        (p.isMe ? myProgress : p.progress) >=
                                        100
                                            ? "bg-success"
                                            : "bg-primary"
                                    }`}
                                    style={{
                                        width: `${p.isMe ? myProgress : p.progress}%`,
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-text-muted text-right mt-1">
                                {p.isMe ? myProgress : p.progress}%
                            </p>
                        </Card>
                    ))}

                    {myDistractions > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-warning mt-2 px-1">
                            <AlertTriangle size={10} />
                            <span>
                                {myDistractions} tab switch
                                {myDistractions > 1 ? "es" : ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Center: Learning Content ── */}
                <div className="flex-1 min-w-0">
                    {/* Section Navigator */}
                    <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
                        {demoSections.map((section, i) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setCurrentSection(i);
                                    setSectionScrolled(false);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                                    i === currentSection
                                        ? "border-primary bg-primary/15 text-primary-light"
                                        : completedSections.has(i)
                                          ? "border-success/30 bg-success/10 text-success"
                                          : "border-border bg-dark-secondary text-text-muted hover:border-white/10"
                                }`}
                            >
                                {completedSections.has(i) ? "✅" : `${i + 1}`}
                                <span className="hidden sm:inline ml-0.5">
                                    {section.title
                                        .split(" ")
                                        .slice(0, 2)
                                        .join(" ")}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Reading Content Card */}
                    <Card padding="spacious" className="min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h4 font-heading text-text-primary">
                                {demoSections[currentSection].title}
                            </h3>
                            <Badge
                                variant={
                                    completedSections.has(currentSection)
                                        ? "success"
                                        : "default"
                                }
                            >
                                {completedSections.has(currentSection)
                                    ? "Completed"
                                    : `Section ${currentSection + 1}/${demoSections.length}`}
                            </Badge>
                        </div>

                        {/* Content text with markdown-like styling */}
                        <div
                            className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed"
                            onScroll={(e) => {
                                const el = e.target;
                                if (
                                    el.scrollTop + el.clientHeight >=
                                    el.scrollHeight - 20
                                ) {
                                    setSectionScrolled(true);
                                }
                            }}
                        >
                            {demoSections[currentSection].content
                                .split("\n\n")
                                .map((paragraph, idx) => (
                                    <p key={idx} className="mb-3">
                                        {paragraph.split("**").map((part, j) =>
                                            j % 2 === 1 ? (
                                                <strong
                                                    key={j}
                                                    className="text-text-primary font-semibold"
                                                >
                                                    {part}
                                                </strong>
                                            ) : (
                                                <span key={j}>{part}</span>
                                            ),
                                        )}
                                    </p>
                                ))}
                        </div>

                        {/* Complete Section Button */}
                        {!completedSections.has(currentSection) && (
                            <div className="mt-6 pt-4 border-t border-border-subtle">
                                <Button
                                    className="w-full"
                                    onClick={handleCompleteSection}
                                >
                                    <ChevronRight
                                        size={16}
                                        className="mr-1.5"
                                    />
                                    {completedSections.size + 1 >=
                                    demoSections.length
                                        ? "Complete Final Section"
                                        : "Mark Complete & Next"}
                                </Button>
                            </div>
                        )}

                        {completedSections.has(currentSection) && (
                            <div className="mt-6 pt-4 border-t border-border-subtle text-center">
                                <p className="text-sm text-success flex items-center justify-center gap-2">
                                    <Trophy size={14} /> Section completed!
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── Right: Chat Sidebar ── */}
                <div
                    className={`${
                        showChat
                            ? "fixed inset-0 z-50 bg-black/60 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent"
                            : "hidden"
                    } lg:block w-64 shrink-0`}
                >
                    <div
                        className={`${
                            showChat
                                ? "absolute right-0 top-0 h-full w-72 lg:relative lg:w-full"
                                : ""
                        } flex flex-col bg-dark-card border border-border rounded-md-drd h-[500px]`}
                    >
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
                            <p className="text-caption font-medium text-text-primary flex items-center gap-1.5">
                                <MessageCircle size={12} /> Raid Chat
                            </p>
                            <button
                                onClick={() => setShowChat(false)}
                                className="lg:hidden p-1 text-text-muted hover:text-text-primary"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
                            {chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${msg.user === "You" ? "text-right" : ""}`}
                                >
                                    <p className="text-[10px] text-text-muted mb-0.5">
                                        {msg.user === "You" ? "" : msg.user}
                                    </p>
                                    <div
                                        className={`inline-block max-w-[85%] px-2.5 py-1.5 rounded-lg text-[12px] ${
                                            msg.user === "You"
                                                ? "bg-primary/20 text-primary-light"
                                                : "bg-dark-secondary text-text-secondary"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="px-3 py-2.5 border-t border-border-subtle">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={chatInput}
                                    onChange={(e) =>
                                        setChatInput(
                                            e.target.value.slice(0, 200),
                                        )
                                    }
                                    onKeyDown={handleChatKeyDown}
                                    maxLength={200}
                                    className="flex-1 h-8 bg-dark-secondary text-text-primary text-[12px] rounded-md-drd px-3 border border-border focus:border-primary focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={handleSendChat}
                                    className="p-1.5 text-text-muted hover:text-primary-light transition-colors"
                                    disabled={!chatInput.trim()}
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                            <p className="text-[9px] text-text-muted text-right mt-1">
                                {chatInput.length}/200
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Participant summary strip */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
                {participants.map((p) => (
                    <div
                        key={p.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-card border border-border rounded-full shrink-0"
                    >
                        <Avatar name={p.name} size="xs" />
                        <span className="text-[10px] text-text-primary font-medium">
                            {p.name.split(" ")[0]}
                        </span>
                        <span className="text-[10px] text-text-muted">
                            {p.isMe ? myProgress : p.progress}%
                        </span>
                        <span className="text-[10px]">
                            {getStatusEmoji(p.status)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tip */}
            <p className="text-center text-caption text-text-muted">
                💡 Stay focused! Your team is counting on you. Switching tabs is
                tracked.
            </p>
        </div>
    );
};

export default RaidInProgress;
