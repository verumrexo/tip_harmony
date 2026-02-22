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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">€{amount.toFixed(2)}</p>
        </div>

        {count > 0 && (
          <p className={cn("text-2xl font-bold", colorClass)}>€{perPerson.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
