import { BookOpen, BarChart2, Zap, Brain, Target, Flame } from 'lucide-react';

const SUGGESTIONS = [
    { icon: Target, label: 'Buat rencana belajar', message: 'Bantu saya membuat rencana belajar minggu ini.' },
    { icon: BarChart2, label: 'Evaluasi progress saya', message: 'Bagaimana progress belajar saya sejauh ini? Apa yang perlu diperbaiki?' },
    { icon: BookOpen, label: 'Bantu section ini', message: 'Jelaskan materi yang sedang saya pelajari sekarang dengan bahasa yang lebih mudah.' },
    { icon: Brain, label: 'Tips fokus belajar', message: 'Berikan tips agar saya bisa lebih fokus saat belajar.' },
    { icon: Zap, label: 'Quiz saya sekarang', message: 'Buatkan 3 pertanyaan singkat berdasarkan materi yang sedang saya pelajari.' },
    { icon: Flame, label: 'Motivasi streak', message: 'Berikan motivasi agar saya terus konsisten belajar setiap hari.' },
];

/**
 * Suggestion chip grid shown on empty conversation.
 */
const AssistantQuickActions = ({ onSelect }) => {
    return (
        <div className="px-4 pb-4">
            <p className="text-xs text-text-muted mb-3 text-center">
                Mulai dengan salah satu pertanyaan ini
            </p>
            <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map(({ icon: Icon, label, message }) => (
                    <button
                        key={label}
                        onClick={() => onSelect(message)}
                        className="flex items-center gap-2 p-2.5 rounded-xl text-left
                            bg-dark-elevated border border-border/40 text-text-secondary hover:text-text-primary
                            hover:border-primary/40 hover:bg-primary/5
                            transition-all duration-200 text-xs group"
                    >
                        <Icon size={14} className="text-primary-light shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="leading-tight">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AssistantQuickActions;
