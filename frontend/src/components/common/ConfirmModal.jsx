import { useEffect, useRef } from 'react';
import favicon from '../../assets/favicon.png';

/**
 * Reusable confirmation modal with glassmorphic design, smooth animations,
 * and attractive brand integration using the AcademiX logo and orange accents.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - title: string
 * - message: string
 * - confirmText: string (default: 'Confirm')
 * - cancelText: string (default: 'Cancel')
 * - variant: 'danger' | 'info' (default: 'danger')
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: 'confirmFadeIn 0.2s ease-out' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-0 overflow-hidden outline-none border border-slate-100"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'confirmScaleIn 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Top accent bar matching AcademiX orange */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500" />

        <div className="p-6 pt-5">
          {/* Brand Logo Header Container with glow */}
          <div className="flex justify-center mb-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 border border-orange-100/60 shadow-inner">
              {/* Outer pulsing ring */}
              <span className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
              {/* AcademiX Logo */}
              <img
                src={favicon}
                alt="AcademiX"
                className="w-10 h-10 object-contain relative z-10 filter drop-shadow-sm"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{title}</h3>

          {/* Message */}
          {message && (
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-6 px-1">{message}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl border-none text-white text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmScaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
