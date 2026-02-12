import React, { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencyInput({ label, value, onValueChange, className, ...props }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure value is always formatted or 0.00
  const displayValue = value ? value : "0.00";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Get raw digits from current input
    const rawValue = e.target.value.replace(/\D/g, "");

    // 2. Parse as integer (cents)
    const cents = parseInt(rawValue || "0", 10);

    // 3. Convert to dollars/euros
    const amount = cents / 100;

    // 4. Format back to string
    const formatted = amount.toFixed(2);

    onValueChange(formatted);
  };

  // Force cursor to end on render/update
  useEffect(() => {
    if (inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [value]);

  // Determine split for styling
  const getStyledParts = (val: string) => {
    const floatVal = parseFloat(val);
    if (floatVal === 0) return { gray: val, white: "" };
    if (floatVal >= 1) return { gray: "", white: val };

    // Find first non-zero, non-dot char
    let index = -1;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== '0' && val[i] !== '.') {
        index = i;
        break;
      }
    }

    if (index === -1) return { gray: val, white: "" };
    return {
      gray: val.slice(0, index),
      white: val.slice(index)
    };
  };

  const { gray, white } = getStyledParts(displayValue);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg z-20">€</span>

        {/* Visual Layer (Ghost) */}
        <div className={cn(
          "absolute inset-0 w-full pl-10 pr-4 py-4 rounded-2xl bg-card border-none shadow-sm flex items-center text-2xl font-bold pointer-events-none z-0 transition-all group-hover:shadow-md",
          className
        )}>
          <span className="text-muted-foreground/30 select-none">{gray}</span>
          <span className="text-foreground select-none">{white}</span>
        </div>

        {/* Interaction Layer (Transparent Input) */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full pl-10 pr-4 py-4 rounded-2xl bg-transparent border-none text-2xl font-bold text-transparent caret-primary focus:outline-none z-10",
            // Remove text shadow or other artifacts
            "placeholder:text-transparent selection:bg-transparent"
          )}
          style={{ textShadow: 'none' }} // Ensure no shadow leaks
          {...props}
        />
      </div>
    </div>
  );
}
