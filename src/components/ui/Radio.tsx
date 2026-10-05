import React, { InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={generatedId}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${
        props.disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="radio"
        id={generatedId}
        className={`radio-white mt-0.5 ${className}`}
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-white group-hover:text-zinc-200 transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-zinc-400 leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Radio;
