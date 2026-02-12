import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalculations } from "@/hooks/use-calculations";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function Analytics() {
    const { data: history } = useCalculations();
    const [isOpen, setIsOpen] = useState(false);

    if (!history || history.length === 0) return null;

    // Process data for charts
    // Group by date and sum amounts
    const dailyMap = new Map<string, { date: string, fullDate: Date, amount: number }>();

    history.forEach(calc => {
        const dateObj = new Date(calc.createdAt);
        const dateKey = dateObj.toLocaleDateString();

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: dateObj,
                amount: 0
            });
        }

        const entry = dailyMap.get(dateKey)!;
        entry.amount += parseFloat(calc.totalAmount as string);
    });

    const trendData = Array.from(dailyMap.values())
        .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
        .slice(-14);

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
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Daily Tip Trend (Last 14 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
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
                                                    const data = payload[0].payload;
                                                    const isWeekend = data.fullDate.getDay() === 0 || data.fullDate.getDay() === 6;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                        Date
                                                                    </span>
                                                                    <span className="font-bold text-muted-foreground">
                                                                        {data.date} {isWeekend ? '(Weekend)' : ''}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                        Total Amount
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
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                            {trendData.map((entry, index) => {
                                                const day = entry.fullDate.getDay();
                                                const isWeekend = day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
                                                return <Cell key={`cell-${index}`} fill={isWeekend ? "#ef4444" : "hsl(var(--primary))"} />;
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
