import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { queryClient } from "./lib/queryClient";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Analytics from "@/pages/analytics";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ExpenseFiltersProvider } from "@/hooks/use-expense-filters";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { ArrowRight } from "lucide-react";
import { Button } from "./components/ui/button";

/* ----------------- UI ----------------- */
function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.32),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(79,70,229,0.22),_transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
      <div className="pointer-events-none absolute right-[-20%] bottom-1/4 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl dark:bg-purple-500/20" />
      <div className="relative z-10 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/* ----------------- Auth gates ----------------- */
function RequireAuth({ children }) {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (!user) return null; // brief flicker guard before redirect above
  return children;
}

/** Redirects away from /login or /register if already signed in */
function RedirectIfAuthed({ children }) {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/app", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (user) return null;
  return children;
}

/* ----------------- Layouts ----------------- */
function ProtectedLayout() {
  // Shell for /app/*
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  useScrollToTop();

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-foreground transition-colors">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(129,140,248,0.22),transparent_55%),radial-gradient(circle_at_88%_-4%,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_25%_85%,rgba(59,130,246,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,248,255,0.98))] opacity-90 dark:bg-[radial-gradient(circle_at_18%_-8%,rgba(99,102,241,0.28),transparent_60%),radial-gradient(circle_at_85%_12%,rgba(168,85,247,0.2),transparent_62%),radial-gradient(circle_at_15%_88%,rgba(45,212,191,0.12),transparent_60%),linear-gradient(180deg,rgba(10,12,28,0.94),rgba(2,6,23,0.98))]" />
        <div className="absolute -left-28 top-28 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
        <div className="absolute right-[-18%] bottom-0 h-[28rem] w-[28rem] rounded-full bg-purple-200/50 blur-3xl dark:bg-purple-500/25" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 via-transparent to-transparent dark:from-slate-900/25" />
      </div>
      <MobileNav />

      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((previous) => !previous)}
      />
      <main
        className={cn(
          "relative z-10 ml-0 flex min-h-screen flex-col px-4 pb-0 pt-0 sm:pb-24 sm:pt-24 transition-[margin] duration-200 sm:px-6 md:px-8 md:pt-28 lg:px-16 lg:pb-16 lg:pt-12",
          isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"
        )}
      >
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function PublicLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useScrollToTop();

  const linkBase =
    "rounded-full border border-primary/10 bg-white/70 px-4 py-2 text-foreground/80 shadow-sm backdrop-blur transition dark:border-white/10 dark:bg-slate-900/60";
  const linkHover = "hover:border-primary/40 hover:text-foreground";
  const linkActive =
    "border-primary/50 text-foreground font-semibold shadow-md";

  const navLink = (to: any, label: any) => (
    <Link
      to={to}
      className={[linkBase, linkHover, pathname === to ? linkActive : ""].join(
        " "
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-foreground transition-colors">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(129,140,248,0.25),transparent_55%),radial-gradient(circle_at_82%_-10%,rgba(236,72,153,0.2),transparent_60%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,247,255,0.98))] opacity-95 dark:bg-[radial-gradient(circle_at_15%_-10%,rgba(99,102,241,0.32),transparent_60%),radial-gradient(circle_at_80%_8%,rgba(168,85,247,0.24),transparent_60%),radial-gradient(circle_at_18%_80%,rgba(15,118,110,0.2),transparent_65%),linear-gradient(180deg,rgba(10,12,28,0.94),rgba(2,6,23,0.98))]" />
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-primary/18 blur-3xl dark:bg-primary/30" />
        <div className="absolute right-[-20%] bottom-10 h-[22rem] w-[22rem] rounded-full bg-purple-200/45 blur-3xl dark:bg-purple-500/25" />
      </div>
      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 items-center sm:py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center w-full justify-between sm:w-auto gap-3">
          <ThemeToggle className="h-9 w-9 shrink-0 border border-primary/10 bg-white/70 text-foreground shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/60" />
          <Link to="/" className="no-underline">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              DollarTrack
            </p>
            <p className="text-sm text-muted-foreground/80">
              Budget smarter. Live better.
            </p>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {navLink("/", "Home")}
          {navLink("/login", "Sign in")}
          <Button
            size="sm"
            className="gap-2 rounded-full shadow-lg shadow-primary/20"
            onClick={() => navigate("/register")}
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      <div className="relative z-10 mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
}
/* ----------------- Router ----------------- */
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: "login",
        element: (
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        ),
      },
      {
        path: "register",
        element: (
          <RedirectIfAuthed>
            <Register />
          </RedirectIfAuthed>
        ),
      },
    ],
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <ProtectedLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "expenses", element: <Expenses /> },
      { path: "analytics", element: <Analytics /> },
      { path: "categories", element: <Categories /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

/* ----------------- Root ----------------- */
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
            <RouterProvider router={router} />
          </ExpenseFiltersProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
