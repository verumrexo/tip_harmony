import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalculations } from "@/hooks/use-calculations";
import { BarChart3, PieChart as PieChartIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function Analytics() {
    const { data: history } = useCalculations();
    const [isOpen, setIsOpen] = useState(false);

    if (!history || history.length === 0) return null;

    // Process data for charts

    // 1. Trend Data (Last 14 days)
    const trendData = history
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-14)
        .map(calc => ({
            date: new Date(calc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount: parseFloat(calc.totalAmount as string)
        }));

    // 2. Distribution Data (Average Split)
    const totalTips = history.reduce((sum, calc) => sum + parseFloat(calc.totalAmount as string), 0);

    // These are derived from the logic in Home.tsx. 
    // Ideally this logic should be shared, but for now we recalculate based on saved per-person values.
    // Actually, we stored per-person values. We need total per group.
    // Wait, we stored waiterCount, cookCount etc.

    let totalWaiter = 0;
    let totalCook = 0;
    let totalDishwasher = 0;

    history.forEach(calc => {
        // Reconstruct totals from per-person * count
        // Or just use the hardcoded percentages if we assume they never change. 
        // But better to use stored data if possible.
        // We didn't store group totals, only per person.
        // So group total = perPerson * count
        totalWaiter += (parseFloat(calc.waiterPerPerson as string) * calc.waiterCount);
        totalCook += (parseFloat(calc.cookPerPerson as string) * calc.cookCount);
        totalDishwasher += (parseFloat(calc.dishwasherPerPerson as string) * calc.dishwasherCount);
    });

    const pieData = [
        { name: 'Waiters', value: totalWaiter, color: '#f97316' }, // orange-500
        { name: 'Cooks', value: totalCook, color: '#10b981' }, // emerald-500
        { name: 'Dishwashers', value: totalDishwasher, color: '#3b82f6' }, // blue-500
    ].filter(d => d.value > 0);


    return (
        <Card className="border-none shadow-none bg-transparent">
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </h2>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="sr-only">Toggle Analytics</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Trend Chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Tip Trend (Last 14 Entries)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                            <XAxis
                                                dataKey="date"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `€${value}`}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                            Date
                                                                        </span>
                                                                        <span className="font-bold text-muted-foreground">
                                                                            {payload[0].payload.date}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                            Amount
                                                                        </span>
                                                                        <span className="font-bold">
                                                                            €{payload[0].value}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Distribution Chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Distribution Split</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `€${value.toFixed(2)}`}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 text-xs mt-2">
                                    {pieData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span>{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
