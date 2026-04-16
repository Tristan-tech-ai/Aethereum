import { Bot, Brain, Target, BarChart2, Lightbulb, Flame, BookOpen, Star, AlertTriangle, Trophy, Rocket, Zap, ChevronRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAssistantStore } from '../../stores/assistantStore';

// ─── Icon resolver ─────────────────────────────────────────────
const ICON_MAP = {
    brain: Brain, target: Target, chart: BarChart2, lightbulb: Lightbulb,
    flame: Flame, book: BookOpen, star: Star, alert: AlertTriangle,
    trophy: Trophy, rocket: Rocket, zap: Zap, sparkles: Sparkles,
};
const resolveIcon = (name) => ICON_MAP[name] || Sparkles;

const METRIC_COLORS = {
    primary: 'text-primary-light bg-primary/15 border-primary/25',
    accent:  'text-accent bg-accent/15 border-accent/25',
    success: 'text-success bg-success/15 border-success/25',
    warning: 'text-warning bg-warning/15 border-warning/25',
    danger:  'text-danger bg-danger/15 border-danger/25',
};

const SECTION_STYLES = {
    insight:  { border: 'border-primary/30', bg: 'bg-primary/5',  icon: 'text-primary-light' },
    tip:      { border: 'border-accent/30',  bg: 'bg-accent/5',   icon: 'text-accent' },
    progress: { border: 'border-success/30', bg: 'bg-success/5',  icon: 'text-success' },
    warning:  { border: 'border-warning/30', bg: 'bg-warning/5',  icon: 'text-warning' },
    summary:  { border: 'border-border/40',  bg: 'bg-dark-card',  icon: 'text-text-muted' },
};

const PROSE_CLS = `prose prose-sm prose-invert max-w-none
    [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5
    [&_strong]:text-white [&_code]:bg-dark-secondary [&_code]:px-1 [&_code]:rounded
    [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h4]:text-sm
    [&_ul]:pl-4 [&_ol]:pl-4`;

// ─── Section Card ──────────────────────────────────────────────
const SectionCard = ({ section }) => {
    const style = SECTION_STYLES[section.type] || SECTION_STYLES.summary;
    const Icon = resolveIcon(section.icon);
    return (
        <div className={`rounded-xl border ${style.border} ${style.bg} p-3 mt-2`}>
            <div className="flex items-center gap-2 mb-1.5">
                <Icon size={13} className={style.icon} />
                <span className="text-xs font-semibold text-text-primary">{section.title}</span>
            </div>
            <div className={PROSE_CLS}>
                <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
        </div>
    );
};

// ─── Metrics Bar ───────────────────────────────────────────────
const MetricsBar = ({ metrics }) => {
    if (!metrics?.length) return null;
    return (
        <div className="flex flex-wrap gap-2 mt-2.5">
            {metrics.map((m, i) => {
                const Icon = resolveIcon(m.icon);
                const color = METRIC_COLORS[m.color] || METRIC_COLORS.primary;
                return (
                    <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${color}`}>
                        <Icon size={12} />
                        <span className="text-text-muted">{m.label}</span>
                        <span className="font-bold">{m.value}</span>
                    </div>
                );
            })}
        </div>
    );
};

// ─── CTA Buttons ───────────────────────────────────────────────
const CtaButtons = ({ cta }) => {
    const { sendMessage, setActiveTab } = useAssistantStore();
    if (!cta?.length) return null;

    const handleCta = (item) => {
        if (item.action === 'open_tab') setActiveTab(item.payload);
        else if (item.action === 'send_message') sendMessage(item.payload, 'general');
    };

    return (
        <div className="flex flex-wrap gap-1.5 mt-3">
            {cta.map((item, i) => (
                <button
                    key={i}
                    onClick={() => handleCta(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        bg-primary/10 text-primary-light border border-primary/25
                        hover:bg-primary/20 hover:border-primary/40
                        active:scale-[0.97] transition-all duration-150"
                >
                    <ChevronRight size={11} />
                    {item.label}
                </button>
            ))}
        </div>
    );
};

// ─── Rich Assistant Bubble ─────────────────────────────────────
const RichAssistantBubble = ({ structured }) => {
    const { set: setAssistantStore } = useAssistantStore();
    const data = typeof structured === 'string' ? null : structured;


    // Fallback to plain markdown if not structured
    if (!data || !data.message) {
        const text = typeof structured === 'string' ? structured : (structured?.message || '');
        return <div className={PROSE_CLS}><ReactMarkdown>{text}</ReactMarkdown></div>;
    }

    return (
        <div className="space-y-0">
            <div className={PROSE_CLS}><ReactMarkdown>{data.message}</ReactMarkdown></div>
            {data.user_data?.show && <MetricsBar metrics={data.user_data.metrics} />}
            {data.sections?.map((sec, i) => <SectionCard key={i} section={sec} />)}
            
            {(data.ui_type === 'quiz_ready' || data.phase === 'quiz_active') && (
                <button
                    onClick={() => {
                        const qId = data.payload?.quiz_id;
                        const mId = data.payload?.content_id;
                        if (qId && mId) {
                            setAssistantStore({ 
                                quizReady: { quizId: qId, materialId: mId } 
                            });
                        } else {
                            // Fallback: try to redirect anyway if we have materialId
                            if (mId) window.location.href = `/learn/${mId}`;
                        }
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl
                        bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-sm
                        shadow-lg shadow-primary/25 hover:shadow-primary/40 
                        hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <span>🚀</span>
                    Mulai Selesaikan Quiz
                </button>
            )}

            <CtaButtons cta={data.cta} />
        </div>


    );
};

// ─── Message Bubble ────────────────────────────────────────────
const AssistantMessage = ({ message }) => {
    const isUser = message.role === 'user';

    const getContent = () => {
        if (isUser) return message.content;
        // Structured from API response
        if (message.structured) return message.structured;
        if (typeof message.content === 'object' && message.content?.message) return message.content;
        // JSON string from loaded conversation
        if (typeof message.content === 'string') {
            try {
                const parsed = JSON.parse(message.content);
                if (parsed?.message) return parsed;
            } catch { /* plain text */ }
        }
        return message.content;
    };

    const content = getContent();

    return (
        <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary-light" />
                </div>
            )}
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                isUser
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-dark-elevated border border-border/40 text-text-primary rounded-tl-sm'
            }`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap">{typeof content === 'string' ? content : message.content}</p>
                ) : (
                    <RichAssistantBubble structured={content} />
                )}
            </div>
        </div>
    );
};

// ─── Message List ──────────────────────────────────────────────
const AssistantMessageList = ({ messages, sending }) => {
    return (
        <div className="flex flex-col gap-4 p-4">
            {messages.map((msg) => (
                <AssistantMessage key={msg.id} message={msg} />
            ))}
            {sending && (
                <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-primary-light" />
                    </div>
                    <div className="bg-dark-elevated border border-border/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                        <div className="flex gap-1 items-center h-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssistantMessageList;
export { AssistantMessage };
