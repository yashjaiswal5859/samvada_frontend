import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#12131a] border border-zinc-800/90 rounded-2xl p-6 transition-all duration-200 ${
        hoverable
          ? 'hover:border-zinc-700 hover:bg-[#161722] hover:shadow-xl cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
