import React, { useState, useEffect } from "react";
import { Lock, Unlock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIOSInputZoomFix } from "@/hooks/use-ios-input-zoom-fix";

const PIN_CODE = import.meta.env.VITE_PIN_CODE || "2519";
const SESSION_KEY = "tip_harmony_unlocked";

export function PinLock({ children }: { children: React.ReactNode }) {
    const isReadOnly = useIOSInputZoomFix();
    const [pin, setPin] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unlocked = localStorage.getItem(SESSION_KEY);
        if (unlocked === "true") {
            setIsUnlocked(true);
        }
    }, []);

    const handleUnlock = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (pin === PIN_CODE) {
            localStorage.setItem(SESSION_KEY, "true");
            setIsUnlocked(true);
            toast({
                title: "Unlocked",
                description: "Welcome back.",
            });
        } else {
            toast({
                title: "Access Denied",
                description: "Incorrect PIN code.",
                variant: "destructive",
            });
            setPin("");
        }
    };

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[100dvh] flex items-center justify-center p-4 pt-safe pb-safe relative overflow-hidden bg-background">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--foreground)) 0px, hsl(var(--foreground)) 1px, transparent 1px, transparent 40px),
                                  repeating-linear-gradient(90deg, hsl(var(--foreground)) 0px, hsl(var(--foreground)) 1px, transparent 1px, transparent 40px)`
            }} />

            <div className="w-full max-w-sm brutal-card p-0 bg-card relative z-10">
                <div className="p-8 text-center space-y-6">
                    {/* Lock Icon */}
                    <div className="mx-auto w-16 h-16 border-3 border-foreground bg-primary flex items-center justify-center brutal-shadow-sm">
                        <Lock className="w-7 h-7 text-primary-foreground" />
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight uppercase">Tip Harmony+</h1>
                        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Enter PIN to access</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="PIN Code"
                            className="text-center text-2xl tracking-[0.5em] font-mono font-bold h-14 border-3 border-foreground bg-background focus:ring-2 focus:ring-primary rounded-none"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            autoComplete="off"
                            readOnly={isReadOnly}
                        />
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold uppercase tracking-wider border-3 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 brutal-shadow brutal-hover rounded-none"
                            disabled={pin.length < 4}
                        >
                            Unlock <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground/40 font-mono pt-2">v1.1</p>
                    </form>
                </div>
            </div>
        </div>
    );
}
