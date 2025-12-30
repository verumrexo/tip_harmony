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
    <div className={cn("rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md", bgClass)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl bg-white shadow-sm", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {percentage}% Split • {count} {count === 1 ? 'Person' : 'People'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Share</p>
          <p className="text-xl font-bold text-foreground">€{amount.toFixed(2)}</p>
        </div>
        
        {count > 0 && (
          <div className={cn("text-right px-4 py-3 rounded-[18px] border", {
            "bg-orange-50/70 border-orange-200": colorClass === "text-orange-600",
            "bg-emerald-50/70 border-emerald-200": colorClass === "text-emerald-600",
            "bg-blue-50/70 border-blue-200": colorClass === "text-blue-600",
          })}>
            <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", colorClass)}>Per Person</p>
            <p className={cn("text-3xl font-bold", colorClass)}>€{perPerson.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
