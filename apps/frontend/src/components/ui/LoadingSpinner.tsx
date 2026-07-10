import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const SIZE_MAP = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };

export function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${SIZE_MAP[size]} rounded-full border-2 border-white/10 border-t-accent-violet`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-800/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return spinner;
}
