import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15
  });

  const display = useTransform(spring, (current) => `€${current.toFixed(2)}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}

interface ResultCardProps {
  title: string;
  amount: number;
  count: number;
  percentage: number;
  icon: LucideIcon;
  colorClass: string;
  // Full class names, not built from colorClass: Tailwind only generates classes it can find in the source
  iconBgClass: string;
  stripBgClass: string;
  bgClass: string;
}

export function ResultCard({ title, amount, count, percentage, icon: Icon, colorClass, iconBgClass, stripBgClass, bgClass }: ResultCardProps) {
  const perPerson = count > 0 ? amount / count : 0;

  return (
    <div className={cn("border-2 border-border bg-card brutal-shadow", bgClass)}>
      {/* Top: role, share and role total */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className={cn("w-9 h-9 border-2 border-ink flex items-center justify-center shrink-0", iconBgClass)}>
          <Icon className="w-[18px] h-[18px] text-ink" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-foreground leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {Math.round(percentage)}% · <AnimatedNumber value={amount} className="font-mono" /> total
          </p>
        </div>
      </div>

      {/* Bottom: per person — THE MAIN EVENT */}
      {count > 0 && (
        <div className={cn("border-t-2 border-border px-3.5 py-3 flex items-center justify-between", stripBgClass)}>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground/80">
            Each · {count} {count === 1 ? "person" : "people"}
          </span>
          <AnimatedNumber
            value={perPerson}
            className={cn("text-[34px] font-black font-mono tracking-tight leading-none", colorClass)}
          />
        </div>
      )}
    </div>
  );
}
