import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'success' | 'warning' | 'danger' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  pulse = false,
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  const variantStyles = {
    cyan: 'bg-cyan-50 dark:bg-[#00E5FF]/15 text-cyan-700 dark:text-[#00E5FF] border border-cyan-200 dark:border-[#00E5FF]/30',
    success: 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#10B981] border border-emerald-200 dark:border-[#10B981]/30',
    warning: 'bg-amber-50 dark:bg-[#F59E0B]/15 text-amber-700 dark:text-[#F59E0B] border border-amber-200 dark:border-[#F59E0B]/30',
    danger: 'bg-red-50 dark:bg-[#EF4444]/15 text-red-700 dark:text-[#EF4444] border border-red-200 dark:border-[#EF4444]/30',
    neutral: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40'
  };

  const dotColors = {
    cyan: 'bg-cyan-600 dark:bg-[#00E5FF]',
    success: 'bg-emerald-600 dark:bg-[#10B981]',
    warning: 'bg-amber-600 dark:bg-[#F59E0B]',
    danger: 'bg-red-600 dark:bg-[#EF4444]',
    neutral: 'bg-slate-500 dark:bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
