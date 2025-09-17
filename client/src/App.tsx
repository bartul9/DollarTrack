import { Switch, Route, Router, useRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Analytics from "@/pages/analytics";
import Categories from "@/pages/categories";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocation } from "wouter";
import { ExpenseFiltersProvider } from "@/hooks/use-expense-filters";

function LoadingScreen() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground transit
ion-colors duration-500"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),_transpare
nt_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99
,102,241,0.32),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(79,70,229,0.22),_transparent_70%)]"
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primar
y/25"
      />
      <div
        className="pointer-events-none absolute right-[-20%] bottom-1/4 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl dark
:bg-purple-500/20"
      />
      <div className="relative z-10 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/", { replace: true });
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function ProtectedApp() {
  return (
    <Router base="/app">
      <div className="relative min-h-screen overflow-x-hidden bg-transparent text-foreground transition-colors duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.16),_transparent_62%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.75),_transparent_70%)]" />
        <div className="pointer-events-none absolute -left-36 top-24 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/25" />
        <div className="pointer-events-none absolute right-[-18%] top-36 h-[26rem] w-[26rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/20" />
        <div className="pointer-events-none absolute left-1/2 top-[70%] h-96 w-[36rem] -translate-x-1/2 rounded-[10rem] bg-gradient-to-r from-sky-200/30 via-primary/15 to-purple-200/30 blur-3xl dark:from-sky-500/20 dark:via-primary/20 dark:to-purple-500/25" />

        <Sidebar />
        <main className="relative z-10 ml-0 flex min-h-screen flex-col px-6 pb-16 pt-20 transition-[margin] md:ml-72 md:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-7xl">
            <Switch>
              <Route path="/expenses" component={Expenses} />
              <Route path="/" component={Dashboard} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/categories" component={Categories} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </Router>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        <RequireAuth>
          <ProtectedApp />
        </RequireAuth>
        <Route component={NotFound} />
      </Switch>
    </Router>
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
          <ExpenseFiltersProvider>
            <AppRoutes />
          </ExpenseFiltersProvider>

          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
