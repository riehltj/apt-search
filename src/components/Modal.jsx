import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Only the top-most modal reacts to Escape.
const stack = [];

// Bottom sheet on phones, centered dialog on larger screens.
// Children should include their own scrolling body / footer (see ModalBody).
export function Modal({ title, onClose, dismissOnBackdrop = true, children }) {
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    stack.push(id);
    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id) closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      if (!stack.length) document.body.style.overflow = '';
    };
  }, [id]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/50 sm:items-center sm:p-6"
      onMouseDown={(e) => dismissOnBackdrop && e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-stone-200 bg-stone-50 shadow-xl sm:rounded-3xl dark:border-stone-800 dark:bg-stone-950"
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-3 dark:border-stone-800">
          <h2 className="truncate text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const ModalBody = ({ children }) => <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>;

export const ModalFooter = ({ children }) => (
  <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-white px-5 py-3 dark:border-stone-800 dark:bg-stone-900">
    {children}
  </div>
);
