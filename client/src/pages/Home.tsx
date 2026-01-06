import { useState } from "react";
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

export default function Home() {
  // State
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [waiterCount, setWaiterCount] = useState<number>(1);
  const [cookCount, setCookCount] = useState<number>(1);
  const [dishwasherCount, setDishwasherCount] = useState<number>(1);

  // Queries & Mutations
  const { data: history, isLoading: isLoadingHistory } = useCalculations();
  const createCalculation = useCreateCalculation();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <div className="max-w-md mx-auto min-h-screen bg-background shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-4 py-3 bg-card border-b sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Coins className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Tip Splitter</h1>
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
                onChange={(e) => setTotalAmount(e.target.value)}
                autoFocus
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

            {/* History Section */}
            <section className="pb-10">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">History</h2>
              </div>
              
              <div className="space-y-6">
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading history...</div>
                ) : history && history.length > 0 ? (
                  (() => {
                    // Group calculations by month then date
                    const groupedByMonth: { [key: string]: { [key: string]: typeof history } } = {};
                    history.forEach((calc) => {
                      if (!calc.createdAt) return;
                      const dateObj = new Date(calc.createdAt);
                      const monthKey = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                      const dateKey = dateObj.toLocaleDateString();
                      
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

                    const currentMonthKey = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

                    return (
                      <div className="space-y-3">
                        {sortedMonths.map((month, index) => {
                          const monthData = groupedByMonth[month];
                          const sortedDates = Object.keys(monthData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                          const monthTotal = Object.values(monthData).flat().reduce((sum, calc) => sum + Number(calc.totalAmount), 0);
                          const isCurrentMonth = month === currentMonthKey;

                          return (
                            <Collapsible key={month} defaultOpen={isCurrentMonth}>
                              <CollapsibleTrigger className="w-full" data-testid={`button-month-toggle-${index}`}>
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg hover-elevate cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:-rotate-90" />
                                    <h3 className="text-sm font-bold text-foreground">{month}</h3>
                                  </div>
                                  <span className="text-sm font-bold text-primary">€{monthTotal.toFixed(2)}</span>
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
                          );
                        })}
                      </div>
                    );
                  })()
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
