import { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * Message input area with send button.
 * Shift+Enter = newline, Enter = send.
 */
const AssistantComposer = ({ onSend, disabled = false, placeholder = 'Tanya Nexera...' }) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);

    const handleSend = () => {
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setValue(e.target.value);
        // Auto-grow textarea
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    return (
        <div className="flex gap-2 items-end p-3 bg-dark-card border-t border-border/40">
            <textarea
                ref={textareaRef}
                value={value}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                rows={1}
                className="flex-1 resize-none bg-dark-secondary border border-border/40 rounded-xl
                    px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted
                    focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30
                    disabled:opacity-50 transition-colors min-h-[40px] max-h-[120px] overflow-y-auto"
            />
            <button
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center
                    text-white transition-all duration-200
                    hover:bg-primary-dark hover:shadow-glow-primary
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                    shrink-0"
            >
                {disabled ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Send size={16} />
                )}
            </button>
        </div>
    );
};

export default AssistantComposer;
