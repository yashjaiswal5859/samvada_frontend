import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
}) => {
  return (
    <label
      className={`switch-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className="switch-white-track">
        <div className="switch-white-thumb" />
      </div>
      {(label || description) && (
        <div className="ml-3 flex flex-col">
          {label && <span className="text-xs font-semibold text-white">{label}</span>}
          {description && <span className="text-[10px] text-zinc-400 mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
};

export default Switch;
