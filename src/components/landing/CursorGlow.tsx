import React, { useEffect, useState } from 'react';

interface CursorGlowProps {
  radius?: number;
  className?: string;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({
  radius = 350,
  className = '',
}) => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Disable on touch screens or reduced motion
    if (window.matchMedia('(hover: none) or (prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none fixed z-10 transition-opacity duration-300 ${className}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, rgba(124, 58, 237, 0.04) 45%, transparent 70%)',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
};
