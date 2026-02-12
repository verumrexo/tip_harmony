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
    <div className={cn("rounded-xl p-4 border bg-card transition-all hover:border-primary/30", bgClass)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{title}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {percentage}% Split • {count} {count === 1 ? 'Person' : 'People'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end gap-3">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Share</p>
          <p className="text-lg font-bold text-foreground">€{amount.toFixed(2)}</p>
        </div>

        {count > 0 && (
          <div className={cn(
            "glass-card p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:bg-white/5",
            bgClass
          )}>  <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-0.5", colorClass)}>Per Person</p>
            <p className={cn("text-2xl font-bold", colorClass)}>€{perPerson.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
