import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  options: (SelectOption | string)[];
  onChange?: (eventOrValue: any) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  size?: 'sm' | 'md';
}

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  defaultValue,
  options = [],
  onChange,
  placeholder = 'Select option…',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  error,
  helperText,
  disabled = false,
  requiredStar = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue ?? ''
  );
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchronize internal value when controlled prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = (options || []).map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const activeValue = value !== undefined ? value : internalValue;
  const selectedOption = normalizedOptions.find((opt) => opt.value === activeValue);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 210;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle scroll and resize to update coordinates without affecting parent
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      updateCoords();
    };

    const handleResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    setInternalValue(optionValue);
    setIsOpen(false);

    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue, name: name || id || '' },
        currentTarget: { value: optionValue, name: name || id || '' },
        stopPropagation: () => {},
        preventDefault: () => {},
        value: optionValue,
      };
      onChange(syntheticEvent);
    }
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`relative w-full space-y-1.5 text-left ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 tracking-normal"
        >
          {label}
          {requiredStar && <span className="text-emerald-600 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          id={inputId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            if (!disabled) {
              if (!isOpen) updateCoords();
              setIsOpen(!isOpen);
            }
          }}
          className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-white text-left transition-all outline-none box-border ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
              : 'cursor-pointer hover:border-slate-300'
          } ${
            error
              ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
              : isOpen
              ? 'border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
          } ${
            size === 'sm'
              ? 'px-3 py-1.5 text-xs min-h-[36px]'
              : 'px-3.5 py-2.5 text-xs min-h-[42px]'
          } ${buttonClassName}`}
        >
          <div className="flex items-center gap-2 truncate min-w-0 flex-1">
            {selectedOption?.icon && (
              <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
            )}
            <span
              className={`truncate ${
                selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {isOpen && coords && createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: coords.openUpward ? undefined : `${coords.top}px`,
              bottom: coords.openUpward ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={`bg-white border border-slate-200/90 rounded-xl p-1.5 shadow-2xl shadow-slate-900/15 max-h-52 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in zoom-in-95 duration-150 box-border ${dropdownClassName}`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === activeValue;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    title={opt.label}
                    onClick={() => {
                      if (opt.disabled) return;
                      handleSelect(opt.value);
                    }}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                      {opt.icon && (
                        <span className="shrink-0 text-slate-400 group-hover:text-emerald-600">
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate min-w-0 flex-1">
                        <div className="truncate text-xs font-normal text-slate-900">
                          {opt.label}
                        </div>
                        {opt.sublabel && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
};
