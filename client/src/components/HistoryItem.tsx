import { formatDistanceToNow } from "date-fns";
import { type Calculation } from "@shared/schema";
import { Calculator } from "lucide-react";

interface HistoryItemProps {
  calculation: Calculation;
}

export function HistoryItem({ calculation }: HistoryItemProps) {
  const total = Number(calculation.totalAmount);
  const waiterPP = Number(calculation.waiterPerPerson);
  const cookPP = Number(calculation.cookPerPerson);
  const dishwasherPP = Number(calculation.dishwasherPerPerson);
  
  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">€{total.toFixed(2)}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{calculation.waiterCount}W • {calculation.cookCount}C • {calculation.dishwasherCount}D</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full whitespace-nowrap">
          {calculation.createdAt ? formatDistanceToNow(new Date(calculation.createdAt), { addSuffix: true }) : 'Just now'}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
        <div className="text-center">
          <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide mb-0.5">Waiters</p>
          <p className="text-sm font-bold text-foreground">€{waiterPP.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mb-0.5">Cooks</p>
          <p className="text-sm font-bold text-foreground">€{cookPP.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Dishwashers</p>
          <p className="text-sm font-bold text-foreground">€{dishwasherPP.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
