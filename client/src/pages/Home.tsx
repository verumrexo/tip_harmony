import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChefHat, Utensils, Waves, Save, History, Coins, ChevronDown, Wine, FileText } from "lucide-react";
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
import { TIP_PERCENTAGES } from "@/lib/constants";
import { DrinkOrderFlow } from "@/components/DrinkOrderFlow";
import { OrderModal } from "@/components/OrderModal";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function Home() {
  // State
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [waiterCount, setWaiterCount] = useState<number>(1);
  const [cookCount, setCookCount] = useState<number>(1);
  const [dishwasherCount, setDishwasherCount] = useState<number>(1);

  const [showAverages, setShowAverages] = useState(false);
  const [showDrinkFlow, setShowDrinkFlow] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<{
    waiterTotal: number; cookTotal: number; dishwasherTotal: number;
    waiterSharePct: number; cookSharePct: number; dishwasherSharePct: number;
    waiterCount: number; cookCount: number; dishwasherCount: number;
  } | null>(null);

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

      let totalWaiterSum = 0, daysWithWaiter = 0;
      let totalCookSum = 0, daysWithCook = 0;
      let totalDishwasherSum = 0, daysWithDishwasher = 0;

      for (const dateKey in monthData) {
        const dayCalcs = monthData[dateKey];

        let dailyWaiterSum = 0;
        let dailyCookSum = 0;
        let dailyDishwasherSum = 0;

        let hasWaiter = false;
        let hasCook = false;
        let hasDishwasher = false;

        for (const c of dayCalcs) {
          if (c.waiterCount > 0) {
            dailyWaiterSum += Number(c.waiterPerPerson);
            hasWaiter = true;
          }
          if (c.cookCount > 0) {
            dailyCookSum += Number(c.cookPerPerson);
            hasCook = true;
          }
          if (c.dishwasherCount > 0) {
            dailyDishwasherSum += Number(c.dishwasherPerPerson);
            hasDishwasher = true;
          }
        }

        if (hasWaiter) {
          totalWaiterSum += dailyWaiterSum;
          daysWithWaiter++;
        }
        if (hasCook) {
          totalCookSum += dailyCookSum;
          daysWithCook++;
        }
        if (hasDishwasher) {
          totalDishwasherSum += dailyDishwasherSum;
          daysWithDishwasher++;
        }
      }

      const avgWaiter = daysWithWaiter > 0 ? totalWaiterSum / daysWithWaiter : 0;
      const avgCook = daysWithCook > 0 ? totalCookSum / daysWithCook : 0;
      const avgDishwasher = daysWithDishwasher > 0 ? totalDishwasherSum / daysWithDishwasher : 0;

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
  const amount = parseFloat(totalAmount.replace(',', '.')) || 0;

  // Percentages logic
  const waiterSharePct = TIP_PERCENTAGES.WAITER;
  const cookSharePct = dishwasherCount === 0
    ? TIP_PERCENTAGES.COOK_NO_DISHWASHER
    : TIP_PERCENTAGES.COOK_BASE;
  const dishwasherSharePct = dishwasherCount === 0
    ? 0.0
    : TIP_PERCENTAGES.DISHWASHER;

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
      setLastSaved({
        waiterTotal, cookTotal, dishwasherTotal,
        waiterSharePct, cookSharePct, dishwasherSharePct,
        waiterCount, cookCount, dishwasherCount,
      });
      setTotalAmount("");
      setShowDrinkFlow(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] pb-20 md:pb-0 relative overflow-hidden text-foreground bg-background pb-safe">
      {/* Aggressive halftone dotted background */}
      <div className="fixed inset-0 opacity-[0.15] dark:opacity-[0.1] pointer-events-none" style={{
        backgroundImage: `radial-gradient(hsl(var(--foreground)) 2px, transparent 2px)`,
        backgroundSize: `16px 16px`
      }} />

      <div className="max-w-md mx-auto min-h-screen bg-background relative z-10">

        {/* Header */}
        <header className="px-4 py-3 pt-safe bg-card border-b-3 border-foreground sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-3 border-foreground bg-primary flex items-center justify-center brutal-shadow-sm">
                <Coins className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-black text-foreground uppercase tracking-wider">Tip Harmony+</h1>
            </div>
            <div className="flex items-center gap-3">
              {history && history.length > 0 && (
                <div className="text-right border-3 border-foreground px-2 py-1 bg-background">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] font-mono leading-none mb-0.5">Month</p>
                  <p className="text-sm font-black text-foreground leading-none font-mono">
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
          <div className="p-5 space-y-6">

            {/* Input Section */}
            <section className="space-y-3">
              <CurrencyInput
                label="Total Tip Amount"
                placeholder="0.00"
                value={totalAmount}
                onValueChange={setTotalAmount}
              />

              <div className="space-y-3">
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

            {/* Save Section — The primary action */}
            <section className="pt-2">
              {amount > 0 ? (
                <RainbowButton
                  className="w-full h-14 text-base gap-3 font-black uppercase tracking-[0.15em] rounded-none brutal-shadow brutal-hover shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  onClick={handleSave}
                  disabled={createCalculation.isPending}
                >
                  {createCalculation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save
                    </>
                  )}
                </RainbowButton>
              ) : (
                <Button
                  className="w-full h-14 text-base gap-3 font-black uppercase tracking-[0.15em] border-3 border-foreground rounded-none transition-all duration-300 bg-muted text-muted-foreground cursor-not-allowed"
                  disabled
                >
                  <Save className="w-5 h-5" />
                  Save
                </Button>
              )}
            </section>

            {/* Action Buttons Section */}
            <section className="grid grid-cols-2 gap-3 pt-2">
              <Button
                className="w-full h-12 text-sm gap-2 font-black uppercase tracking-[0.1em] border-3 border-foreground rounded-none bg-purple-600 text-white brutal-shadow brutal-hover hover:bg-purple-700 transition-all duration-300"
                onClick={() => setShowDrinkFlow(true)}
              >
                <Wine className="w-4 h-4" />
                Write Off
              </Button>

              <Button
                className="w-full h-12 text-sm gap-2 font-black uppercase tracking-[0.1em] border-3 border-foreground rounded-none bg-blue-600 text-white brutal-shadow brutal-hover hover:bg-blue-700 transition-all duration-300"
                onClick={() => setShowOrderModal(true)}
              >
                <FileText className="w-4 h-4" />
                Supplier
              </Button>
            </section>

            {/* Distribution Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-foreground uppercase tracking-wider">Distribution</h2>
              </div>

              {(() => {
                const dw = amount > 0 ? waiterTotal : (lastSaved?.waiterTotal ?? 0);
                const dc = amount > 0 ? cookTotal : (lastSaved?.cookTotal ?? 0);
                const dd = amount > 0 ? dishwasherTotal : (lastSaved?.dishwasherTotal ?? 0);
                const dpw = amount > 0 ? waiterSharePct : (lastSaved?.waiterSharePct ?? waiterSharePct);
                const dpc = amount > 0 ? cookSharePct : (lastSaved?.cookSharePct ?? cookSharePct);
                const dpd = amount > 0 ? dishwasherSharePct : (lastSaved?.dishwasherSharePct ?? dishwasherSharePct);
                const dcw = amount > 0 ? waiterCount : (lastSaved?.waiterCount ?? waiterCount);
                const dcc = amount > 0 ? cookCount : (lastSaved?.cookCount ?? cookCount);
                const dcd = amount > 0 ? dishwasherCount : (lastSaved?.dishwasherCount ?? dishwasherCount);
                return (
                  <div className="grid gap-3">
                    <ResultCard
                      title="Waiters"
                      percentage={dpw * 100}
                      amount={dw}
                      count={dcw}
                      icon={Utensils}
                      colorClass="text-orange-500"
                      bgClass=""
                    />
                    <ResultCard
                      title="Cooks"
                      percentage={dpc * 100}
                      amount={dc}
                      count={dcc}
                      icon={ChefHat}
                      colorClass="text-emerald-500"
                      bgClass=""
                    />
                    <ResultCard
                      title="Dishwashers"
                      percentage={dpd * 100}
                      amount={dd}
                      count={dcd}
                      icon={Waves}
                      colorClass="text-blue-500"
                      bgClass={dcd > 0 ? "" : "opacity-40 grayscale"}
                    />
                  </div>
                );
              })()}
            </section>

            {/* Analytics Section */}
            <section>
              <Analytics />
            </section>

            {/* History Section */}
            <section className="pb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAverages(!showAverages)}
                  className="h-8 text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground hover:text-foreground font-mono border-2 border-foreground bg-card rounded-none"
                >
                  {showAverages ? "Hide Avg" : "Show Avg"}
                </Button>
              </div>

              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground text-sm font-mono uppercase tracking-wider animate-pulse">Loading history...</div>
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
                      <motion.div
                        key={month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Collapsible defaultOpen={false}>
                          <CollapsibleTrigger className="w-full" data-testid={`button-month-toggle-${index}`}>
                            <div className="flex items-center justify-between px-3 py-2.5 border-3 border-foreground bg-card brutal-shadow-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                              {/* Left: Date */}
                              <div className="flex items-center gap-2 justify-start">
                                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:-rotate-90" />
                                <h3 className="text-xs font-black text-foreground truncate uppercase tracking-wider">{month}</h3>
                              </div>

                              {/* Center: Averages */}
                              {showAverages && (
                                <div className="flex items-center justify-center gap-3 text-[10px] font-mono font-black text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <span>W:</span>
                                    <span className="text-orange-500" data-testid="avg-waiter">€{avgWaiter.toFixed(0)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>C:</span>
                                    <span className="text-emerald-500" data-testid="avg-cook">€{avgCook.toFixed(0)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>D:</span>
                                    <span className="text-blue-500" data-testid="avg-dishwasher">€{avgDishwasher.toFixed(0)}</span>
                                  </div>
                                </div>
                              )}

                              {/* Right: Total */}
                              <div className="flex justify-end">
                                <span className="text-sm font-black text-primary font-mono">€{monthTotal.toFixed(2)}</span>
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
                                      <div className="text-[11px] font-black text-muted-foreground font-mono uppercase tracking-wider">{date}</div>
                                      <div className="text-[11px] font-black text-primary/70 font-mono">Day: €{dayTotal.toFixed(2)}</div>
                                    </div>
                                    <div className="space-y-2">
                                      {dayCalculations.map((calc, idx) => (
                                        <motion.div
                                          key={calc.id}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                                        >
                                          <HistoryItem calculation={calc} />
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-3 border-dashed border-foreground/30">
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">No calculations saved yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* (Action Buttons moved up) */}
          </div>
        </ScrollArea>
      </div>

      <DrinkOrderFlow
        open={showDrinkFlow}
        onClose={() => setShowDrinkFlow(false)}
      />

      <OrderModal
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
      />
    </div >
  );
}
