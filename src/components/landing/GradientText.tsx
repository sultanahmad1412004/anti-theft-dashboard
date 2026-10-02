import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  animate = true,
}) => {
  return (
    <span
      className={`inline-block font-bold ${
        animate ? 'gradient-text-animated' : 'bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'
      } ${className}`}
    >
      {children}
    </span>
  );
};
