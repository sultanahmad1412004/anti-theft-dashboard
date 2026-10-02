import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const isBusy = Boolean(isLoading || loading);
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap rounded-xl btn-tactile';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#00E5FF] text-[#0F172A] font-bold hover:bg-[#2bf0ff] shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/35 focus:ring-[#00E5FF] focus:ring-offset-[#0F172A]',
    cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-[#00E5FF] border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/60 focus:ring-cyan-500 shadow-xs',
    secondary: 'bg-slate-100 dark:bg-[#1A2436] text-slate-800 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1F2E45] hover:bg-slate-200 dark:hover:bg-[#223048] focus:ring-slate-400 shadow-xs',
    outline: 'bg-white/60 dark:bg-[#111927]/60 backdrop-blur-md text-slate-800 dark:text-[#E2E8F0] border border-slate-300/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 dark:hover:border-[#00E5FF]/50 focus:ring-[#00E5FF] shadow-xs',
    ghost: 'bg-transparent text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#E2E8F0] hover:bg-slate-100 dark:hover:bg-[#1E293B]/70 focus:ring-slate-500',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40 focus:ring-red-500'
  };

  return (
    <button
      id={id}
      disabled={disabled || isBusy}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isBusy ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isBusy && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
