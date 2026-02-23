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
      <div className="flex items-stretch">
        {/* Color accent stripe */}
        <div className={cn("w-2 shrink-0", colorClass.replace("text-", "bg-"))} />

        <div className="flex-1 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 border-3 border-foreground flex items-center justify-center bg-background", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">{title}</p>
              <p className="text-lg font-bold text-foreground font-mono">€{amount.toFixed(2)}</p>
            </div>
          </div>

          {count > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-mono uppercase">/ person</p>
              <p className={cn("text-2xl font-black font-mono", colorClass)}>€{perPerson.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
