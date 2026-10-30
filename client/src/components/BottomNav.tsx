import { History, Coins, FileText, Trophy, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

export type TabId = "history" | "writeoff" | "japasuta" | "tips" | "supplier" | "stats";

const TABS: { id: TabId; label: string; icon: typeof Coins }[] = [
    { id: "history", label: "History", icon: History },
    { id: "writeoff", label: "Write-off", icon: UtensilsCrossed },
    { id: "tips", label: "Tips", icon: Coins },
    { id: "supplier", label: "Supplier", icon: FileText },
    { id: "stats", label: "Stats", icon: Trophy },
];

interface BottomNavProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
        <nav className="shrink-0 z-50 border-t-2 border-border bg-card pb-safe touch-none">
            <div className="flex items-center justify-around px-1 h-[68px]">
                {TABS.map((tab) => {
                    const isWriteOff = tab.id === "writeoff";
                    const isActive = activeTab === tab.id || (isWriteOff && activeTab === "japasuta");
                    const isCenter = tab.id === "tips";
                    const Icon = tab.icon;

                    const content = (
                        <div
                            className={`
                                relative flex flex-col items-center justify-center gap-1 flex-1
                                transition-all duration-150 tap-highlight-transparent
                                ${isCenter ? "-mt-[18px]" : "pt-1.5"}
                            `}
                        >
                            {/* Icon container */}
                            <motion.div
                                animate={isActive ? { scale: 1 } : { scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`
                                    flex items-center justify-center transition-colors duration-150
                                    ${isCenter
                                        ? `w-14 h-14 border-2 border-ink ${isActive
                                            ? "bg-primary text-primary-foreground brutal-shadow-sm"
                                            : "bg-card text-muted-foreground"
                                        }`
                                        : `h-[30px] px-3 ${isActive
                                            ? "bg-primary text-primary-foreground border-2 border-ink"
                                            : "text-muted-foreground"
                                        }`
                                    }
                                `}
                            >
                                <Icon className={isCenter ? "w-7 h-7" : "w-[22px] h-[22px]"} />
                            </motion.div>

                            {/* Label */}
                            <span
                                className={`
                                    text-[11px] leading-none transition-colors duration-150
                                    ${isActive ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}
                                `}
                            >
                                {tab.label}
                            </span>
                        </div>
                    );

                    if (isWriteOff) {
                        return (
                            <Popover key={tab.id} open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex-1 focus:outline-none">{content}</button>
                                </PopoverTrigger>
                                <PopoverContent
                                    side="top"
                                    align="center"
                                    className="w-40 p-1 mb-2 border-2 border-border bg-card rounded-none brutal-shadow-sm"
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => { onTabChange("writeoff"); setPopoverOpen(false); }}
                                            className={`p-2.5 text-xs font-bold uppercase tracking-wider text-left hover:bg-primary hover:text-primary-foreground transition-colors ${activeTab === "writeoff" ? "bg-primary/20" : ""}`}
                                        >
                                            Norakstīt
                                        </button>
                                        <button
                                            onClick={() => { onTabChange("japasuta"); setPopoverOpen(false); }}
                                            className={`p-2.5 text-xs font-bold uppercase tracking-wider text-left hover:bg-primary hover:text-primary-foreground transition-colors ${activeTab === "japasuta" ? "bg-primary/20" : ""}`}
                                        >
                                            Jāpasūta
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex-1"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
