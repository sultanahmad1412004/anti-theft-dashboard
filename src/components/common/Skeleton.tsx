import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-lg border border-slate-300/40 dark:border-slate-700/30 ${className}`}
    />
  );
};

export const DeviceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="w-36 h-5" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-48 h-4" />
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#334155]/60">
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-10 h-5 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-10 h-5 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-full h-9 rounded-xl pt-2" />
    </div>
  );
};
