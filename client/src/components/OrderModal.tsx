import { useState, useEffect } from "react";
import { Copy, RefreshCcw, Plus, Minus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Data
type MenuItem = {
    type: "category" | "item" | "description";
    name?: string;
    price?: string;
    content?: string;
    unit?: { singular: string; plural: string };
    labels?: { singular: string; plural: string };
    isReturn?: boolean;
};

const DEFAULT_MENU: MenuItem[] = [
    { type: "category", name: "DZIRKSTOŠIE VĪNI" },
    { type: "item", name: "Contadi Castaldi Franciacorta Brut, Lombardia, Italy (37.5cl)", price: "€29.00" },
    { type: "item", name: "Segura Viudas Rosado Brut, CAVA, Spain (75cl)", price: "€25.00" },
    { type: "item", name: "Tissot-Maire Cremant du Jura, Blanc de Blancs Brut, France (75cl)", price: "€32.00" },
    { type: "category", name: "ŠAMPANIETIS" },
    { type: "item", name: "Jean Pernet Le Mesnil Grand Cru Blanc de Blancs Brut (37.5cl)", price: "€39.00" },
    { type: "item", name: "Taittinger Brut Reserve (37.5cl)", price: "€39.00" },
    { type: "item", name: "Bollinger Special Cuvee (75cl)", price: "€99.00" },
    { type: "item", name: "Taittinger Prelude Grand Cru (75cl)", price: "€110.00" },
    { type: "category", name: "SĀRTVĪNS" },
    { type: "item", name: "Zenato Bardolino Chiaretto, Veneto, Italy (75cl)", price: "€6.00 / €25.00" },
    { type: "item", name: "Studio by Miraval Rose, France (75cl)", price: "€32.00" },
    { type: "category", name: "BALTVĪNI" },
    { type: "item", name: "Perrin La Vieille Ferme Blanc, France  (37,5cl)", price: "€12.00" },
    { type: "item", name: "El Coto Blanco, Rioja, Spain  (37,5cl)", price: "€14.00" },
    { type: "item", name: "Zenato Pinot Grigio delle Venezie, Italy  (37,5cl)", price: "€15.00" },
    { type: "item", name: "Louis Latour Bourgogne Chardonnay, France  (37,5cl)", price: "€22.00" },
    { type: "item", name: "Cascas Vinho Verde, Portugal (75 cl)", price: "€18.00" },
    { type: "item", name: "Dr. Hermann Riesling Trocken (75cl)", price: "€29.00" },
    { type: "category", name: "SARKANVĪNI" },
    { type: "item", name: "Perrin La Vieille Ferme Rouge, France  (37,5cl)", price: "€12.00" },
    { type: "item", name: "E. Guigal Cotes-du_Rhone, France  (37,5cl)", price: "€19.00" },
    { type: "item", name: "El Coto de Rioja Crianza, Spain  (37,5cl)", price: "€15.00" },
    { type: "item", name: "San Felice Chianti Classico, Italy  (37,5cl)", price: "€22.00" },
    { type: "item", name: "Cascas Tinto, Lisboa, Portugal (75 cl)", price: "€18.00" },
    { type: "item", name: "Arzuaga Crianza, Spain (75 cl)", price: "€29.00" },
    { type: "item", name: "Cono Sur Cabernet Sauvignon Reserva Especial, Chile (75 cl)", price: "€24.00" },
    { type: "item", name: "Salentein Killka Malbec Uco Valley, Mendoza, Argentina (75 cl)", price: "€29.00" },
    { type: "category", name: "ĪPAŠO VĪNU SELEKCIJA MŪSU GARDAJIEM GRILA ĒDIENIEM" },
    { type: "description", content: "Īpašo vīnu selekcijā, esam atlasījuši vīnus no ražotājiem, kuri vīnu ražo no ekoloģiski audzētām vīnogām, daži no tiem izmanto biodinamikas vai ilgtspējīgas vīnkopības principus." },
    { type: "category", name: "ŠAMPANIETIS" },
    { type: "item", name: "Ayala Brut Rose Majeur (75 cl)", price: "€95.00" },
    { type: "item", name: "Vilmart Grand Cellier d’Or Brut Millesime 2019 (75 cl)", price: "€150.00" },
    { type: "category", name: "DZIRKSTOŠIE VĪNI" },
    { type: "item", name: "Ruggeri Cartizze Prosecco di Valdobbiadene Brut, Veneto, Italy (75 cl)", price: "€39.00" },
    { type: "item", name: "Bellavista Alma Assemblage Franciacorta Extra Brut, Lombardia, Italy (75 cl)", price: "€65.00" },
    { type: "category", name: "SĀRTVĪNS" },
    { type: "item", name: "Miraval Rose, Provence, France (75 cl)", price: "€39.90" },
    { type: "category", name: "BALTVĪNI" },
    { type: "item", name: "Domaine Vacheron Sancerre, Loire, France 2024 (75 cl)", price: "€54.00" },
    { type: "item", name: "E.Guigal Condrieu, Rhone, France 2020 (75 cl)", price: "€89.00" },
    { type: "item", name: "Alois Lageder Pinot Grigio, Alto Adige, Italy 2023 (75 cl)", price: "€35.00" },
    { type: "item", name: "Pieropan Calvarino Soave Classico, Veneto, Italy 2023 (75 cl)", price: "€39.90" },
    { type: "item", name: "Hacienda Arinzano Chardonnay, Vino de Pago, Spain 2022 (75 cl)", price: "€35.00" },
    { type: "item", name: "Domane Wachau Gruner Veltliner Achleiten Smaragd, Austria 2023 (75 cl)", price: "€67.00" },
    { type: "category", name: "SARKANVĪNI" },
    { type: "item", name: "Mongeard Mugneret Bourgogne, France 2021 (75 cl)", price: "€59.00" },
    { type: "item", name: "Chateau La Tour Figeac St.Emilion Grand Cru Classe, Bordeaux 2020 (75 cl)", price: "€90.00" },
    { type: "item", name: "Coudolet de Beaucastel Cotes-du-Rhone, Rhone, France 2022 (75 cl)", price: "€59.00" },
    { type: "item", name: "E.Guigal Hermitage, Rhone, France 2020 (75 cl)", price: "€128.00" },
    { type: "item", name: "Tenuta Fertuna Lodai Cabernet Sauvignon Maremma, Toscana, Italy (75 cl)", price: "€36.00" },
    { type: "item", name: "il Poggione Brunello di Montalcino, Toscana, Italy 2019 (75 cl)", price: "€77.00" },
    { type: "item", name: "Planeta Santa Cecilia, Sicilia, Italy 2021 (75 cl)", price: "€55.00" },
    { type: "item", name: "Vietti Barolo, Piemonte, Italy 2021 (75 cl)", price: "€110.00" },
    { type: "item", name: "Pesquera Crianza, Ribera del Duero, Spain 2022 (75 cl)", price: "€39.00" },
    { type: "item", name: "Flor de Pingus, Ribera del Duero, Spain 2022 (75 cl)", price: "€178.00" },
    { type: "item", name: "Henschke Henry Seven Shiraz Grenache Viognier Barossa, Australia 2023 (75 cl)", price: "€52.00" },
    { type: "item", name: "Achaval Ferrer Quimera, Mendoza, Argentina 2021 (75 cl)", price: "€69.00" },
    { type: "item", name: "Double Diamond Cabernet Sauvignon, Napa Valley, California 2022 (75 cl)", price: "" },
    { type: "category", name: "ŪDENS" },
    { type: "item", name: "Ūdens b/g Acqua Panna 0.25l", price: "€2.80", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Ūdens b/g Acqua Panna 0.75l", price: "€5.80", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Ūdens a/g S.Pellegrino 0.25l", price: "€2.80", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Ūdens a/g S.Pellegrino 0.75l", price: "€5.80", unit: { singular: "kaste", plural: "kastes" } }
];

const BALTIC_XL_MENU: MenuItem[] = [
    { type: "category", name: "DZIRKSTOŠIE VĪNI" },
    { type: "item", name: "Domus Picta Prosecco, Valdobbiadene, Italy (75cl)", price: "€6.50 / €29.00" },
    { type: "item", name: "Les Cocottes Chardonnay non-alcoholic (75cl)", price: "€6.00 / €28.00" },
    { type: "category", name: "BALTVĪNI" },
    { type: "item", name: "Dollfly river Sauvignon Blanc Marlborough, New Zealand (75 cl)", price: "€6.50 / €29.00" },
    { type: "item", name: "Aragosta Vermentino Di Sardegna (75cl)", price: "€21.00" },
    { type: "item", name: "La Villette Chardonnay, France (75cl)", price: "€21.00" },
    { type: "category", name: "SARKANVĪNI" },
    { type: "item", name: "Zuccardi Serie A, Malbec, Argentina (75 cl)", price: "€6.50 / €29.00" },
    { type: "item", name: "Conte di Campiano Riserva Primitivo, Italy (75 cl)", price: "€25.00" },
    { type: "item", name: "Poesie Valpolicella Ripasso, Italy (75 cl)", price: "€25.00" },
    { type: "category", name: "GIN" },
    { type: "item", name: "Hendrick’s Gin", price: "" },
    { type: "item", name: "Hayman’s London Dry Gin", price: "" },
    { type: "item", name: "Caorunn Scottish Gin", price: "" },
    { type: "category", name: "KONJAKI" },
    { type: "item", name: "A.De Fussigny XO Fine Champagne Cognac", price: "" },
    { type: "category", name: "VODKA" },
    { type: "item", name: "Stolichnaya", price: "" },
    { type: "item", name: "Stolichnaya Elit", price: "" },
    { type: "category", name: "TEKILA" },
    { type: "item", name: "Rooster Rojo Blanco", price: "" },
    { type: "item", name: "Rooster Rojo Reposado", price: "" },
    { type: "category", name: "VISKIJS" },
    { type: "item", name: "Jameson", price: "" },
    { type: "item", name: "Monkey Shoulder", price: "" },
    { type: "item", name: "Lagavulin Islay Single Malt 16y", price: "" },
    { type: "category", name: "VERMUTS" },
    { type: "item", name: "Martini Bianco", price: "" },
    { type: "item", name: "Campari", price: "" },
    { type: "item", name: "Aperol", price: "" },
    { type: "category", name: "RUMS" },
    { type: "item", name: "Havana Club gaišais", price: "" },
    { type: "item", name: "Havana Club tumšais", price: "" },
    { type: "item", name: "Plantation Original Dark", price: "" },
    { type: "category", name: "CITI DZĒRIENI" },
    { type: "item", name: "Rīgas melnais balzāms Original", price: "" },
    { type: "item", name: "Rīgas melnais balzāms upeņu", price: "" },
    { type: "item", name: "Jagermeister", price: "" },
    { type: "item", name: "Calvados Busnel Hors d’Age", price: "" }
];

const CIDO_DATA: MenuItem[] = [
    { type: "category", name: "SOFT DRINKS" },
    { type: "item", name: "Ūdens b/g Mangaļi 0.33l", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Ūdens a/g Mangaļi 0.33l", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Pepsi", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Pepsi Max", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Mirinda", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "7Up", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "category", name: "MUCAS" },
    { type: "item", name: "Kvass", price: "", unit: { singular: "muca", plural: "mucas" } },
    { type: "item", name: "Madonas alus", price: "", unit: { singular: "muca", plural: "mucas" } },
    { type: "category", name: "SULAS" },
    { type: "item", name: "Apelsīnu", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Ābolu", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Tomātu", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Persiku", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "item", name: "Plūmju", price: "", unit: { singular: "kaste", plural: "kastes" } },
    { type: "category", name: "ATGRIEŠANA" },
    { type: "item", name: "15l mucas", price: "", labels: { singular: "15l muca", plural: "15l mucas" }, isReturn: true },
    { type: "item", name: "30l mucas", price: "", labels: { singular: "30l muca", plural: "30l mucas" }, isReturn: true },
    { type: "item", name: "Pilnas Pepsi kastes", price: "", labels: { singular: "Pilna Pepsi kaste", plural: "Pilnas Pepsi kastes" }, isReturn: true },
    { type: "item", name: "Tukšas Pepsi kastes", price: "", labels: { singular: "Tukša Pepsi kaste", plural: "Tukšas Pepsi kastes" }, isReturn: true }
];

export function OrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [activeMenu, setActiveMenu] = useState<"interbaltija" | "baltic_xl" | "cido">("interbaltija");
    const [orderState, setOrderState] = useState<Record<string, number>>({});

    // Load state on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("order_symphony_data");
            if (saved) {
                setOrderState(JSON.parse(saved));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    // Save state tracking changes
    useEffect(() => {
        localStorage.setItem("order_symphony_data", JSON.stringify(orderState));
    }, [orderState]);

    const currentMenuData = activeMenu === "interbaltija" ? DEFAULT_MENU : activeMenu === "baltic_xl" ? BALTIC_XL_MENU : CIDO_DATA;

    const updateItem = (name: string, delta: number) => {
        setOrderState((prev) => {
            const current = prev[name] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [name]: next };
        });
    };

    const resetOrder = () => {
        if (confirm("Are you sure you want to reset all quantities to zero?")) {
            setOrderState({});
            toast({ title: "Reset complete", description: "All counts wiped." });
        }
    };

    const generateOrderText = () => {
        let standardItems: string[] = [];
        let returnItems: string[] = [];
        let hasItems = false;
        let currentCategory = "";

        // Iterate exactly like logic.js
        currentMenuData.forEach((entry) => {
            if (entry.type === "category") {
                currentCategory = entry.name || "";
            } else if (entry.type === "item") {
                const count = orderState[entry.name!] || 0;
                if (count > 0) {
                    hasItems = true;
                    let line = "";

                    if (entry.labels) {
                        const name = (count === 1 && entry.labels.singular) ? entry.labels.singular : (entry.labels.plural || entry.name);
                        line = `${name}: ${count}`;
                    } else if (entry.unit) {
                        const unit = (count === 1 && entry.unit.singular) ? entry.unit.singular : (entry.unit.plural || "");
                        line = `${entry.name}: ${count} ${unit}`;
                    } else {
                        const suffix = currentCategory === "ŪDENS" ? "kastes" : "pud";
                        line = `${entry.name}: ${count}${suffix}`;
                    }

                    if (entry.isReturn || currentCategory === "ATGRIEŠANA") {
                        returnItems.push(line);
                    } else {
                        standardItems.push(line);
                    }
                }
            }
        });

        if (!hasItems) {
            toast({ title: "Empty Order", description: "No items selected.", variant: "destructive" });
            return null;
        }

        let parts = [];
        if (standardItems.length > 0) {
            parts.push(standardItems.join("\n"));
        }
        if (returnItems.length > 0) {
            parts.push("Atgriešana:\n" + returnItems.join("\n"));
        }

        return parts.join("\n\n") + "\n";
    };

    const copyOrder = async () => {
        const orderText = generateOrderText();
        if (!orderText) return;

        try {
            await navigator.clipboard.writeText(orderText);
            toast({ title: "Copied!", description: "Order text is ready to paste." });
        } catch (e) {
            // Fallback
            if (navigator.share) {
                navigator.share({ title: "Pasūtījums", text: orderText }).catch(console.error);
            } else {
                toast({ title: "Error", description: "Could not copy or share.", variant: "destructive" });
            }
        }
    };


    // Helpers for UI
    const organizeIntoCards = (menu: MenuItem[]) => {
        const cards: { header?: string, desc?: string, items: MenuItem[] }[] = [];
        let currentCard: { header?: string, desc?: string, items: MenuItem[] } | null = null as { header?: string, desc?: string, items: MenuItem[] } | null;
        menu.forEach((entry) => {
            if (entry.type === "category") {
                if (currentCard && currentCard.items.length > 0) {
                    cards.push(currentCard);
                }
                currentCard = { header: entry.name, items: [] };
            } else if (entry.type === "description") {
                if (!currentCard) currentCard = { items: [] };
                currentCard.desc = entry.content;
            } else if (entry.type === "item") {
                if (!currentCard) currentCard = { items: [] };
                currentCard.items.push(entry);
            }
        });
        if (currentCard && currentCard.items.length > 0) {
            cards.push(currentCard);
        }
        return cards;
    };

    const cards = organizeIntoCards(currentMenuData);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-background h-[90vh] flex flex-col pt-safe px-0">
                <DialogHeader className="px-4 py-3 border-b-3 border-foreground bg-card">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Supplier Order
                        </DialogTitle>
                    </div>
                    <select
                        className="w-full p-2 mt-2 border-3 border-foreground bg-background font-mono text-sm uppercase font-black"
                        value={activeMenu}
                        onChange={(e) => setActiveMenu(e.target.value as any)}
                    >
                        <option value="interbaltija">Interbaltija</option>
                        <option value="baltic_xl">Baltic XL</option>
                        <option value="cido">Cido</option>
                    </select>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4 bg-muted/30">
                    <div className="space-y-6 pb-24">
                        {cards.map((card, idx) => (
                            <div key={idx} className="space-y-2">
                                {card.header && (
                                    <h2 className="text-base font-black uppercase tracking-wider text-foreground mb-1 mt-4">{card.header}</h2>
                                )}
                                {card.desc && (
                                    <p className="text-xs text-muted-foreground font-mono leading-relaxed">{card.desc}</p>
                                )}
                                <div className="border-3 border-foreground bg-card brutal-shadow-sm divide-y-3 divide-foreground">
                                    {card.items.map((item, i) => {
                                        const count = orderState[item.name!] || 0;
                                        return (
                                            <div key={i} className="flex justify-between items-center p-3 gap-3">
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold leading-tight">{item.name}</div>
                                                    {item.price && <div className="text-xs font-mono text-muted-foreground mt-1">{item.price}</div>}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        onClick={() => updateItem(item.name!, -1)}
                                                        className="w-8 h-8 flex items-center justify-center border-2 border-foreground bg-background active:bg-foreground active:text-background transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className={`text-base font-black font-mono w-4 text-center ${count > 0 ? "text-primary" : "text-foreground"}`}>{count}</span>
                                                    <button
                                                        onClick={() => updateItem(item.name!, 1)}
                                                        className="w-8 h-8 flex items-center justify-center border-2 border-foreground bg-primary text-primary-foreground active:opacity-70 transition-opacity"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Action Bar */}
                <div className="border-t-3 border-foreground bg-card p-4 flex gap-3 pb-safe items-center sticky bottom-0">
                    <Button
                        variant="outline"
                        onClick={resetOrder}
                        className="flex-1 border-3 border-foreground rounded-none h-12 brutal-hover font-black uppercase tracking-wider"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={copyOrder}
                        className="flex-[2] border-3 border-foreground rounded-none h-12 brutal-hover bg-primary hover:bg-primary font-black uppercase tracking-wider brutal-shadow-sm"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Order
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
