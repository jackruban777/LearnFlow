import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { CircleNotch } from '@phosphor-icons/react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClick?: any;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'glass-button-primary',
  secondary: 'glass-button-secondary',
  success:   'glass-button-success',
  danger:    'relative overflow-hidden font-medium rounded-2xl text-white cursor-pointer transition-all duration-300 border border-white/20',
};

const DANGER_STYLE = {
  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
  boxShadow:  '0 4px 20px rgba(244,63,94,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function GlassButton({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  size = 'md',
  className = '',
  disabled,
  style,
  ...props
}: GlassButtonProps) {
  const isDanger = variant === 'danger';

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.015, translateY: -1 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled || isLoading}
      style={isDanger ? { ...DANGER_STYLE, ...style } : style}
      className={`
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed !transform-none' : ''}
        flex items-center justify-center gap-2
        ${className}
      `}
      {...(props as any)}
    >
      {isLoading ? (
        <CircleNotch size={18} className="animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
