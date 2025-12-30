import { formatDistanceToNow } from "date-fns";
import { type Calculation } from "@shared/schema";
import { Calculator } from "lucide-react";

interface HistoryItemProps {
  calculation: Calculation;
}

export function HistoryItem({ calculation }: HistoryItemProps) {
  const total = Number(calculation.totalAmount);
  
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">€{total.toFixed(2)}</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{calculation.waiterCount}W</span>
            <span>•</span>
            <span>{calculation.cookCount}C</span>
            <span>•</span>
            <span>{calculation.dishwasherCount}D</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {calculation.createdAt ? formatDistanceToNow(new Date(calculation.createdAt), { addSuffix: true }) : 'Just now'}
        </span>
      </div>
    </div>
  );
}
