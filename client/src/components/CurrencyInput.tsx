import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencyInput({ label, value, onValueChange, className, ...props }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Use the value directly, default to empty string if undefined
  const displayValue = value ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Replace dot with comma
    newValue = newValue.replace(/\./g, ',');

    // Allow digits and only one comma
    const parts = newValue.split(',');
    if (parts.length > 2) {
      return; // Do nothing if multiple commas
    }

    // Validate characters: only digits and comma
    if (!/^[0-9,]*$/.test(newValue)) {
      return;
    }

    // Optional: limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }

    onValueChange(newValue);
  };

  // Determine split for styling
  const getStyledParts = (val: string) => {
    // Replace comma with dot for parsing
    const normalized = val.replace(',', '.');
    const floatVal = parseFloat(normalized);

    if (isNaN(floatVal) || floatVal === 0) return { gray: val, white: "" };
    if (floatVal >= 1) return { gray: "", white: val };

    // Find first non-zero, non-comma char
    let index = -1;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== '0' && val[i] !== ',' && val[i] !== '.') {
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] font-mono">{label}</label>
      <div className="relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-mono font-bold text-xl z-20">€</span>

        {/* Visual Layer (Ghost) */}
        <div className={cn(
          "absolute inset-0 w-full pl-10 pr-4 py-2.5 border-3 bg-card flex items-center text-2xl font-bold font-mono pointer-events-none z-0 transition-all",
          isFocused ? "border-primary shadow-[2px_2px_0px_0px_hsl(var(--primary))] translate-x-[2px] translate-y-[2px]" : "border-foreground brutal-shadow",
          className
        )}>
          <span className="text-muted-foreground/20 select-none">{gray}</span>
          <span className="text-foreground select-none">{white}</span>
        </div>

        {/* Interaction Layer (Transparent Input) */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Small delay to allow button click to register before hiding
            setTimeout(() => setIsFocused(false), 150);
          }}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 border-3 border-transparent bg-transparent text-2xl font-bold font-mono text-transparent caret-primary focus:outline-none z-10 rounded-none",
            "placeholder:text-transparent selection:bg-transparent"
          )}
          style={{ textShadow: 'none' }}
          {...props}
        />


      </div>
    </div>
  );
}
