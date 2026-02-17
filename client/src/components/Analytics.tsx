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
