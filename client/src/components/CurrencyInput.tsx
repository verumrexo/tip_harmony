import React, { useRef } from 'react';
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencyInput({ label, value, onValueChange, className, ...props }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleCommaClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent losing focus
    if (!displayValue.includes(',')) {
      const newValue = displayValue + ',';
      onValueChange(newValue);

      // Focus input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
         if (inputRef.current) {
            inputRef.current.focus();
         }
    }
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg z-20">€</span>

        {/* Visual Layer (Ghost) */}
        <div className={cn(
          "absolute inset-0 w-full pl-10 pr-16 py-4 rounded-2xl bg-card border-none shadow-sm flex items-center text-2xl font-bold pointer-events-none z-0 transition-all group-hover:shadow-md",
          className
        )}>
          <span className="text-muted-foreground/30 select-none">{gray}</span>
          <span className="text-foreground select-none">{white}</span>
        </div>

        {/* Interaction Layer (Transparent Input) */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full pl-10 pr-16 py-4 rounded-2xl bg-transparent border-none text-2xl font-bold text-transparent caret-primary focus:outline-none z-10",
            // Remove text shadow or other artifacts
            "placeholder:text-transparent selection:bg-transparent"
          )}
          style={{ textShadow: 'none' }}
          {...props}
        />

        {/* Comma Button */}
        <button
            type="button"
            onMouseDown={handleCommaClick}
            onTouchStart={handleCommaClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-10 rounded-xl bg-muted/50 hover:bg-muted text-foreground flex items-center justify-center z-20 transition-colors font-bold text-2xl pb-1 cursor-pointer select-none active:scale-95"
            aria-label="Add decimal comma"
            tabIndex={-1}
        >
            ,
        </button>
      </div>
    </div>
  );
}
