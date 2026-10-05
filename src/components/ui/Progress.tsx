import React from 'react';

interface ProgressProps {
  value: number; // 0 - 100
  max?: number;
  className?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  color = 'indigo',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`w-full bg-zinc-800 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full ${colors[color]} transition-all duration-300 rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
