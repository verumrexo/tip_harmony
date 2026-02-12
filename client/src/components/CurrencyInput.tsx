import React from 'react';
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function CurrencyInput({ label, className, ...props }: CurrencyInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">€</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          className={cn(
            "w-full pl-10 pr-4 py-4 rounded-2xl bg-card border-none shadow-sm text-2xl font-bold text-foreground placeholder:text-muted/50 input-ring group-hover:shadow-md transition-all",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
