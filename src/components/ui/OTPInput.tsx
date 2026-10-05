import React, { useRef, useState, KeyboardEvent, ChangeEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, disabled = false }) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) return;

    const newDigits = [...digits];
    // If pasted multiple digits
    if (value.length > 1) {
      const pasted = value.slice(0, length).split('');
      pasted.forEach((char, i) => {
        if (index + i < length) {
          newDigits[index + i] = char;
        }
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newDigits[index] = value[value.length - 1];
      setDigits(newDigits);
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    const combined = newDigits.join('');
    if (combined.length === length && !newDigits.includes('')) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '') {
        if (index > 0) {
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          setDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={6}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-xl font-bold bg-[#13141a] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      ))}
    </div>
  );
};
