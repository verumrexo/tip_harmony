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
    <div className="border-3 border-foreground bg-card brutal-shadow-sm transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px]">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-3 border-foreground bg-primary flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-black text-foreground text-lg font-mono">€{total.toFixed(2)}</p>
            <div className="flex gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              <span>{calculation.waiterCount}W • {calculation.cookCount}C • {calculation.dishwasherCount}D</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted border-2 border-foreground px-2 py-1 font-mono uppercase whitespace-nowrap">
          {calculation.createdAt ? formatDistanceToNow(new Date(calculation.createdAt), { addSuffix: true }) : 'Just now'}
        </span>
      </div>

      <div className="grid grid-cols-3 border-t-3 border-foreground">
        <div className="text-center p-2 border-r-3 border-foreground">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest font-mono mb-0.5">W</p>
          <p className="text-sm font-bold text-foreground font-mono">€{waiterPP.toFixed(2)}</p>
        </div>
        <div className="text-center p-2 border-r-3 border-foreground">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest font-mono mb-0.5">C</p>
          <p className="text-sm font-bold text-foreground font-mono">€{cookPP.toFixed(2)}</p>
        </div>
        <div className="text-center p-2">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest font-mono mb-0.5">D</p>
          <p className="text-sm font-bold text-foreground font-mono">€{dishwasherPP.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
