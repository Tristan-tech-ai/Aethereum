import React, { useMemo, useState, useEffect } from "react";
import { MessageCircle, Send, AlertTriangle, ChevronRight, Users, X } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../stores/authStore";

const normalizeSections = (raid) => {
    const structured = raid?.content?.structured_sections;
    if (Array.isArray(structured) && structured.length > 0) {
        return structured.map((section, index) => ({
            id: index + 1,
            title: section?.title || `Section ${index + 1}`,
            content: section?.content || section?.text || "",
        }));
    }

    const fallback = raid?.content?.ai_analysis?.summary || raid?.content?.description || "No section content available for this raid yet.";
    return [{ id: 1, title: raid?.content?.title || "Study Content", content: fallback }];
};

const RaidInProgress = ({
    raid = {},
    participants: externalParticipants,
    chatMessages: externalChatMessages = [],
    onComplete,
    onProgressUpdate,
    onSendChat,
    className = "",
}) => {
    const authUser = useAuthStore((s) => s.user);
    const sections = useMemo(() => normalizeSections(raid), [raid]);

    const participants = useMemo(() => {
        const source = externalParticipants || raid?.participants || [];
        return source.map((p) => {
            const pivot = p?.pivot || {};
            return {
                id: p.id,
                name: p.name || p.username || "Member",
                progress: Number(pivot.progress_percentage ?? 0),
                status: String(pivot.status || "learning"),
                isMe: p.id === authUser?.id,
            };
        });
    }, [externalParticipants, raid?.participants, authUser?.id]);

    const [currentSection, setCurrentSection] = useState(0);
    const [completedSections, setCompletedSections] = useState(new Set());
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        setChatMessages(externalChatMessages || []);
    }, [externalChatMessages]);

    const myProgress = Math.round((completedSections.size / Math.max(1, sections.length)) * 100);

    useEffect(() => {
        onProgressUpdate?.(myProgress);
    }, [myProgress, onProgressUpdate]);

    const teamProgress = Math.round((participants.reduce((sum, p) => sum + (p.isMe ? myProgress : p.progress), 0)) / Math.max(1, participants.length || 1));

    const getStatusEmoji = (status) => {
        if (status === "learning") return "📖";
        if (status === "quiz") return "⚔️";
        if (status === "completed") return "✅";
        return "⏳";
    };

    const handleCompleteSection = () => {
        const nextSet = new Set([...completedSections, currentSection]);
        setCompletedSections(nextSet);

        if (nextSet.size >= sections.length) {
            onComplete?.({ sectionsCompleted: sections.length, focusIntegrity: 100, distractions: 0, participants });
            return;
        }

        const nextIdx = sections.findIndex((_, i) => i > currentSection && !nextSet.has(i));
        if (nextIdx !== -1) setCurrentSection(nextIdx);
    };

    const handleSendChat = async () => {
        const text = chatInput.trim();
        if (!text) return;
        const localMessage = {
            id: Date.now(),
            user_id: authUser?.id,
            user_name: authUser?.name || "You",
            message: text,
        };

        setChatMessages((prev) => [...prev, localMessage]);
        setChatInput("");
        await onSendChat?.(text);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚔️</span>
                        <h2 className="text-h4 font-heading text-text-primary">{raid?.content?.title || "Study Raid"}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="primary">RAID ACTIVE</Badge>
                        <button onClick={() => setShowChat((v) => !v)} className="lg:hidden p-2 text-text-muted hover:text-primary-light transition-colors relative">
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-caption mb-1"><span className="text-text-muted flex items-center gap-1"><Users size={12} /> Team Progress</span><span className="text-text-secondary font-medium">{teamProgress}%</span></div>
                    <div className="w-full h-3 bg-dark-secondary rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: `${teamProgress}%` }} /></div>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="hidden md:block w-48 shrink-0 space-y-2">
                    <p className="text-caption text-text-muted font-medium uppercase tracking-wider mb-1">Raiders</p>
                    {participants.map((p) => (
                        <Card key={p.id} padding="compact" className={p.isMe ? "ring-1 ring-primary/30" : ""}>
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar name={p.name} size="xs" />
                                <div className="flex-1 min-w-0"><p className="text-[11px] font-medium text-text-primary truncate">{p.name}</p><p className="text-[10px] text-text-muted">Status: {p.status}</p></div>
                                <span className="text-sm" title={p.status}>{getStatusEmoji(p.status)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p.isMe ? myProgress : p.progress}%` }} /></div>
                        </Card>
                    ))}
                </div>

                <Card className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="text-h4 font-heading text-text-primary">{sections[currentSection]?.title || "Section"}</h3><p className="text-caption text-text-muted mt-1">Section {currentSection + 1} of {sections.length}</p></div>
                        <Badge variant="secondary">{myProgress}% complete</Badge>
                    </div>

                    <div className="mb-4 max-h-[46vh] overflow-auto pr-2 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{sections[currentSection]?.content || "No content."}</div>

                    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                        <div className="text-caption text-text-muted">Complete this section to continue</div>
                        <Button onClick={handleCompleteSection}>{completedSections.has(currentSection) ? "Continue" : "Complete Section"} <ChevronRight size={14} className="ml-1" /></Button>
                    </div>
                </Card>

                <div className={`fixed inset-y-0 right-0 w-[86%] max-w-sm z-40 bg-dark-base border-l border-border transform transition-transform duration-300 lg:static lg:translate-x-0 lg:w-80 lg:max-w-none lg:border lg:rounded-xl lg:bg-transparent ${showChat ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
                    <div className="h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between"><h4 className="text-sm font-semibold text-text-primary">Team Chat</h4><button onClick={() => setShowChat(false)} className="lg:hidden text-text-muted"><X size={16} /></button></div>
                        <div className="flex-1 overflow-auto p-3 space-y-2">{chatMessages.length === 0 ? <p className="text-xs text-text-muted text-center py-6">No messages yet.</p> : chatMessages.map((m, idx) => (<div key={m.id || idx} className="bg-dark-card border border-border rounded-lg p-2.5"><p className="text-[11px] text-text-muted">{m.user_name || m.user || "Member"}</p><p className="text-sm text-text-primary">{m.message || m.text}</p></div>))}</div>
                        <div className="p-3 border-t border-border flex items-end gap-2"><textarea value={chatInput} onChange={(e) => setChatInput(e.target.value.slice(0, 500))} placeholder="Type a message..." rows={2} className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-primary" /><Button size="sm" onClick={handleSendChat}><Send size={14} /></Button></div>
                    </div>
                </div>
            </div>

            {participants.length <= 1 && (
                <Card className="border-warning/30 bg-warning/5"><div className="flex items-center gap-2 text-warning text-sm"><AlertTriangle size={16} /> Waiting for more participants to make this raid collaborative.</div></Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sections.map((section, index) => (
                    <button key={section.id} onClick={() => setCurrentSection(index)} className={`text-left p-3 rounded-lg border transition-colors ${index === currentSection ? "border-primary bg-primary/10" : "border-border bg-dark-card hover:border-border-hover"}`}>
                        <div className="flex items-center justify-between"><p className="text-xs font-medium text-text-primary truncate">{section.title}</p><span className="text-xs">{completedSections.has(index) ? "✅" : "📄"}</span></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RaidInProgress;
