import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from './GlassButton';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {icon && (
        <div className="mb-5 p-5 glass-panel rounded-2xl text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>}
      {action && (
        <GlassButton onClick={action.onClick}>{action.label}</GlassButton>
      )}
    </motion.div>
  );
}
