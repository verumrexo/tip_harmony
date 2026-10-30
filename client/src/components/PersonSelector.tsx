import React, { useId } from 'react';
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface PersonSelectorProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  hint?: string;
}

export function PersonSelector({ label, value, options, onChange, icon, hint }: PersonSelectorProps) {
  const labelId = useId();

  const handleSelect = (option: number) => {
    // 1. Haptic Feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10); // 10ms "tick"
    }

    // 2. Change Value
    onChange(option);
  };

  return (
    <div
      className="flex items-center justify-between gap-3"
      role="group"
      aria-labelledby={labelId}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon || <Users className="w-4 h-4 text-primary" />}
        <label
          id={labelId}
          className="text-sm font-semibold text-foreground/85"
        >
          {label}
          {hint && <span className="ml-1.5 text-xs font-medium text-muted-foreground">{hint}</span>}
        </label>
      </div>
      <div className="flex w-[188px] shrink-0 border-2 border-border brutal-shadow-sm">
        {options.map((option, idx) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            aria-pressed={value === option}
            className={cn(
              "flex-1 h-11 font-bold text-base font-mono transition-all duration-100 tap-highlight-transparent select-none",
              idx < options.length - 1 && "border-r-2 border-border",
              value === option
                ? "bg-primary text-primary-foreground scale-100"
                : "bg-card text-muted-foreground hover:bg-muted active:bg-primary/20"
            )}
          >
            <span className={cn(
              "block transition-transform duration-150",
              value === option ? "scale-110 font-black" : "scale-100"
            )}>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
