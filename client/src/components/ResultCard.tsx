import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface ResultCardProps {
  title: string;
  amount: number;
  count: number;
  percentage: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export function ResultCard({ title, amount, count, percentage, icon: Icon, colorClass, bgClass }: ResultCardProps) {
  const perPerson = count > 0 ? amount / count : 0;

  return (
    <div className={cn(
      "border-3 border-foreground bg-card brutal-shadow transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg",
      bgClass
    )}>
      {/* Top: role label + total */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className={cn("w-10 h-10 border-3 border-foreground flex items-center justify-center shrink-0", colorClass.replace("text-", "bg-"))}>
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">{title}</p>
          <p className="text-base font-bold text-foreground font-mono">€{amount.toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">total</span></p>
        </div>
      </div>

      {/* Bottom: per person — THE MAIN EVENT */}
      {count > 0 && (
        <div className={cn("border-t-3 border-foreground p-3 flex items-center justify-between", colorClass.replace("text-", "bg-") + "/15")}>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60 font-mono">/ person</span>
          <p className={cn("text-4xl font-black font-mono tracking-tight leading-none", colorClass)}>
            €{perPerson.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
