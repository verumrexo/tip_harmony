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
  icon: LucideIcon;
  colorClass: string;
  // Full class names, not built from colorClass: Tailwind only generates classes it can find in the source
  tintClass: string;
  bgClass?: string;
}

// One column of the split summary: what each person in a role gets
export function ResultCard({ title, amount, count, icon: Icon, colorClass, tintClass, bgClass }: ResultCardProps) {
  const perPerson = count > 0 ? amount / count : 0;

  return (
    <div className={cn("min-w-0 px-2.5 py-3 flex flex-col gap-[7px] border-r-2 border-border last:border-r-0", tintClass, bgClass)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground/85">
        <Icon className={cn("w-3.5 h-3.5 shrink-0", colorClass)} />
        {title}
      </p>
      <AnimatedNumber
        value={perPerson}
        className={cn("text-[22px] font-black font-mono tracking-tight leading-none", colorClass)}
      />
      <p className="text-[11px] text-muted-foreground">
        {count > 0 ? `each · ${count} ${count === 1 ? "person" : "people"}` : "nobody"}
      </p>
    </div>
  );
}
