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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon || <Users className="w-4 h-4 text-primary" />}
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      </div>
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 min-w-[3rem] py-3 rounded-lg font-bold text-lg transition-all duration-200 tap-highlight-transparent",
              value === option
                ? "bg-white text-primary shadow-md shadow-black/5 scale-[1.02]"
                : "text-muted-foreground hover:bg-white/50 active:scale-95"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
