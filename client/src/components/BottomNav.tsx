import { History, Wine, Coins, FileText, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export type TabId = "history" | "writeoff" | "tips" | "supplier" | "stats";

const TABS: { id: TabId; label: string; icon: typeof Coins }[] = [
    { id: "history", label: "History", icon: History },
    { id: "writeoff", label: "Write Off", icon: Wine },
    { id: "tips", label: "Tips", icon: Coins },
    { id: "supplier", label: "Supplier", icon: FileText },
    { id: "stats", label: "Stats", icon: Trophy },
];

interface BottomNavProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-3 border-foreground bg-card pb-safe">
            <div className="flex items-end justify-around px-1 h-16">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isCenter = tab.id === "tips";
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                relative flex flex-col items-center justify-center gap-0.5 flex-1 pt-1.5 pb-1
                transition-all duration-150 tap-highlight-transparent
                ${isCenter ? "-mt-3" : ""}
              `}
                        >
                            {/* Icon container */}
                            <motion.div
                                animate={isActive ? { scale: 1 } : { scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`
                  flex items-center justify-center transition-colors duration-150
                  ${isCenter
                                        ? `w-16 h-16 border-3 border-foreground ${isActive
                                            ? "bg-primary text-primary-foreground brutal-shadow-sm"
                                            : "bg-card text-muted-foreground"
                                        }`
                                        : `w-12 h-12 ${isActive
                                            ? "bg-primary text-primary-foreground border-3 border-foreground"
                                            : "text-muted-foreground"
                                        }`
                                    }
                `}
                            >
                                <Icon className={isCenter ? "w-8 h-8" : "w-5 h-5"} />
                            </motion.div>

                            {/* Label */}
                            <span
                                className={`
                  text-[8px] font-black uppercase tracking-[0.1em] font-mono leading-none
                  transition-colors duration-150
                  ${isActive ? "text-foreground" : "text-muted-foreground"}
                `}
                            >
                                {tab.label}
                            </span>

                            {/* Active dot indicator */}
                            {isActive && !isCenter && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-0.5 w-1 h-1 bg-primary"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
