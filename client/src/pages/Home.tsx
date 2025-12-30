import { useState } from "react";
import { ChefHat, Utensils, Waves, Save, History } from "lucide-react";
import { CurrencyInput } from "@/components/CurrencyInput";
import { PersonSelector } from "@/components/PersonSelector";
import { ResultCard } from "@/components/ResultCard";
import { HistoryItem } from "@/components/HistoryItem";
import { Button } from "@/components/ui/button";
import { useCalculations, useCreateCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <header className="px-6 py-6 bg-card/80 backdrop-blur-xl border-b sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Gril Restorans" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Tip Splitter</h1>
                <p className="text-xs text-muted-foreground font-medium">Fair & fast distribution</p>
              </div>
            </div>
            {/* Display total distribution check */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">
                {(waiterSharePct + cookSharePct + dishwasherSharePct) * 100}% Total
              </span>
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

              <div className="grid gap-4">
                <ResultCard
                  title="Waiters"
                  percentage={waiterSharePct * 100}
                  amount={waiterTotal}
                  count={waiterCount}
                  icon={Utensils}
                  colorClass="text-orange-600"
                  bgClass="bg-orange-50/50 border-orange-100"
                />

                <ResultCard
                  title="Cooks"
                  percentage={cookSharePct * 100}
                  amount={cookTotal}
                  count={cookCount}
                  icon={ChefHat}
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50/50 border-emerald-100"
                />

                <ResultCard
                  title="Dishwashers"
                  percentage={dishwasherSharePct * 100}
                  amount={dishwasherTotal}
                  count={dishwasherCount}
                  icon={Waves}
                  colorClass="text-blue-600"
                  bgClass={dishwasherCount > 0 ? "bg-blue-50/50 border-blue-100" : "bg-muted/30 border-transparent opacity-50 grayscale"}
                />
              </div>
            </section>

            {/* History Section */}
            <section className="pb-10">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">Recent History</h2>
              </div>
              
              <div className="space-y-3">
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading history...</div>
                ) : history && history.length > 0 ? (
                  history.slice().reverse().map((calc) => (
                    <HistoryItem key={calc.id} calculation={calc} />
                  ))
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
