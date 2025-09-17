import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { queryClient } from "./lib/queryClient";

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
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-foreground transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.16),_transparent_62%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.75),_transparent_70%)]" />
      <div className="pointer-events-none absolute -left-36 top-24 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/25" />
      <div className="pointer-events-none absolute right-[-18%] top-36 h-[26rem] w-[26rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/20" />
      <div className="pointer-events-none absolute left-1/2 top-[70%] h-96 w-[36rem] -translate-x-1/2 rounded-[10rem] bg-gradient-to-r from-sky-200/30 via-primary/15 to-purple-200/30 blur-3xl dark:from-sky-500/20 dark:via-primary/20 dark:to-purple-500/25" />

      <Sidebar />
      <main className="relative z-10 ml-0 flex min-h-screen flex-col px-6 pb-16 pt-5 transition-[margin] md:ml-72 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-foreground transition-colors duration-500">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="no-underline">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              DollarTrack
            </p>
            <p className="text-sm text-muted-foreground/80">
              Budget smarter. Live better.
            </p>
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          <a
            className="hidden rounded-full border border-transparent px-4 py-2 text-foreground/70 backdrop-blur transition hover:border-primary/40 hover:text-foreground md:inline"
            href="#features"
          >
            Features
          </a>
          <Link
            to="/login"
            className="rounded-full border border-primary/10 bg-white/60 px-4 py-2 text-foreground/75 shadow-sm backdrop-blur transition hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:bg-slate-900/60"
          >
            Sign in
          </Link>
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

      <div className="mx-auto w-full">
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
