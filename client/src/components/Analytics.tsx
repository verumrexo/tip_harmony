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
import { calculateAnalytics } from "@/lib/analytics-logic";

export function Analytics() {
    const { data: history } = useCalculations();
    const [isOpen, setIsOpen] = useState(false);
    const [days, setDays] = useState("14");
    const [view, setView] = useState("daily");

    const analysis = useMemo(() => {
        return calculateAnalytics(history, days);
    }, [history, days]);

    if (!history || history.length === 0) return null;
    if (!analysis) return null;

    const { trendData, average, weeklyData, monthlyData, distributionData } = analysis;

    return (
        <div className="border-3 border-foreground bg-card brutal-shadow">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <div className="flex items-center justify-between p-3 border-b-3 border-foreground">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Analytics</h2>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 border-2 border-foreground bg-card hover:bg-muted rounded-none">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="sr-only">Toggle Analytics</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                    <div className="p-4 space-y-4">
                        {/* Controls */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">View</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={view} onValueChange={setView}>
                                    <SelectTrigger className="w-[130px] h-8 text-xs font-bold border-2 border-foreground bg-card rounded-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-3 border-foreground bg-card rounded-none brutal-shadow">
                                        <SelectItem value="daily">Daily Trend</SelectItem>
                                        <SelectItem value="weekly">Weekly Pattern</SelectItem>
                                        <SelectItem value="monthly">Monthly Trends</SelectItem>
                                        <SelectItem value="distribution">Tip Distribution</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={days} onValueChange={setDays}>
                                    <SelectTrigger className="w-[110px] h-8 text-xs font-bold border-2 border-foreground bg-card rounded-none">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent className="border-3 border-foreground bg-card rounded-none brutal-shadow">
                                        <SelectItem value="7">Last 7 Days</SelectItem>
                                        <SelectItem value="14">Last 14 Days</SelectItem>
                                        <SelectItem value="30">Last 30 Days</SelectItem>
                                        <SelectItem value="90">Last 3 Months</SelectItem>
                                        <SelectItem value="365">Last Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="border-3 border-foreground p-3 bg-background">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest font-mono">Avg / Day</span>
                            <div className="text-3xl font-black font-mono">€{average.toFixed(2)}</div>
                            <p className="text-[10px] text-muted-foreground font-mono">Based on worked days in period</p>
                        </div>

                        {/* Chart */}
                        <div className="h-[250px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                {view === 'daily' ? (
                                    <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={days === "365" ? 30 : days === "90" ? 6 : days === "30" ? 2 : 0}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `€${value}`}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    const isWeekend = data.fullDate.getDay() === 0 || data.fullDate.getDay() === 6;
                                                    return (
                                                        <div className="border-3 border-foreground bg-card p-2 brutal-shadow-sm">
                                                            <div className="grid gap-1">
                                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest font-mono">
                                                                    {data.date} {isWeekend && '(Weekend)'}
                                                                </span>
                                                                <span className="font-black text-lg font-mono">
                                                                    €{Number(payload[0].value).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <ReferenceLine y={average} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                        <Bar dataKey="amount" radius={[0, 0, 0, 0]} maxBarSize={50}>
                                            {trendData.map((entry, index) => {
                                                const day = entry.fullDate.getDay();
                                                const isWeekend = day === 0 || day === 6;
                                                return <Cell key={`cell-${index}`} fill={isWeekend ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={isWeekend ? 1 : 0.3} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                ) : view === 'weekly' ? (
                                    <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `€${value}`}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="border-3 border-foreground bg-card p-2 brutal-shadow-sm">
                                                            <div className="grid gap-1">
                                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest font-mono">
                                                                    {data.name}
                                                                </span>
                                                                <span className="font-black text-lg font-mono">
                                                                    €{Number(payload[0].value).toFixed(2)}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    Average of {data.count} shifts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                ) : view === 'monthly' ? (
                                    <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `€${value}`}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="border-3 border-foreground bg-card p-2 brutal-shadow-sm">
                                                            <div className="grid gap-1">
                                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest font-mono">
                                                                    {data.name}
                                                                </span>
                                                                <span className="font-black text-lg font-mono">
                                                                    €{Number(payload[0].value).toFixed(2)}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    Total over {data.count} shifts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                ) : (
                                    <BarChart data={distributionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            fontFamily="'JetBrains Mono'"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="border-3 border-foreground bg-card p-2 brutal-shadow-sm">
                                                            <div className="grid gap-1">
                                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest font-mono">
                                                                    {data.name}
                                                                </span>
                                                                <span className="font-black text-lg font-mono">
                                                                    {Number(payload[0].value)}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    Shifts in this range
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
