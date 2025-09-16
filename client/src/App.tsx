import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/analytics" component={Analytics} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-purple-100 text-foreground transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl dark:bg-primary/30" />
              <div className="absolute top-1/2 -left-32 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-500/20" />
            </div>
            <Sidebar />
            <main className="relative ml-0 flex min-h-screen flex-col px-6 pb-16 pt-16 transition-[margin] md:ml-[19rem] md:px-12">
              <div className="mx-auto w-full max-w-6xl">
                <Router />
              </div>
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
