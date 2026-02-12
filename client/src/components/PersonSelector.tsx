import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface PersonSelectorProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

export function PersonSelector({ label, value, options, onChange, icon }: PersonSelectorProps) {

  const handleSelect = (option: number) => {
    // 1. Haptic Feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10); // 10ms "tick"
    }

    // 2. Change Value
    onChange(option);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon || <Users className="w-4 h-4 text-primary" />}
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      </div>
      <div className="flex gap-2 p-1 bg-muted/50 rounded-[21px] overflow-x-auto no-scrollbar">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "flex-1 min-w-[3rem] py-3 rounded-[18px] font-bold text-lg transition-all duration-200 tap-highlight-transparent select-none",
              // Active State: Scale up slightly, shadow, colored
              value === option
                ? "bg-card text-primary shadow-md shadow-black/5 dark:shadow-black/20 scale-105"
                // Inactive State: Scale down slightly on press
                : "text-muted-foreground hover:bg-muted/80 active:scale-95"
            )}
          >
            <span className={cn(
              "block transition-transform duration-300",
              value === option ? "scale-110" : "scale-100"
            )}>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
