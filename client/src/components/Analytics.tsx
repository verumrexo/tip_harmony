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
    const [view, setView] = useState("daily");

    const analysis = useMemo(() => {
        if (!history || history.length === 0) return null;

        const dayCount = parseInt(days);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayCount);

        // Filter history based on selected date range
        const filteredHistory = history.filter((calc): calc is typeof calc & { createdAt: Date } => {
            if (!calc.createdAt) return false;
            const d = new Date(calc.createdAt);
            return d >= startDate && d <= today;
        });

        // --- 1. Daily Trend Data (Existing Logic adapted) ---
        const dailyMap = new Map<string, { date: string, fullDate: Date, amount: number, count: number }>();

        filteredHistory.forEach(calc => {
            const dateObj = new Date(calc.createdAt);
            const dateKey = dateObj.toLocaleDateString();

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
        });

        const trendData = [];
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

        const totalAmount = trendData.reduce((sum, item) => sum + item.amount, 0);
        const nonZeroDays = trendData.filter(d => d.amount > 0).length;
        const average = nonZeroDays > 0 ? totalAmount / nonZeroDays : 0;

        // --- 2. Weekly Pattern (Avg per day of week) ---
        const weekMap = new Array(7).fill(0).map((_, i) => ({
            dayIndex: i,
            total: 0,
            count: 0
        }));

        filteredHistory.forEach(calc => {
            const d = new Date(calc.createdAt);
            const dayIndex = d.getDay();
            weekMap[dayIndex].total += parseFloat(calc.totalAmount as string);
            weekMap[dayIndex].count += 1;
        });

        // Reorder to Mon-Sun and format
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = weekMap.map(d => ({
            name: dayNames[d.dayIndex],
            amount: d.count > 0 ? d.total / d.count : 0, // Average
            count: d.count,
            originalIndex: d.dayIndex
        })).sort((a, b) => {
            // Sort Mon(1) ... Sun(0) -> 0 becomes 7
            const getSortIndex = (idx: number) => idx === 0 ? 7 : idx;
            return getSortIndex(a.originalIndex) - getSortIndex(b.originalIndex);
        });

        // --- 3. Monthly Trends (Total per month) ---
        const monthMap = new Map<string, { name: string, date: Date, amount: number, count: number }>();

        filteredHistory.forEach(calc => {
            const d = new Date(calc.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!monthMap.has(key)) {
                monthMap.set(key, {
                    name: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                    date: new Date(d.getFullYear(), d.getMonth(), 1),
                    amount: 0,
                    count: 0
                });
            }
            const entry = monthMap.get(key)!;
            entry.amount += parseFloat(calc.totalAmount as string);
            entry.count += 1;
        });

        const monthlyData = Array.from(monthMap.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        // --- 4. Tip Distribution (Histogram) ---
        const bins = [
            { label: "€0-50", min: 0, max: 50, count: 0 },
            { label: "€50-100", min: 50, max: 100, count: 0 },
            { label: "€100-150", min: 100, max: 150, count: 0 },
            { label: "€150-200", min: 150, max: 200, count: 0 },
            { label: "€200+", min: 200, max: Infinity, count: 0 }
        ];

        filteredHistory.forEach(calc => {
            const amount = parseFloat(calc.totalAmount as string);
            const bin = bins.find(b => amount >= b.min && amount < b.max);
            if (bin) bin.count++;
        });

        const distributionData = bins.map(b => ({ name: b.label, count: b.count }));

        return {
            trendData,
            average,
            weeklyData,
            monthlyData,
            distributionData
        };
    }, [history, days]);

    if (!history || history.length === 0) return null;
    if (!analysis) return null;

    const { trendData, average, weeklyData, monthlyData, distributionData } = analysis;

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
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                    Analysis
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Select value={view} onValueChange={setView}>
                                        <SelectTrigger className="w-[130px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily Trend</SelectItem>
                                            <SelectItem value="weekly">Weekly Pattern</SelectItem>
                                            <SelectItem value="monthly">Monthly Trends</SelectItem>
                                            <SelectItem value="distribution">Tip Distribution</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Avg / Day</span>
                                    <div className="text-2xl font-bold">€{average.toFixed(2)}</div>
                                    <p className="text-[10px] text-muted-foreground">Based on worked days in period</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    {view === 'daily' ? (
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
                                                    return <Cell key={`cell-${index}`} fill={isWeekend ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={isWeekend ? 1 : 0.3} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    ) : view === 'weekly' ? (
                                        <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
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
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.65rem] uppercase text-muted-foreground font-bold">
                                                                            {data.name}
                                                                        </span>
                                                                        <span className="font-bold text-lg">
                                                                            €{Number(payload[0].value).toFixed(2)}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            Average of {data.count} shifts
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    ) : view === 'monthly' ? (
                                        <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
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
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.65rem] uppercase text-muted-foreground font-bold">
                                                                            {data.name}
                                                                        </span>
                                                                        <span className="font-bold text-lg">
                                                                            €{Number(payload[0].value).toFixed(2)}
                                                                        </span>
                                                                         <span className="text-[10px] text-muted-foreground">
                                                                            Total over {data.count} shifts
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    ) : (
                                        <BarChart data={distributionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.65rem] uppercase text-muted-foreground font-bold">
                                                                            {data.name}
                                                                        </span>
                                                                        <span className="font-bold text-lg">
                                                                            {Number(payload[0].value)}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            Shifts in this range
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
