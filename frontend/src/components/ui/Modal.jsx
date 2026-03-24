import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const sizes = {
    sm: 'max-w-modal-sm',
    md: 'max-w-modal-md',
    lg: 'max-w-modal-lg',
  };

  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  // Focus trap + body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => modalRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Key event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 animate-[fadeIn_200ms_ease-out]"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`
          relative w-full ${sizes[size]}
          bg-dark-elevated rounded-lg-drd p-6
          shadow-lg-drd
          animate-[scaleIn_300ms_ease-out]
          focus:outline-none
        `}
        style={{
          '--tw-enter-opacity': '0',
          '--tw-enter-scale': '0.95',
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-h3 font-heading text-text-primary">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-sm-drd transition-colors duration-fast"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
