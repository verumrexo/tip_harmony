import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalculations } from "@/hooks/use-calculations";
import { BarChart3, ChevronDown, ChevronUp, Calendar, TrendingUp, Trophy } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Analytics() {
    const { data: history } = useCalculations();
    const [isOpen, setIsOpen] = useState(false);
    const [days, setDays] = useState("14");

    const analysis = useMemo(() => {
        if (!history || history.length === 0) return null;

        const dayCount = parseInt(days);
        const dailyMap = new Map<string, { date: string, fullDate: Date, amount: number, count: number }>();
        const dayOfWeekStats = new Array(7).fill(0).map(() => ({ total: 0, count: 0 }));

        // 1. Group by date and calculate day of week stats
        history.forEach(calc => {
            const dateObj = new Date(calc.createdAt);
            const dateKey = dateObj.toLocaleDateString();

            // Daily totals
            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, {
                    date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    fullDate: dateObj,
                    amount: 0,
                    count: 0
                });
            }
            const entry = dailyMap.get(dateKey)!;
            entry.amount += parseFloat(calc.totalAmount as string);
            entry.count += 1;

            // Day of week stats (0-6)
            const dayIndex = dateObj.getDay();
            dayOfWeekStats[dayIndex].total += parseFloat(calc.totalAmount as string);
            dayOfWeekStats[dayIndex].count += 1;
        });

        // 2. Generate trend data with empty days filled
        const trendData = [];
        const today = new Date();
        // Reset time to end of day to ensure we catch everything today
        today.setHours(23, 59, 59, 999);

        for (let i = dayCount - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateKey = d.toLocaleDateString();

            if (dailyMap.has(dateKey)) {
                trendData.push(dailyMap.get(dateKey)!);
            } else {
                trendData.push({
                    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    fullDate: d,
                    amount: 0,
                    count: 0
                });
            }
        }

        // 3. Calculate Average
        const totalAmount = trendData.reduce((sum, item) => sum + item.amount, 0);
        // Only count days that actually have potential to be worked? 
        // For now, simple average over the period is best for "run rate".
        // Or maybe average only of non-zero days? 
        // Let's do average of non-zero days for "Average Shift" and average of period for "Daily Avg".
        // User asked for "Average daily tip".
        const nonZeroDays = trendData.filter(d => d.amount > 0).length;
        const average = nonZeroDays > 0 ? totalAmount / nonZeroDays : 0;

        return {
            trendData,
            average
        };
    }, [history, days]);

    if (!history || history.length === 0) return null;
    if (!analysis) return null;

    const { trendData, average } = analysis;

    return (
        <Card className="border-none shadow-none bg-transparent">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-lg font-bold text-foreground">Analytics</h2>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="sr-only">Toggle Analytics</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                    Tip Trend
                                </CardTitle>
                                <Select value={days} onValueChange={setDays}>
                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Last 7 Days</SelectItem>
                                        <SelectItem value="14">Last 14 Days</SelectItem>
                                        <SelectItem value="30">Last 30 Days</SelectItem>
                                        <SelectItem value="90">Last 3 Months</SelectItem>
                                        <SelectItem value="365">Last Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Avg / Day</span>
                                    <div className="text-2xl font-bold">€{average.toFixed(2)}</div>
                                    <p className="text-[10px] text-muted-foreground">Based on worked days</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={days === "365" ? 30 : days === "90" ? 6 : days === "30" ? 2 : 0}
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `€${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    const isWeekend = data.fullDate.getDay() === 0 || data.fullDate.getDay() === 6;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <div className="grid gap-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[0.65rem] uppercase text-muted-foreground font-bold">
                                                                        {data.date} {isWeekend && '(Weekend)'}
                                                                    </span>
                                                                    <span className="font-bold text-lg">
                                                                        €{Number(payload[0].value).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <ReferenceLine y={average} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                            {trendData.map((entry, index) => {
                                                const day = entry.fullDate.getDay();
                                                const isWeekend = day === 0 || day === 6;
                                                // Weekdays = Muted (Subtle), Weekends = Primary (Highlight)
                                                return <Cell key={`cell-${index}`} fill={isWeekend ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={isWeekend ? 1 : 0.3} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
