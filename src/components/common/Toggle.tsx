import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  isLoading = false,
  size = 'md'
}) => {
  const switchSize = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const knobSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const knobTranslate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <div className="flex items-center justify-between gap-3">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-[#E2E8F0] cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled || isLoading}
        onClick={() => !disabled && !isLoading && onChange(!checked)}
        className={`relative inline-flex items-center shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0F172A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${switchSize} ${
          checked ? 'bg-cyan-500 dark:bg-[#00E5FF]' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white dark:bg-slate-900 shadow-md transform ring-0 transition-transform duration-200 ease-in-out flex items-center justify-center ${knobSize} ${
            checked ? knobTranslate : 'translate-x-1'
          }`}
        >
          {isLoading && <Loader2 className="w-2.5 h-2.5 animate-spin text-cyan-600 dark:text-[#00E5FF]" />}
        </span>
      </button>
    </div>
  );
};
