import { useState, useEffect } from "react";
import { Lock, Unlock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PIN_CODE = "2519";
const SESSION_KEY = "tip_harmony_unlocked";

export function PinLock({ children }: { children: React.ReactNode }) {
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        // Hack to prevent iOS auto-zoom/focus on load
        const timer = setTimeout(() => setIsReadOnly(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // ... existing useEffect ...

    // ... inside return ...
    <Input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="PIN Code"
        className="text-center text-lg tracking-widest"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        autoComplete="off"
        readOnly={isReadOnly}
    />
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Tip Harmony</CardTitle>
                <CardDescription>Enter PIN to access application</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="PIN Code"
                            className="text-center text-lg tracking-widest"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={pin.length < 4}>
                        Unlock <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground/30 font-mono pt-4">v1.1</p>
                </form>
            </CardContent>
        </Card>
    </div>
);
}
