import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame } from "lucide-react";
import { useCalculations } from "@/hooks/use-calculations";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Leaderboard() {
    const { data: history, isLoading } = useCalculations();
    const [isOpen, setIsOpen] = useState(false);

    const leaderboardStats = useMemo(() => {
        if (!history || history.length === 0) return null;

        // Group by Date String first
        const dailyTotals: Record<string, number> = {};

        history.forEach(calc => {
            if (!calc.createdAt) return;
            const date = new Date(calc.createdAt).toLocaleDateString();
            dailyTotals[date] = (dailyTotals[date] || 0) + Number(calc.totalAmount);
        });

        const sortedDays = Object.entries(dailyTotals)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => b.total - a.total); // Highest first

        if (sortedDays.length === 0) return null;

        const topDays = sortedDays.slice(0, 3);

        return {
            topDays,
        };
    }, [history]);

    if (isLoading) {
        return (
            <div className="text-center py-4 text-muted-foreground text-xs font-mono uppercase tracking-wider animate-pulse">
                Judging your shifts...
            </div>
        );
    }

    if (!leaderboardStats) return null;

    return (
        <div className="border-3 border-foreground bg-card brutal-shadow mt-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <div className="flex items-center justify-between p-3 border-b-3 border-foreground">
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Hall of Fame</h2>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 border-2 border-foreground bg-card hover:bg-muted rounded-none">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="sr-only">Toggle Leaderboard</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                    <div className="p-0">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b-3 border-foreground/20">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Best Days to Not Quit</span>
                        </div>
                        {leaderboardStats.topDays.map((day, idx) => (
                            <div
                                key={day.date}
                                className={`flex justify-between items-center py-2.5 px-4 ${idx !== leaderboardStats.topDays.length - 1 ? 'border-b-2 border-dashed border-foreground/20' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-black text-sm w-4 text-muted-foreground">#{idx + 1}</span>
                                    <span className="font-mono text-xs font-bold uppercase tracking-wider">{day.date}</span>
                                </div>
                                <span className="font-mono font-black text-primary">€{day.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
