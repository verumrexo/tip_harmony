import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChefHat, Utensils, Waves, Save, History, Coins, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { PersonSelector } from "@/components/PersonSelector";
import { ResultCard } from "@/components/ResultCard";
import { HistoryItem } from "@/components/HistoryItem";
import { TodayTable } from "@/components/TodayTable";
import { Button } from "@/components/ui/button";
import { useCalculations, useCreateCalculation, useDeleteCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Analytics } from "@/components/Analytics";
import { Leaderboard } from "@/components/Leaderboard";
import { TIP_PERCENTAGES } from "@/lib/constants";
import { DrinkOrderFlow } from "@/components/DrinkOrderFlow";
import { OutOfStock } from "@/components/OutOfStock";
import { OrderModal } from "@/components/OrderModal";
import { BottomNav, type TabId } from "@/components/BottomNav";

export default function Home() {
  // State
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [waiterCount, setWaiterCount] = useState<number>(1);
  const [cookCount, setCookCount] = useState<number>(1);
  const [dishwasherCount, setDishwasherCount] = useState<number>(1);

  const [activeTab, setActiveTab] = useState<TabId>("tips");
  const [showAverages, setShowAverages] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [showDrinkFlow, setShowDrinkFlow] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<{
    waiterTotal: number; cookTotal: number; dishwasherTotal: number;
    waiterCount: number; cookCount: number; dishwasherCount: number;
  } | null>(null);

  // Queries & Mutations
  const { data: history, isLoading: isLoadingHistory } = useCalculations();
  const createCalculation = useCreateCalculation();
  const deleteCalculation = useDeleteCalculation();
  const { toast } = useToast();

  const todaysSplits = useMemo(() => {
    if (!history) return [];
    const todayStr = new Date().toLocaleDateString();
    // TodayTable puts them in time order itself
    return history.filter((calc) => {
      if (!calc.createdAt) return false;
      return new Date(calc.createdAt).toLocaleDateString() === todayStr;
    });
  }, [history]);

  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;

    // collect unique calendar date strings that have saves
    const daysWithSaves = new Set<string>();
    history.forEach((calc) => {
      if (!calc.createdAt) return;
      const d = new Date(calc.createdAt);
      // yyyy-mm-dd key so locale doesn't mess things up
      daysWithSaves.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    const today = new Date();
    const toKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const todayKey = toKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toKey(yesterday);

    const hasToday = daysWithSaves.has(todayKey);
    const hasYesterday = daysWithSaves.has(yesterdayKey);

    // if neither today nor yesterday have saves, streak is 0
    if (!hasToday && !hasYesterday) return 0;

    // start counting from the most recent active day
    let count = 0;
    const cursor = new Date(today);

    // if no saves today, start from yesterday (grace period)
    if (!hasToday) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (daysWithSaves.has(toKey(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [history]);

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

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff0000', '#ff9900', '#ffff00', '#33cc33', '#3399ff', '#9933ff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff0000', '#ff9900', '#ffff00', '#33cc33', '#3399ff', '#9933ff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const checkIfNewRecord = useCallback((savedAmount: number) => {
    if (!history) return false;

    // build daily totals from existing history (same logic as Leaderboard)
    const dailyTotals: Record<string, number> = {};
    history.forEach(calc => {
      if (!calc.createdAt) return;
      const date = new Date(calc.createdAt).toLocaleDateString();
      dailyTotals[date] = (dailyTotals[date] || 0) + Number(calc.totalAmount);
    });

    // add the newly saved amount to today
    const todayStr = new Date().toLocaleDateString();
    const newTodayTotal = (dailyTotals[todayStr] || 0) + savedAmount;

    // get sorted daily totals (excluding today since we recalculate it)
    const otherDays = Object.entries(dailyTotals)
      .filter(([date]) => date !== todayStr)
      .map(([, total]) => total)
      .sort((a, b) => b - a);

    // check if newTodayTotal would land in top 3
    const top3Threshold = otherDays.length >= 3 ? otherDays[2] : -1;
    return newTodayTotal > top3Threshold;
  }, [history]);

  const handleUndo = async (id: number, amountText: string) => {
    try {
      await deleteCalculation.mutateAsync(id);
      // Put the amount back so it can be corrected, unless a new one was typed already
      setTotalAmount((current) => (current === "" ? amountText : current));
      setLastSaved(null);
      toast({
        title: "Undone",
        description: "Calculation removed from history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to undo. The calculation is still in history.",
        variant: "destructive",
      });
    }
  };

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
      const isRecord = checkIfNewRecord(amount);

      const saved = await createCalculation.mutateAsync({
        totalAmount: amount.toString(),
        waiterCount,
        cookCount,
        dishwasherCount,
        waiterPerPerson: waiterPerPerson.toString(),
        cookPerPerson: cookPerPerson.toString(),
        dishwasherPerPerson: dishwasherPerPerson.toString(),
      });

      const undoAction = (
        <ToastAction altText="Undo save" onClick={() => handleUndo(saved.id, totalAmount)}>
          Undo
        </ToastAction>
      );

      if (isRecord) {
        fireConfetti();
        toast({
          title: "🏆 NEW RECORD!",
          description: "Today just hit the Hall of Fame top 3!",
          action: undoAction,
          duration: 8000,
        });
      } else {
        toast({
          title: "Saved!",
          description: "Calculation added to history.",
          action: undoAction,
          duration: 8000,
        });
      }

      setLastSaved({
        waiterTotal, cookTotal, dishwasherTotal,
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

  // ─── Tab Content Renderers ───────────────────────────────────

  const renderTipsTab = () => {
    // After saving, the input clears but the summary keeps showing the split that was just saved
    const shown = amount > 0
      ? { waiterTotal, cookTotal, dishwasherTotal, waiterCount, cookCount, dishwasherCount }
      : (lastSaved ?? { waiterTotal: 0, cookTotal: 0, dishwasherTotal: 0, waiterCount, cookCount, dishwasherCount });

    return (
      <div className="p-5 space-y-5">
        <CurrencyInput
          label="Total tips"
          placeholder="0.00"
          value={totalAmount}
          onValueChange={setTotalAmount}
        />

        {/* What each person gets, right under the amount so it stays in view while typing */}
        <section aria-label="What each person gets" className="grid grid-cols-3 border-2 border-border bg-card brutal-shadow">
          <ResultCard
            title="Waiters"
            amount={shown.waiterTotal}
            count={shown.waiterCount}
            icon={Utensils}
            colorClass="text-role-waiter"
            tintClass="bg-role-waiter/15"
          />
          <ResultCard
            title="Cooks"
            amount={shown.cookTotal}
            count={shown.cookCount}
            icon={ChefHat}
            colorClass="text-role-cook"
            tintClass="bg-role-cook/15"
          />
          <ResultCard
            title="Dish"
            amount={shown.dishwasherTotal}
            count={shown.dishwasherCount}
            icon={Waves}
            colorClass="text-role-dish"
            tintClass="bg-role-dish/15"
            bgClass={shown.dishwasherCount > 0 ? "" : "opacity-40 grayscale"}
          />
        </section>

        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">Who worked</h2>
          <PersonSelector
            label="Waiters"
            hint={`${Math.round(waiterSharePct * 100)}%`}
            icon={<Utensils className="w-4 h-4 text-role-waiter" />}
            value={waiterCount}
            options={[1, 2, 3, 4]}
            onChange={setWaiterCount}
          />
          <PersonSelector
            label="Cooks"
            hint={`${Math.round(cookSharePct * 100)}%`}
            icon={<ChefHat className="w-4 h-4 text-role-cook" />}
            value={cookCount}
            options={[1, 2, 3]}
            onChange={setCookCount}
          />
          <PersonSelector
            label="Dishwashers"
            hint={`${Math.round(dishwasherSharePct * 100)}%`}
            icon={<Waves className="w-4 h-4 text-role-dish" />}
            value={dishwasherCount}
            options={[0, 1]}
            onChange={setDishwasherCount}
          />
        </section>

        {todaysSplits.length > 0 && <TodayTable splits={todaysSplits} />}
      </div>
    );
  };

  const renderHistoryTab = () => (
    <div className="p-5 space-y-4">
      <div className="border-2 border-border bg-card brutal-shadow">
        <div className="flex items-center justify-between p-3 border-b-2 border-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAverages(!showAverages)}
              className="h-8 text-[11px] uppercase font-black tracking-[0.08em] text-muted-foreground hover:text-foreground font-mono border-2 border-border bg-card rounded-none"
            >
              {showAverages ? "Hide Avg" : "Show Avg"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowCalendar(!showCalendar); setSelectedCalendarDay(null); }}
              className={`h-8 text-[11px] uppercase font-black tracking-[0.08em] font-mono border-2 border-border rounded-none ${showCalendar ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-card'}`}
            >
              Cal
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isLoadingHistory ? (
            <div className="text-center py-8 text-muted-foreground text-sm font-mono uppercase tracking-wider animate-pulse">Loading history...</div>
          ) : history && history.length > 0 ? (
            showCalendar ? (
              /* ===== CALENDAR VIEW ===== */
              (() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const daysInMonth = lastDay.getDate();

                // Monday = 0, Sunday = 6 (European style)
                const startDow = (firstDay.getDay() + 6) % 7;

                // Build daily totals map for this month
                const dailyTotals: Record<number, number> = {};
                const dailyCalcs: Record<number, typeof history> = {};
                let monthMax = 0;
                history.forEach(calc => {
                  if (!calc.createdAt) return;
                  const d = new Date(calc.createdAt);
                  if (d.getMonth() !== month || d.getFullYear() !== year) return;
                  const day = d.getDate();
                  dailyTotals[day] = (dailyTotals[day] || 0) + Number(calc.totalAmount);
                  if (!dailyCalcs[day]) dailyCalcs[day] = [];
                  dailyCalcs[day].push(calc);
                  if (dailyTotals[day] > monthMax) monthMax = dailyTotals[day];
                });

                const today = new Date();
                const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                const todayDate = today.getDate();

                const getHeatClass = (total: number) => {
                  if (!total || total === 0) return 'bg-muted/30';
                  const ratio = monthMax > 0 ? total / monthMax : 0;
                  if (ratio >= 1) return 'bg-primary text-primary-foreground';
                  if (ratio >= 0.6) return 'bg-primary/60';
                  if (ratio >= 0.3) return 'bg-primary/40';
                  return 'bg-primary/20';
                };

                const cells = [];
                // Empty cells before first day
                for (let i = 0; i < startDow; i++) {
                  cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                }
                // Day cells
                for (let day = 1; day <= daysInMonth; day++) {
                  const total = dailyTotals[day] || 0;
                  const heatClass = getHeatClass(total);
                  const isToday = isCurrentMonth && day === todayDate;
                  const dayKey = `${year}-${month}-${day}`;
                  const isSelected = selectedCalendarDay === dayKey;
                  cells.push(
                    <button
                      key={day}
                      onClick={() => setSelectedCalendarDay(isSelected ? null : (dailyCalcs[day] ? dayKey : null))}
                      className={`aspect-square relative flex flex-col items-center justify-center border-2 border-foreground/20 transition-all ${heatClass} ${isToday ? 'border-primary border-dashed !border-2' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''} ${total > 0 ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'}`}
                    >
                      <span className="absolute top-0.5 left-1 text-[11px] font-mono font-bold leading-none">{day}</span>
                      {total > 0 && (
                        <span className="text-xs font-black font-mono leading-none mt-1">€{total.toFixed(0)}</span>
                      )}
                    </button>
                  );
                }

                const monthLabel = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
                const calMonthTotal = Object.values(dailyTotals).reduce((s, v) => s + v, 0);

                // Get selected day's calculations
                const selectedDayCalcs = selectedCalendarDay
                  ? (() => {
                    const parts = selectedCalendarDay.split('-').map(Number);
                    return dailyCalcs[parts[2]] || [];
                  })()
                  : [];

                return (
                  <div className="space-y-3">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })}
                        className="w-8 h-8 p-0 border-2 border-border bg-card hover:bg-muted rounded-none"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-center">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">{monthLabel}</h3>
                        <p className="text-[11px] font-mono font-black text-primary">€{calMonthTotal.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })}
                        className="w-8 h-8 p-0 border-2 border-border bg-card hover:bg-muted rounded-none"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                        <div key={d} className="text-center text-[11px] font-black uppercase tracking-wider text-muted-foreground py-1">{d}</div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {cells}
                    </div>

                    {/* Selected day expansion */}
                    {selectedCalendarDay && selectedDayCalcs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t-2 border-foreground/20">
                        <div className="text-[11px] font-black text-muted-foreground font-mono uppercase tracking-wider">
                          {(() => {
                            const parts = selectedCalendarDay.split('-').map(Number);
                            return new Date(parts[0], parts[1], parts[2]).toLocaleDateString();
                          })()}
                        </div>
                        {selectedDayCalcs.map((calc, idx) => (
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
                    )}
                  </div>
                );
              })()
            ) : (
              /* ===== LIST VIEW (original) ===== */
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
                        <div className="flex items-center justify-between px-3 py-2.5 border-2 border-border bg-card brutal-shadow-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                          {/* Left: Date */}
                          <div className="flex items-center gap-2 justify-start min-w-0">
                            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:-rotate-90" />
                            <h3 className="text-xs font-black text-foreground truncate uppercase tracking-wider">{month}</h3>
                          </div>

                          {/* Center: Averages */}
                          {showAverages && (
                            <div className="flex items-center justify-center gap-3 shrink-0 text-[11px] font-mono font-black text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>W:</span>
                                <span className="text-role-waiter" data-testid="avg-waiter">€{avgWaiter.toFixed(0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>C:</span>
                                <span className="text-role-cook" data-testid="avg-cook">€{avgCook.toFixed(0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>D:</span>
                                <span className="text-role-dish" data-testid="avg-dishwasher">€{avgDishwasher.toFixed(0)}</span>
                              </div>
                            </div>
                          )}

                          {/* Right: Total */}
                          <div className="flex justify-end shrink-0">
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
            )
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-foreground/30">
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">No calculations saved yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWriteOffTab = () => (
    <DrinkOrderFlow open={true} onClose={() => { }} inline />
  );

  const renderJapasutaTab = () => (
    <OutOfStock inline />
  );

  const renderSupplierTab = () => (
    <OrderModal open={true} onOpenChange={() => { }} inline />
  );

  const renderStatsTab = () => (
    <div className="p-5 space-y-6">
      <section>
        <Leaderboard />
      </section>
      <section className="pb-4">
        <Analytics />
      </section>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden text-foreground bg-background select-none">
      {/* Header */}
      <header className="shrink-0 relative z-50 px-4 py-3 pt-safe bg-card border-b-2 border-border touch-none">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-ink bg-primary flex items-center justify-center brutal-shadow-sm shrink-0">
                <Coins className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-[15px] sm:text-lg font-bold text-foreground uppercase tracking-[0.04em] whitespace-nowrap truncate">Tip Harmony+</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(history && history.length > 0) || streak >= 2 ? (
                <div className="flex items-stretch border-2 border-border bg-background">
                  {history && history.length > 0 && (
                    <div className="text-right px-1.5 py-[5px]">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em] leading-none mb-[3px]">Month</p>
                      <p className="text-sm font-bold text-foreground leading-none font-mono">
                        €{history.filter(calc => {
                          if (!calc.createdAt) return false;
                          const date = new Date(calc.createdAt);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).reduce((sum, calc) => sum + Number(calc.totalAmount), 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {history && history.length > 0 && streak >= 2 && (
                    <div className="w-[2px] self-stretch bg-border"></div>
                  )}
                  {streak >= 2 && (
                    <div className="text-right px-1.5 py-[5px]">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em] leading-none mb-[3px]">Streak</p>
                      <p className="text-sm font-bold text-foreground leading-none font-mono flex items-center justify-end gap-[3px]">
                        <Flame className="w-3.5 h-3.5 text-role-waiter" />
                        {streak}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 relative z-10 bg-background">
          <div className="pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "tips" && renderTipsTab()}
                {activeTab === "history" && renderHistoryTab()}
                {activeTab === "writeoff" && renderWriteOffTab()}
                {activeTab === "japasuta" && renderJapasutaTab()}
                {activeTab === "supplier" && renderSupplierTab()}
                {activeTab === "stats" && renderStatsTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

      {/* Save bar: sits above the tabs on the Tips screen, so it's always in reach */}
      {activeTab === "tips" && (
        <div className="shrink-0 relative z-10 px-5 py-3 bg-background border-t-2 border-border">
          {amount > 0 ? (
            <Button
              className="w-full h-14 text-base gap-2.5 font-bold uppercase tracking-[0.1em] rounded-none border-2 border-ink bg-primary text-primary-foreground hover:bg-primary brutal-shadow brutal-hover [&_svg]:size-5"
              onClick={handleSave}
              disabled={createCalculation.isPending}
            >
              {createCalculation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save />
                  Save split · €{amount.toFixed(2)}
                </>
              )}
            </Button>
          ) : (
            <Button
              className="w-full h-14 text-base gap-2.5 font-bold uppercase tracking-[0.1em] border-2 border-border rounded-none transition-all duration-300 bg-muted text-muted-foreground cursor-not-allowed [&_svg]:size-5"
              disabled
            >
              <Save />
              Save split
            </Button>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dialog-based DrinkOrderFlow (triggered after save) */}
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
