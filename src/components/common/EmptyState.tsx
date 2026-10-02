import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#1E293B]/60 border border-slate-200 dark:border-[#334155]/60 rounded-2xl shadow-xs transition-colors duration-200 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF] mb-4 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
        {icon || <ShieldAlert className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-[#94A3B8] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="cyan" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
