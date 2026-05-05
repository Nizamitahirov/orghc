"use client";
import { useEffect, useCallback, useRef, useId } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIZES = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  xl:   "max-w-4xl",
  full: "max-w-[95vw]",
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  darkMode = false,
  closeOnBackdrop = true,
  hideClose = false,
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  // Save & restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const raf = requestAnimationFrame(() => {
        const el = panelRef.current?.querySelector(FOCUSABLE);
        el?.focus();
      });
      return () => cancelAnimationFrame(raf);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Escape + focus trap
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") { onClose?.(); return; }
      if (e.key !== "Tab") return;
      const focusables = [
        ...(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []),
      ];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={[
              "relative w-full flex flex-col",
              "rounded-t-2xl sm:rounded-xl shadow-2xl",
              "max-h-[92dvh] sm:max-h-[90vh]",
              SIZES[size] || SIZES.md,
              darkMode
                ? "bg-gray-800 border border-gray-700 text-white dark:bg-gray-800 dark:border-gray-700"
                : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            ].join(" ")}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            {(title || !hideClose) && (
              <div
                className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
                  darkMode ? "border-gray-700" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {title && (
                  <h2 id={titleId} className="text-base font-semibold truncate">
                    {title}
                  </h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className={`ml-auto p-1.5 rounded-lg transition-all ${
                      darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className={`px-6 py-4 border-t flex-shrink-0 ${
                  darkMode ? "border-gray-700" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
