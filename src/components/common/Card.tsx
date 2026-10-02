import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface2' | 'glow' | 'accent' | 'glass';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  id,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 overflow-hidden';

  const variantStyles = {
    default: 'glass-surface text-slate-800 dark:text-[#E2E8F0]',
    glass: 'glass-surface text-slate-800 dark:text-[#E2E8F0]',
    surface2: 'bg-slate-50/90 dark:bg-[#152033]/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-[#E2E8F0] shadow-sm',
    glow: 'glass-surface border-cyan-500/50 dark:border-[#00E5FF]/50 text-slate-800 dark:text-[#E2E8F0] shadow-lg shadow-cyan-500/10 dark:shadow-[0_0_30px_rgba(0,229,255,0.2)]',
    accent: 'bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#111927]/90 dark:to-[#1A2436]/90 border border-cyan-500/30 dark:border-[#00E5FF]/30 text-slate-800 dark:text-[#E2E8F0] shadow-md'
  };

  const hoverStyles = hoverEffect ? 'elevate-3d cursor-pointer' : '';

  return (
    <div id={id} className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
