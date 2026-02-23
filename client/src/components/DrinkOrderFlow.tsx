import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Send, Wine, FileText, Copy, Loader2 } from "lucide-react";
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

type Step = "confirm" | "categories" | "items" | "report";

interface DrinkOrderFlowProps {
    open: boolean;
    onClose: () => void;
}

export function DrinkOrderFlow({ open, onClose }: DrinkOrderFlowProps) {
    const [step, setStep] = useState<Step>("confirm");
    const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [reportText, setReportText] = useState<string>("");
    const [reportLoading, setReportLoading] = useState(false);
    const createDrinkOrder = useCreateDrinkOrder();
    const { toast } = useToast();

    const totalItems = useMemo(() => {
        return Object.values(quantities).reduce((sum, q) => sum + q, 0);
    }, [quantities]);

    const handleClose = () => {
        setStep("confirm");
        setSelectedCategory(null);
        setQuantities({});
        setReportText("");
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
        setReportLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 1).toISOString();

        let orders;
        try {
            const { data, error } = await supabase
                .from('drink_orders')
                .select('*')
                .gte('created_at', startDate)
                .lt('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            orders = data;
        } catch {
            setReportLoading(false);
            toast({
                title: "Kļūda",
                description: "Neizdevās iegūt datus no servera.",
                variant: "destructive",
            });
            return;
        }

        setReportLoading(false);

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

        // Build text summary
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

        setReportText(report);
        setStep("report");
    };

    // Called directly from a button tap = fresh user gesture = clipboard works on mobile
    const handleCopyReport = async () => {
        try {
            await navigator.clipboard.writeText(reportText);
        } catch {
            // fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = reportText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        toast({
            title: "Nokopēts! 📋",
            description: "Atskaite nokopēta starpliktuvē.",
        });
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
            <DialogContent className="w-[85vw] max-w-[340px] p-0 gap-0 overflow-hidden rounded-none border-3 border-foreground brutal-shadow max-h-[85vh] bg-card">
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
                                    <div className="w-12 h-12 border-3 border-foreground bg-amber-400 flex items-center justify-center brutal-shadow-sm">
                                        <Wine className="w-5 h-5 text-foreground" />
                                    </div>
                                </div>
                                <DialogTitle className="text-xl text-center font-black uppercase tracking-wider">
                                    Noraksti
                                </DialogTitle>
                                <DialogDescription className="text-center text-muted-foreground text-sm font-mono">
                                    Vai vēlies norakstīt dzērienus?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2.5">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 text-sm font-bold uppercase tracking-wider border-3 border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground transition-all rounded-none brutal-shadow-sm brutal-hover"
                                    onClick={handleNo}
                                >
                                    Nē
                                </Button>
                                <Button
                                    className="flex-1 h-11 text-sm font-bold uppercase tracking-wider border-3 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 rounded-none brutal-shadow-sm brutal-hover"
                                    onClick={handleYes}
                                >
                                    Jā
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-3 h-8 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground gap-1.5 font-mono font-bold rounded-none"
                                onClick={handleSendReport}
                                disabled={reportLoading}
                            >
                                {reportLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <FileText className="w-3 h-3" />
                                )}
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
                            <div className="px-4 pt-4 pb-2.5 border-b-3 border-foreground">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-base font-black uppercase tracking-wider">Kategorijas</DialogTitle>
                                    {totalItems > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground font-mono font-bold">
                                                {totalItems}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-black uppercase tracking-wider border-3 border-foreground bg-primary text-primary-foreground rounded-none brutal-shadow-sm brutal-hover"
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
                                <div className="p-2.5 grid grid-cols-2 gap-2">
                                    {drinkCategories.map((category) => {
                                        const count = categoryCounts[category.name] || 0;
                                        return (
                                            <button
                                                key={category.name}
                                                onClick={() => handleCategorySelect(category)}
                                                className="relative group text-left p-3 border-3 border-foreground bg-card hover:bg-muted transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] brutal-shadow-sm"
                                            >
                                                <span className="text-[11px] font-black text-foreground leading-tight line-clamp-2 uppercase tracking-wider">
                                                    {category.name}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground mt-0.5 block font-mono font-bold">
                                                    {category.items.length}
                                                </span>
                                                {count > 0 && (
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 border-2 border-foreground bg-amber-400 text-foreground text-[9px] font-black flex items-center justify-center">
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
                            <div className="px-4 pt-3 pb-2.5 border-b-3 border-foreground">
                                <div className="flex items-center gap-2.5">
                                    <button
                                        onClick={handleBack}
                                        className="w-7 h-7 border-3 border-foreground bg-card flex items-center justify-center hover:bg-muted transition-colors active:translate-x-[1px] active:translate-y-[1px] shrink-0"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-xs font-black truncate uppercase tracking-wider">
                                            {selectedCategory.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-[9px] text-muted-foreground font-mono">
                                            +/− daudzumu
                                        </DialogDescription>
                                    </div>
                                    {totalItems > 0 && (
                                        <Button
                                            size="sm"
                                            className="h-7 px-3 text-[10px] font-black uppercase tracking-wider border-3 border-foreground bg-primary text-primary-foreground rounded-none brutal-shadow-sm brutal-hover shrink-0"
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
                                <div className="p-2.5 space-y-1">
                                    {selectedCategory.items.map((item) => {
                                        const key = getKey(selectedCategory.name, item.name);
                                        const qty = quantities[key] || 0;
                                        return (
                                            <div
                                                key={item.name}
                                                className={`flex items-center gap-2 p-2.5 transition-all duration-100 ${qty > 0
                                                    ? "bg-primary/10 border-3 border-primary"
                                                    : "bg-card border-3 border-transparent hover:border-foreground/20"
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground leading-tight uppercase">
                                                        {item.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() =>
                                                            handleDecrement(selectedCategory.name, item.name)
                                                        }
                                                        disabled={qty === 0}
                                                        className="w-7 h-7 border-2 border-foreground bg-card flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-20 disabled:pointer-events-none"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span
                                                        className={`w-6 text-center text-xs font-black font-mono tabular-nums ${qty > 0 ? "text-primary" : "text-muted-foreground/30"
                                                            }`}
                                                    >
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleIncrement(selectedCategory.name, item.name)
                                                        }
                                                        className="w-7 h-7 border-2 border-foreground bg-card flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all active:translate-x-[1px] active:translate-y-[1px]"
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

                    {/* Step 4: Report */}
                    {step === "report" && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col max-h-[85vh]"
                        >
                            <div className="px-4 pt-3 pb-2.5 border-b-3 border-foreground">
                                <div className="flex items-center gap-2.5">
                                    <button
                                        onClick={() => { setReportText(""); setStep("confirm"); }}
                                        className="w-7 h-7 border-3 border-foreground bg-card flex items-center justify-center hover:bg-muted transition-colors active:translate-x-[1px] active:translate-y-[1px] shrink-0"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <DialogTitle className="text-xs font-black uppercase tracking-wider">
                                        Atskaite
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">Mēneša atskaite</DialogDescription>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 max-h-[calc(85vh-120px)]">
                                <pre className="p-4 text-[11px] font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                    {reportText}
                                </pre>
                            </ScrollArea>
                            <div className="p-3 border-t-3 border-foreground">
                                <Button
                                    className="w-full h-10 text-sm font-black uppercase tracking-wider border-3 border-foreground bg-primary text-primary-foreground rounded-none brutal-shadow-sm brutal-hover gap-2"
                                    onClick={handleCopyReport}
                                >
                                    <Copy className="w-4 h-4" />
                                    Kopēt
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
