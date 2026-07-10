import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, message, type, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-accent-emerald" weight="fill" />,
    error: <XCircle className="w-5 h-5 text-accent-rose" weight="fill" />,
    warning: <Warning className="w-5 h-5 text-accent-amber" weight="fill" />,
    info: <Info className="w-5 h-5 text-accent-indigo" weight="fill" />,
  };

  const bgBorderMap = {
    success: 'bg-black/40 border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    error: 'bg-black/40 border-accent-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    warning: 'bg-black/40 border-accent-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    info: 'bg-black/40 border-accent-indigo/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-glass shadow-glass text-white min-w-[300px] max-w-md ${bgBorderMap[type]}`}
    >
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <div className="flex-grow text-sm font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
