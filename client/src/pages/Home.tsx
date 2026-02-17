import { useState, useMemo } from "react";
import { ChefHat, Utensils, Waves, Save, History, Coins, ChevronDown } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { PersonSelector } from "@/components/PersonSelector";
import { ResultCard } from "@/components/ResultCard";
import { HistoryItem } from "@/components/HistoryItem";
import { Button } from "@/components/ui/button";
import { useCalculations, useCreateCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Analytics } from "@/components/Analytics";

export default function Home() {
  // State
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [waiterCount, setWaiterCount] = useState<number>(1);
  const [cookCount, setCookCount] = useState<number>(1);
  const [dishwasherCount, setDishwasherCount] = useState<number>(1);

  const [showAverages, setShowAverages] = useState(false);

  // Queries & Mutations
  const { data: history, isLoading: isLoadingHistory } = useCalculations();
  const createCalculation = useCreateCalculation();
  const { toast } = useToast();

  const processedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Group calculations by month then date
    const groupedByMonth: { [key: string]: { [key: string]: typeof history } } = {};
    const monthCache = new Map<string, string>();
    const dateCache = new Map<number, string>();

    history.forEach((calc) => {
      if (!calc.createdAt) return;
      const dateObj = new Date(calc.createdAt);

      const monthKeyCacheKey = `${dateObj.getMonth()}-${dateObj.getFullYear()}`;
      let monthKey = monthCache.get(monthKeyCacheKey);
      if (!monthKey) {
        monthKey = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthCache.set(monthKeyCacheKey, monthKey);
      }

      const dateKeyCacheKey = dateObj.getTime();
      let dateKey = dateCache.get(dateKeyCacheKey);
      if (!dateKey) {
        dateKey = dateObj.toLocaleDateString();
        dateCache.set(dateKeyCacheKey, dateKey);
      }

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {};
      }
      if (!groupedByMonth[monthKey][dateKey]) {
        groupedByMonth[monthKey][dateKey] = [];
      }
      groupedByMonth[monthKey][dateKey].push(calc);
    });

    // Sort months in descending order
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return sortedMonths.map((month) => {
      const monthData = groupedByMonth[month];
      const sortedDates = Object.keys(monthData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let monthTotal = 0;
      const flatMonthData = [];
      for (const dateKey in monthData) {
        const dayCalcs = monthData[dateKey];
        for (let i = 0; i < dayCalcs.length; i++) {
          const calc = dayCalcs[i];
          monthTotal += Number(calc.totalAmount);
          flatMonthData.push(calc);
        }
      }

      let waiterSum = 0, waiterCount = 0;
      let cookSum = 0, cookCount = 0;
      let dishwasherSum = 0, dishwasherCount = 0;

      for (let i = 0; i < flatMonthData.length; i++) {
        const c = flatMonthData[i];
        if (c.waiterCount > 0) {
          waiterSum += Number(c.waiterPerPerson);
          waiterCount++;
        }
        if (c.cookCount > 0) {
          cookSum += Number(c.cookPerPerson);
          cookCount++;
        }
        if (c.dishwasherCount > 0) {
          dishwasherSum += Number(c.dishwasherPerPerson);
          dishwasherCount++;
        }
      }

      const avgWaiter = waiterCount > 0 ? waiterSum / waiterCount : 0;
      const avgCook = cookCount > 0 ? cookSum / cookCount : 0;
      const avgDishwasher = dishwasherCount > 0 ? dishwasherSum / dishwasherCount : 0;

      return {
        month,
        monthTotal,
        avgWaiter,
        avgCook,
        avgDishwasher,
        sortedDates,
        monthData,
      };
    });
  }, [history]);

  // Logic
  const amount = parseFloat(totalAmount) || 0;

  // Percentages logic
  // Waiters: 75%
  // Cooks: 20% (25% if 0 dishwashers)
  // Dishwashers: 5% (0% if 0 dishwashers)

  const waiterSharePct = 0.75;
  const cookSharePct = dishwasherCount === 0 ? 0.25 : 0.20;
  const dishwasherSharePct = dishwasherCount === 0 ? 0.0 : 0.05;

  const waiterTotal = amount * waiterSharePct;
  const cookTotal = amount * cookSharePct;
  const dishwasherTotal = amount * dishwasherSharePct;

  const waiterPerPerson = waiterCount > 0 ? waiterTotal / waiterCount : 0;
  const cookPerPerson = cookCount > 0 ? cookTotal / cookCount : 0;
  const dishwasherPerPerson = dishwasherCount > 0 ? dishwasherTotal / dishwasherCount : 0;

  const handleSave = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid total amount before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCalculation.mutateAsync({
        totalAmount: amount.toString(),
        waiterCount,
        cookCount,
        dishwasherCount,
        waiterPerPerson: waiterPerPerson.toString(),
        cookPerPerson: cookPerPerson.toString(),
        dishwasherPerPerson: dishwasherPerPerson.toString(),
      });
      toast({
        title: "Saved!",
        description: "Calculation added to history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black pb-20 md:pb-0 relative overflow-hidden text-foreground">
      {/* Ambient Background Blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000" />

      <div className="max-w-md mx-auto min-h-screen bg-background/30 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col border-x border-white/5 relative z-10">

        {/* Header */}
        <header className="px-4 py-3 bg-transparent backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Coins className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Tip Harmony</h1>
            </div>
            <div className="flex items-center gap-2">
              {history && history.length > 0 && (
                <div className="text-right mr-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-1">Month</p>
                  <p className="text-sm font-bold text-foreground leading-none">
                    €{history.filter(calc => {
                      if (!calc.createdAt) return false;
                      const date = new Date(calc.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).reduce((sum, calc) => sum + Number(calc.totalAmount), 0).toFixed(2)}
                  </p>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">


            {/* Input Section */}
            <section className="space-y-6">
              <CurrencyInput
                label="Total Tip Amount"
                placeholder="0.00"
                value={totalAmount}
                onValueChange={setTotalAmount}
              />

              <div className="space-y-5">
                <PersonSelector
                  label="Waiters"
                  icon={<Utensils className="w-4 h-4 text-orange-500" />}
                  value={waiterCount}
                  options={[1, 2, 3, 4]}
                  onChange={setWaiterCount}
                />

                <PersonSelector
                  label="Cooks"
                  icon={<ChefHat className="w-4 h-4 text-emerald-500" />}
                  value={cookCount}
                  options={[1, 2, 3]}
                  onChange={setCookCount}
                />

                <PersonSelector
                  label="Dishwashers"
                  icon={<Waves className="w-4 h-4 text-blue-500" />}
                  value={dishwasherCount}
                  options={[0, 1]}
                  onChange={setDishwasherCount}
                />
              </div>
            </section>

            {/* Results Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Distribution</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-2 rounded-lg hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all"
                  onClick={handleSave}
                  disabled={createCalculation.isPending || !amount}
                >
                  <Save className="w-3.5 h-3.5" />
                  {createCalculation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>

              <div className="grid gap-3">
                <ResultCard
                  title="Waiters"
                  percentage={waiterSharePct * 100}
                  amount={waiterTotal}
                  count={waiterCount}
                  icon={Utensils}
                  colorClass="text-orange-500"
                  bgClass=""
                />

                <ResultCard
                  title="Cooks"
                  percentage={cookSharePct * 100}
                  amount={cookTotal}
                  count={cookCount}
                  icon={ChefHat}
                  colorClass="text-emerald-500"
                  bgClass=""
                />

                <ResultCard
                  title="Dishwashers"
                  percentage={dishwasherSharePct * 100}
                  amount={dishwasherTotal}
                  count={dishwasherCount}
                  icon={Waves}
                  colorClass="text-blue-500"
                  bgClass={dishwasherCount > 0 ? "" : "opacity-40 grayscale"}
                />
              </div>
            </section>

            {/* Analytics Section */}
            <section className="space-y-4">
              <Analytics />
            </section>

            {/* History Section */}
            <section className="pb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-lg font-bold text-foreground">History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAverages(!showAverages)}
                  className="h-8 text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {showAverages ? "Hide Averages" : "Show Averages"}
                </Button>
              </div>

              <div className="space-y-6">
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading history...</div>
                ) : history && history.length > 0 ? (
                  <div className="space-y-3">
                    {processedHistory.map(({
                      month,
                      monthTotal,
                      avgWaiter,
                      avgCook,
                      avgDishwasher,
                      sortedDates,
                      monthData
                    }, index) => (
                      <Collapsible key={month} defaultOpen={false}>
                              <CollapsibleTrigger className="w-full" data-testid={`button-month-toggle-${index}`}>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2 bg-muted/50 rounded-lg hover-elevate cursor-pointer gap-2">
                                  {/* Left: Date */}
                                  <div className="flex items-center gap-2 justify-start">
                                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:-rotate-90" />
                                    <h3 className="text-sm font-bold text-foreground truncate">{month}</h3>
                                  </div>

                                  {/* Center: Averages */}
                                  {showAverages && (
                                    <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold">W:</span>
                                        <span className="text-orange-500">€{avgWaiter.toFixed(0)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold">C:</span>
                                        <span className="text-emerald-500">€{avgCook.toFixed(0)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold">D:</span>
                                        <span className="text-blue-500">€{avgDishwasher.toFixed(0)}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Right: Total */}
                                  <div className="flex justify-end">
                                    <span className="text-sm font-bold text-primary">€{monthTotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="space-y-4 pt-3 pl-2">
                                  {sortedDates.map((date) => {
                                    const dayCalculations = monthData[date];
                                    const dayTotal = dayCalculations.reduce((sum, calc) => sum + Number(calc.totalAmount), 0);
                                    return (
                                      <div key={date} className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                          <div className="text-[11px] font-semibold text-muted-foreground">{date}</div>
                                          <div className="text-[11px] font-bold text-primary/70">Day: €{dayTotal.toFixed(2)}</div>
                                        </div>
                                        <div className="space-y-2">
                                          {dayCalculations.map((calc) => (
                                            <HistoryItem key={calc.id} calculation={calc} />
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                    <p className="text-sm text-muted-foreground">No calculations saved yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
