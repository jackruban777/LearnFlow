import { ReactNode, HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'violet' | 'default' | 'locked';

interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  error: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  info: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
  violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
  default: 'bg-white/10 border-white/20 text-gray-300',
  locked: 'bg-gray-800/60 border-gray-700/40 text-gray-500',
};

export function GlassBadge({ children, variant = 'default', size = 'md', className = '' }: GlassBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        backdrop-blur-glass-sm
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}
        ${BADGE_CLASSES[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
