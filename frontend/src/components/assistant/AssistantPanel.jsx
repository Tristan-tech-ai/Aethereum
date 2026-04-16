import { useEffect, useRef, useState } from 'react';
import { X, Bot, MessageSquare, Target, BarChart2, Plus, Trash2, Loader2, History, ChevronLeft, Clock } from 'lucide-react';
import { useAssistantStore } from '../../stores/assistantStore';
import AssistantMessageList from './AssistantMessageList';
import AssistantComposer from './AssistantComposer';
import AssistantQuickActions from './AssistantQuickActions';
import StudyPlanCard from './StudyPlanCard';
import { useAuthStore } from '../../stores/authStore';
import ReactMarkdown from 'react-markdown';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Sparkles } from 'lucide-react';


const TABS = [
    { key: 'chat',    label: 'Chat',     icon: MessageSquare },
    { key: 'plan',    label: 'Rencana',  icon: Target },
    { key: 'reflect', label: 'Refleksi', icon: BarChart2 },
];

// ─── Chat History Drawer ───────────────────────────────────────
const ChatHistoryDrawer = ({ conversations, loading, onSelect, onDelete, onNew, currentId, onClose }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Baru saja';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari lalu`;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* History header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30 shrink-0">
                <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <History size={14} className="text-primary-light" />
                <span className="text-xs font-semibold text-text-primary">Riwayat Chat</span>
                <button
                    onClick={() => { onNew(); onClose(); }}
                    className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary-light bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                    <Plus size={11} /> Baru
                </button>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center pt-12">
                        <Loader2 size={18} className="animate-spin text-primary-light" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MessageSquare size={28} className="mx-auto text-text-muted/30 mb-2" />
                        <p className="text-xs text-text-muted">Belum ada riwayat chat</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group flex items-start gap-2 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                                    conv.id === currentId
                                        ? 'bg-primary/10 border border-primary/25'
                                        : 'hover:bg-white/[0.04] border border-transparent'
                                }`}
                                onClick={() => { onSelect(conv.id); onClose(); }}
                            >
                                <MessageSquare size={13} className={`shrink-0 mt-0.5 ${conv.id === currentId ? 'text-primary-light' : 'text-text-muted'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${conv.id === currentId ? 'text-primary-light' : 'text-text-primary'}`}>
                                        {conv.title || 'Percakapan baru'}
                                    </p>
                                    <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                                        <Clock size={9} />
                                        {formatDate(conv.updated_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-danger transition-all"
                                >
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Panel ────────────────────────────────────────────────
const AssistantPanel = () => {
    const { user } = useAuthStore();
    const {
        isOpen,
        activeTab,
        messages,
        sending,
        error,
        currentConversationId,
        conversations,
        conversationsLoading,
        reflection,
        reflectionLoading,
        reflectionError,
        setActiveTab,
        closePanel,
        sendMessage,
        newConversation,
        fetchConversations,
        loadConversation,
        deleteConversation,
        getReflection,
        quizReady,
        clearQuizReady,
    } = useAssistantStore();


    const messagesEndRef = useRef(null);
    const [showHistory, setShowHistory] = useState(false);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, sending]);

    // Fetch conversations when panel opens
    useEffect(() => {
        if (isOpen && activeTab === 'chat' && user) {
            fetchConversations();
        }
    }, [isOpen, user]);

    // Fetch reflection when tab opens
    useEffect(() => {
        if (isOpen && activeTab === 'reflect' && !reflection && user) {
            getReflection();
        }
    }, [activeTab, isOpen, user]);

    if (!isOpen) return null;

    const handleSend = (text) => {
        sendMessage(text, 'general');
    };

    const handleSuggestion = (text) => {
        sendMessage(text, 'general');
    };

    const isEmpty = messages.length === 0;

    return (
        <>
            {/* Backdrop (mobile) */}
            <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={closePanel}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col
                w-full sm:w-[420px]
                bg-dark-primary border-l border-border/50
                shadow-2xl transition-transform duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-dark-secondary shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <Bot size={16} className="text-primary-light" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary font-heading">Nexera Assistant</p>
                            <p className="text-[10px] text-text-muted">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button
                        onClick={closePanel}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border/40 bg-dark-secondary shrink-0">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => { setActiveTab(key); setShowHistory(false); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                                activeTab === key
                                    ? 'text-primary-light border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <Icon size={13} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── CHAT TAB ─────────────────────────────────────────── */}
                {activeTab === 'chat' && (
                    <>
                        {showHistory ? (
                            <ChatHistoryDrawer
                                conversations={conversations}
                                loading={conversationsLoading}
                                onSelect={loadConversation}
                                onDelete={deleteConversation}
                                onNew={newConversation}
                                currentId={currentConversationId}
                                onClose={() => setShowHistory(false)}
                            />
                        ) : (
                            <>
                                {/* Conversation action bar */}
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-dark-card border-b border-border/30 shrink-0">
                                    <button
                                        onClick={() => setShowHistory(true)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
                                    >
                                        <History size={12} />
                                        Riwayat
                                        {conversations.length > 0 && (
                                            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary-light text-[9px] font-bold">
                                                {conversations.length}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={newConversation}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
                                    >
                                        <Plus size={12} /> Baru
                                    </button>
                                    {currentConversationId && (
                                        <button
                                            onClick={() => deleteConversation(currentConversationId)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-danger hover:bg-danger/10 transition-colors ml-auto"
                                        >
                                            <Trash2 size={12} /> Hapus
                                        </button>
                                    )}
                                </div>

                                {/* Messages area */}
                                <div className="flex-1 overflow-y-auto">
                                    {isEmpty && !sending ? (
                                        <>
                                            {/* Welcome */}
                                            <div className="px-4 pt-6 pb-4 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-3">
                                                    <Bot size={28} className="text-primary-light" />
                                                </div>
                                                <h3 className="text-base font-bold font-heading text-text-primary mb-1">
                                                    Halo{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
                                                </h3>
                                                <p className="text-xs text-text-muted leading-relaxed">
                                                    Aku Nexera, asisten belajar personalmu.
                                                    Tanya apa saja tentang belajarmu — aku bisa lihat data progresmu
                                                    dan kasih arahan yang tepat.
                                                </p>
                                            </div>
                                            <AssistantQuickActions onSelect={handleSuggestion} />
                                        </>
                                    ) : (
                                        <AssistantMessageList messages={messages} sending={sending} />
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {error && (
                                    <div className="mx-3 mb-2 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-2">
                                        {error}
                                    </div>
                                )}

                                <AssistantComposer onSend={handleSend} disabled={sending} />
                            </>
                        )}
                    </>
                )}

                {/* ── PLAN TAB ──────────────────────────────────────────── */}
                {activeTab === 'plan' && (
                    <div className="flex-1 overflow-y-auto">
                        <StudyPlanCard />
                    </div>
                )}

                {/* ── REFLECT TAB ───────────────────────────────────────── */}
                {activeTab === 'reflect' && (
                    <div className="flex-1 overflow-y-auto p-4">
                        {reflectionLoading && (
                            <div className="flex flex-col items-center justify-center pt-16 gap-3">
                                <Loader2 size={24} className="animate-spin text-primary-light" />
                                <p className="text-sm text-text-muted">Menganalisis progresmu...</p>
                            </div>
                        )}

                        {reflectionError && (
                            <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                                {reflectionError}
                            </div>
                        )}

                        {reflection && !reflectionLoading && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <BarChart2 size={16} className="text-primary-light" />
                                    <h3 className="text-sm font-bold font-heading text-text-primary">
                                        Refleksi Progres Belajar
                                    </h3>
                                </div>
                                <div className="prose prose-sm prose-invert max-w-none
                                    [&_p]:text-text-secondary [&_p]:text-sm [&_p]:leading-relaxed
                                    [&_h2]:text-text-primary [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-4
                                    [&_h3]:text-text-primary [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3
                                    [&_ul]:pl-4 [&_ul]:text-text-secondary [&_li]:text-sm [&_li]:my-0.5
                                    [&_strong]:text-text-primary">
                                    <ReactMarkdown>{reflection}</ReactMarkdown>
                                </div>
                                <button
                                    onClick={getReflection}
                                    className="w-full py-2 mt-2 rounded-xl border border-border/50 text-text-muted hover:text-text-primary hover:border-border text-xs transition-colors"
                                >
                                    Refresh refleksi
                                </button>
                            </div>
                        )}

                        {!reflection && !reflectionLoading && !reflectionError && (
                            <div className="text-center py-12">
                                <BarChart2 size={36} className="mx-auto text-text-muted/30 mb-3" />
                                <p className="text-sm text-text-secondary mb-3">
                                    Lihat analisis mendalam tentang progres belajarmu
                                </p>
                                <button
                                    onClick={getReflection}
                                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
                                >
                                    Analisis Sekarang
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── QUIZ READY MODAL ───────────────────────────────────── */}
            <Modal
                isOpen={!!quizReady}
                onClose={clearQuizReady}
                title="Quiz Sudah Siap! 🚀"
                size="sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <Sparkles size={32} className="text-primary-light animate-pulse" />
                    </div>
                    <div>
                        <p className="text-text-primary font-semibold mb-1">
                            Latihan Soal Telah Berhasil Dibuat
                        </p>
                        <p className="text-text-muted text-xs">
                            Siapkan dirimu! Kamu akan masuk ke mode kuis interaktif untuk menguji pemahamanmu tentang materi ini.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-2">
                        <Button 
                            onClick={() => {
                                const { materialId, quizId } = quizReady;
                                window.location.href = `/learn/${materialId}?quiz=${quizId}`;
                                clearQuizReady();
                            }}
                        >
                            Mulai Sekarang
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={clearQuizReady}
                        >
                            Nanti Saja
                        </Button>
                    </div>
                </div>
            </Modal>
        </>

    );
};

export default AssistantPanel;
