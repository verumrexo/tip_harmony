import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Send, Wine, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { drinkCategories, type DrinkCategory } from "@/lib/drinkData";
import { useCreateDrinkOrder, type DrinkOrderItem } from "@/hooks/use-drink-orders";
import { useToast } from "@/hooks/use-toast";

type Step = "confirm" | "categories" | "items";

interface DrinkOrderFlowProps {
    open: boolean;
    onClose: () => void;
}

export function DrinkOrderFlow({ open, onClose }: DrinkOrderFlowProps) {
    const [step, setStep] = useState<Step>("confirm");
    const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const createDrinkOrder = useCreateDrinkOrder();
    const { toast } = useToast();

    const totalItems = useMemo(() => {
        return Object.values(quantities).reduce((sum, q) => sum + q, 0);
    }, [quantities]);

    const handleClose = () => {
        setStep("confirm");
        setSelectedCategory(null);
        setQuantities({});
        onClose();
    };

    const handleNo = () => {
        handleClose();
    };

    const handleYes = () => {
        setStep("categories");
    };

    const handleCategorySelect = (category: DrinkCategory) => {
        setSelectedCategory(category);
        setStep("items");
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setStep("categories");
    };

    const getKey = (categoryName: string, itemName: string) => `${categoryName}::${itemName}`;

    const handleIncrement = (categoryName: string, itemName: string) => {
        const key = getKey(categoryName, itemName);
        setQuantities((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    };

    const handleDecrement = (categoryName: string, itemName: string) => {
        const key = getKey(categoryName, itemName);
        setQuantities((prev) => {
            const current = prev[key] || 0;
            if (current <= 0) return prev;
            const next = { ...prev };
            if (current === 1) {
                delete next[key];
            } else {
                next[key] = current - 1;
            }
            return next;
        });
    };

    const handleSend = async () => {
        const items: DrinkOrderItem[] = [];
        for (const [key, quantity] of Object.entries(quantities)) {
            if (quantity <= 0) continue;
            const [category, name] = key.split("::");
            items.push({ name, category, quantity });
        }

        if (items.length === 0) {
            handleClose();
            return;
        }

        try {
            await createDrinkOrder.mutateAsync(items);
            toast({
                title: "Norakstīts! ✓",
                description: `${items.length} pozīcija(s) nosūtīta(s).`,
            });
            handleClose();
        } catch (error) {
            toast({
                title: "Kļūda",
                description: "Neizdevās nosūtīt datus.",
                variant: "destructive",
            });
        }
    };

    const handleSendReport = async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 1).toISOString();
        try {
            const { data: orders, error } = await supabase
                .from('drink_orders')
                .select('*')
                .gte('created_at', startDate)
                .lt('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            if (!orders || orders.length === 0) {
                toast({
                    title: "Tukšs atskaite",
                    description: `Nav datu par ${month}/${year}.`,
                });
                return;
            }

            // Aggregate items
            const aggregated: Record<string, { name: string; category: string; quantity: number }> = {};
            for (const order of orders) {
                const items = JSON.parse(order.items) as Array<{ name: string; category: string; quantity: number }>;
                for (const item of items) {
                    const key = `${item.category}::${item.name}`;
                    if (aggregated[key]) {
                        aggregated[key].quantity += item.quantity;
                    } else {
                        aggregated[key] = { ...item };
                    }
                }
            }

            const sortedItems = Object.values(aggregated).sort((a, b) => a.category.localeCompare(b.category));

            // Build text summary and copy to clipboard
            let report = `Dzērienu atskaite — ${month}/${year}\n`;
            report += `Kopā ieraksti: ${orders.length}\n\n`;
            let currentCat = "";
            for (const item of sortedItems) {
                if (item.category !== currentCat) {
                    currentCat = item.category;
                    report += `\n${currentCat}\n`;
                }
                report += `  ${item.name}: ${item.quantity}\n`;
            }

            await navigator.clipboard.writeText(report);
            toast({
                title: "Atskaite nokopēta! 📋",
                description: `${sortedItems.length} pozīcijas par ${month}/${year} nokopētas starpliktuvē.`,
            });
        } catch {
            toast({
                title: "Kļūda",
                description: "Neizdevās iegūt atskaiti.",
                variant: "destructive",
            });
        }
    };

    // Count items per category for badge display
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const [key, qty] of Object.entries(quantities)) {
            const [category] = key.split("::");
            counts[category] = (counts[category] || 0) + qty;
        }
        return counts;
    }, [quantities]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="w-[85vw] max-w-[320px] p-0 gap-0 overflow-hidden rounded-2xl border-primary/20 max-h-[85vh]">
                <AnimatePresence mode="wait">
                    {/* Step 1: Confirm */}
                    {step === "confirm" && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="p-5"
                        >
                            <DialogHeader className="mb-5">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Wine className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <DialogTitle className="text-lg text-center font-bold">
                                    Noraksti
                                </DialogTitle>
                                <DialogDescription className="text-center text-muted-foreground text-sm">
                                    Vai vēlies norakstīt dzērienus?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2.5">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 text-sm rounded-xl border-muted-foreground/20 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                                    onClick={handleNo}
                                >
                                    Nē
                                </Button>
                                <Button
                                    className="flex-1 h-11 text-sm rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition-all"
                                    onClick={handleYes}
                                >
                                    Jā
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-3 h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground gap-1.5"
                                onClick={handleSendReport}
                            >
                                <FileText className="w-3 h-3" />
                                Mēneša atskaite
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Categories */}
                    {step === "categories" && (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col max-h-[85vh]"
                        >
                            <div className="px-4 pt-4 pb-2.5 border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-base font-bold">Kategorijas</DialogTitle>
                                    {totalItems > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {totalItems}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 rounded-lg text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20"
                                                onClick={handleSend}
                                                disabled={createDrinkOrder.isPending}
                                            >
                                                <Send className="w-2.5 h-2.5 mr-1" />
                                                {createDrinkOrder.isPending ? "..." : "Nosūtīt"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <DialogDescription className="sr-only">Izvēlies dzērienu kategoriju</DialogDescription>
                            </div>
                            <ScrollArea className="flex-1 max-h-[calc(85vh-64px)]">
                                <div className="p-2.5 grid grid-cols-2 gap-1.5">
                                    {drinkCategories.map((category) => {
                                        const count = categoryCounts[category.name] || 0;
                                        return (
                                            <button
                                                key={category.name}
                                                onClick={() => handleCategorySelect(category)}
                                                className="relative group text-left p-2.5 rounded-xl border border-border/50 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 active:scale-[0.97]"
                                            >
                                                <span className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                                                    {category.name}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground mt-0.5 block">
                                                    {category.items.length}
                                                </span>
                                                {count > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                                                        {count}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}

                    {/* Step 3: Items */}
                    {step === "items" && selectedCategory && (
                        <motion.div
                            key="items"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col max-h-[85vh]"
                        >
                            <div className="px-4 pt-3 pb-2.5 border-b border-border/50">
                                <div className="flex items-center gap-2.5">
                                    <button
                                        onClick={handleBack}
                                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors active:scale-95 shrink-0"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-xs font-bold truncate">
                                            {selectedCategory.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-[9px] text-muted-foreground">
                                            +/− daudzumu
                                        </DialogDescription>
                                    </div>
                                    {totalItems > 0 && (
                                        <Button
                                            size="sm"
                                            className="h-7 px-3 rounded-lg text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20 shrink-0"
                                            onClick={handleSend}
                                            disabled={createDrinkOrder.isPending}
                                        >
                                            <Send className="w-2.5 h-2.5 mr-1" />
                                            {createDrinkOrder.isPending ? "..." : `${totalItems}`}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <ScrollArea className="flex-1 max-h-[calc(85vh-64px)]">
                                <div className="p-2.5 space-y-0.5">
                                    {selectedCategory.items.map((item) => {
                                        const key = getKey(selectedCategory.name, item.name);
                                        const qty = quantities[key] || 0;
                                        return (
                                            <div
                                                key={item.name}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-200 ${qty > 0
                                                    ? "bg-amber-500/10 border border-amber-500/20"
                                                    : "bg-card border border-transparent hover:bg-muted/50"
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-foreground leading-tight">
                                                        {item.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() =>
                                                            handleDecrement(selectedCategory.name, item.name)
                                                        }
                                                        disabled={qty === 0}
                                                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span
                                                        className={`w-6 text-center text-xs font-bold tabular-nums ${qty > 0 ? "text-amber-500" : "text-muted-foreground/40"
                                                            }`}
                                                    >
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleIncrement(selectedCategory.name, item.name)
                                                        }
                                                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-500 transition-all active:scale-90"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
