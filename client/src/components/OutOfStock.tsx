import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOutOfStock, useCreateOutOfStock, useDeleteOutOfStock } from "@/hooks/use-out-of-stock";
import { useToast } from "@/hooks/use-toast";

interface OutOfStockProps {
    allowDelete?: boolean;
    showHeader?: boolean;
    inline?: boolean;
}

export function OutOfStock({ allowDelete = true, showHeader = true, inline = false }: OutOfStockProps) {
    const [newItemName, setNewItemName] = useState("");
    const { data: items, isLoading } = useOutOfStock();
    const createItem = useCreateOutOfStock();
    const deleteItem = useDeleteOutOfStock();
    const { toast } = useToast();

    const handleAdd = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newItemName.trim() || createItem.isPending) return;

        try {
            await createItem.mutateAsync(newItemName.trim());
            setNewItemName("");
            toast({
                title: "Pievienots!",
                description: `"${newItemName}" pievienots sarakstam.`,
            });
        } catch (error) {
            toast({
                title: "Kļūda",
                description: "Neizdevās pievienot ierakstu.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        try {
            await deleteItem.mutateAsync(id);
            toast({
                title: "Dzēsts",
                description: `"${name}" noņemts no saraksta.`,
            });
        } catch (error) {
            toast({
                title: "Kļūda",
                description: "Neizdevās izdzēst ierakstu.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className={`flex flex-col min-h-0 ${inline ? "h-full" : "max-h-[85vh]"}`}>
            {showHeader && (
                <div className="px-4 pt-4 pb-2.5 border-b-3 border-foreground bg-card">
                    <h2 className="text-base font-black uppercase tracking-wider">Jāpasūta</h2>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Preces, kas beigušās</p>
                </div>
            )}

            {(
                <div className="p-4 border-b-3 border-foreground bg-background">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <Input
                            autoFocus
                            placeholder="Ieraksti preci... (piem. San Pellegrino 0.7)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="h-11 border-3 border-foreground rounded-none brutal-shadow-sm focus-visible:ring-0 focus-visible:border-primary transition-all font-bold uppercase text-xs"
                            disabled={createItem.isPending}
                        />
                        <Button
                            type="submit"
                            disabled={!newItemName.trim() || createItem.isPending}
                            className="h-11 w-11 shrink-0 border-3 border-foreground bg-primary text-primary-foreground rounded-none brutal-shadow-sm brutal-hover p-0"
                        >
                            {createItem.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                </div>
            )}

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm font-mono uppercase tracking-wider animate-pulse">
                            Ielādē...
                        </div>
                    ) : items && items.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center justify-between p-3 border-3 border-foreground bg-card brutal-shadow-sm"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-black uppercase tracking-wide break-words whitespace-normal">
                                            {item.name}
                                        </p>
                                        <p className="text-[9px] font-mono text-muted-foreground">
                                            {item.createdAt?.toLocaleString()}
                                        </p>
                                    </div>
                                    {allowDelete && (
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            disabled={deleteItem.isPending}
                                            className="w-9 h-9 border-2 border-foreground bg-card flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all active:translate-x-[1px] active:translate-y-[1px] shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-12 border-3 border-dashed border-foreground/20">
                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                Viss ir uz vietas ✓
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
