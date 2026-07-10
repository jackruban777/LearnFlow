import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', glow = false, hover = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, translateY: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        liquid-card
        ${hover ? 'cursor-pointer' : ''}
        ${glow ? 'glow-ring' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
