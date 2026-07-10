import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  forwardRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface NotificationContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  info: Info,
};

const COLORS = {
  success: 'border-emerald-500/40 text-emerald-400',
  error: 'border-rose-500/40 text-rose-400',
  warning: 'border-amber-500/40 text-amber-400',
  info: 'border-indigo-500/40 text-indigo-400',
};

const ToastItem = forwardRef<HTMLDivElement, { toast: Toast; onDismiss: () => void }>(
  ({ toast, onDismiss }, ref) => {
    const Icon = ICONS[toast.type];

    useEffect(() => {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 32, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className={`glass-panel flex items-start gap-3 px-4 py-3 min-w-[280px] max-w-sm border ${COLORS[toast.type]}`}
      >
        <Icon size={20} weight="fill" className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </motion.div>
    );
  }
);
ToastItem.displayName = 'ToastItem';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToasts((prev) => {
        // Prevent duplicate toasts from stacking
        const isDuplicate = prev.some(
          (t) => t.title === title && t.message === message
        );
        if (isDuplicate) return prev;

        const id = crypto.randomUUID();
        return [...prev, { id, type, title, message }];
      });
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
