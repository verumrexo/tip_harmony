import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md border-3 border-foreground bg-card brutal-shadow p-8 text-center space-y-4">
        <div className="text-8xl font-black text-primary font-mono leading-none">404</div>
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h1 className="text-xl font-black text-foreground uppercase tracking-wider">Page Not Found</h1>
        </div>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
          Did you forget to add the page to the router?
        </p>
      </div>
    </div>
  );
}
