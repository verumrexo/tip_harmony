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

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">€</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full pl-10 pr-4 py-4 rounded-2xl bg-card border-none shadow-sm text-2xl font-bold text-foreground placeholder:text-muted/50 input-ring group-hover:shadow-md transition-all caret-primary",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
