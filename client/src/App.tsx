import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PinLock } from "@/components/PinLock";
import Home from "@/pages/Home";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PinLock>
          <WouterRouter base={import.meta.env.BASE_URL}>
            <AppRouter />
          </WouterRouter>
        </PinLock>
        {/* Outside the lock, so "Incorrect PIN code" can show too */}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
