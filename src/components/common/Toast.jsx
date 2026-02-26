
'use client'
import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Context
const ToastContext = createContext();

// Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    showSuccess: (msg, d = 4000) => addToast(msg, 'success', d),
    showError: (msg, d = 6000) => addToast(msg, 'error', d),
    showWarning: (msg, d = 5000) => addToast(msg, 'warning', d),
    showInfo: (msg, d = 4000) => addToast(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

// Container
const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};


// Toast
const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration > 0) {
      const start = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.max(100 - (elapsed / toast.duration) * 100, 0);
        setProgress(percent);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [toast.duration]);

  const handleClose = () => removeToast(toast.id);

  // Ultra soft, muted colors
  const typeStyles = {
    success: 'from-green-50/90 via-emerald-50/80 to-green-50/70 border-green-100/60 text-green-800',
    error: 'from-red-50/90 via-rose-50/80 to-red-50/70 border-red-100/60 text-red-800',
    warning: 'from-amber-50/90 via-yellow-50/80 to-amber-50/70 border-amber-100/60 text-amber-800',
    info: 'from-blue-50/90 via-indigo-50/80 to-blue-50/70 border-blue-100/60 text-blue-800',
  };

  const progressColors = {
    success: 'bg-green-200/40',
    error: 'bg-red-200/40', 
    warning: 'bg-amber-200/40',
    info: 'bg-blue-200/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.98, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98, x: 20 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={`relative rounded-3xl border shadow-sm overflow-hidden 
      bg-gradient-to-br backdrop-blur-sm ${typeStyles[toast.type] || typeStyles.info}
      hover:shadow-md transition-shadow duration-300`}
      style={{
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center px-5 py-4 gap-4">
        <span className="flex-shrink-0 text-lg opacity-80">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✕'}
          {toast.type === 'warning' && '⚡'}
          {toast.type === 'info' && 'i'}
        </span>
        <p className="flex-1 text-sm font-normal leading-relaxed opacity-90">
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 
          w-6 h-6 rounded-full hover:bg-white/30 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/20">
          <motion.div
            className={`h-full rounded-full ${progressColors[toast.type] || progressColors.info}`}
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

