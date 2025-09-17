import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCards } from "@/components/stats-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { RecentExpenses } from "@/components/recent-expenses";
import { ExpenseFiltersSheet } from "@/components/expense-filters";
import { ActiveExpenseFilters } from "@/components/active-expense-filters";
import { fetchExpensesSummary, type ExpensesSummary } from "@/lib/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);

const getMonthlyChangeLabel = (change: number | null) => {
  if (change === null) {
    return "Compare with last month once you add more expenses";
  }

  if (change === 0) {
    return "Spending is on par with last month";
  }

  const direction = change > 0 ? "Up" : "Down";
  return `${direction} ${Math.abs(change).toFixed(1)}% vs last month`;
};

const getMonthlyChangeTone = (change: number | null) => {
  if (change === null) {
    return "text-muted-foreground";
  }

  if (change > 0) {
    return "text-rose-500 dark:text-rose-400";
  }

  if (change < 0) {
    return "text-emerald-500 dark:text-emerald-400";
  }

  return "text-primary";
};

const getMonthlyChangeDot = (change: number | null) => {
  if (change === null) {
    return "bg-muted-foreground/40";
  }

  if (change > 0) {
    return "bg-rose-500/80 dark:bg-rose-400";
  }

  if (change < 0) {
    return "bg-emerald-500/80 dark:bg-emerald-400";
  }

  return "bg-primary/80";
};

export default function Dashboard() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { data: summary } = useQuery<ExpensesSummary>({
    queryKey: ["analytics-summary"],
    queryFn: fetchExpensesSummary,
  });
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const monthlyTotal = summary ? formatCurrency(summary.monthly) : "—";
  const monthlyChange = summary?.monthlyChange ?? null;
  const monthlyChangeLabel = summary
    ? getMonthlyChangeLabel(monthlyChange)
    : "Monthly trend updates shortly";
  const monthlyChangeTone = summary
    ? getMonthlyChangeTone(monthlyChange)
    : "text-muted-foreground";
  const monthlyChangeDot = summary
    ? getMonthlyChangeDot(monthlyChange)
    : "bg-muted-foreground/40";

  return (
    <div className="relative space-y-8 pb-10">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-72 bg-gradient-to-b from-primary/15 via-transparent to-transparent animate-float-slow dark:from-primary/20" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[90%] -translate-x-1/2 rounded-[6rem] bg-gradient-to-r from-indigo-300/15 via-primary/10 to-purple-300/15 blur-3xl animate-float-slower dark:from-indigo-500/20 dark:via-primary/15 dark:to-purple-500/20" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_18px_38px_rgba(124,58,237,0.16)] backdrop-blur-2xl transition dark:border-white/10 dark:bg-slate-900/60">
          <span className="pointer-events-none absolute inset-x-4 -top-6 h-16 rounded-full bg-white/60 blur-2xl dark:bg-white/10" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/85 via-primary/70 to-purple-500 text-lg font-semibold text-white shadow-lg sm:h-16 sm:w-16">
              <span className="drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">◎</span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/40" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">Today&apos;s pulse</p>
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Welcome back</h1>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm dark:bg-primary/20">
                  {monthlyTotal} this month
                </span>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground/80">
                {summary
                  ? "Track the live health of your spending and keep the momentum going."
                  : "We’re preparing the latest snapshot of your spending."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
            <span className={`h-2.5 w-2.5 rounded-full ${monthlyChangeDot}`} />
            <span className={monthlyChangeTone}>{monthlyChangeLabel}</span>
          </div>
          <ThemeToggle className="h-12 w-12 rounded-2xl border-white/60 bg-white/70 text-foreground shadow-lg dark:border-white/10 dark:bg-slate-900/60" />
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-gradient-to-br from-white/90 via-white/60 to-white/30 px-8 py-8 shadow-2xl shadow-primary/10 backdrop-blur-3xl transition-colors dark:border-white/10 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_60%)] animate-shimmer-soft dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_65%)]" />
        <div className="pointer-events-none absolute -top-28 -left-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl animate-float-slow dark:bg-primary/40" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl animate-float-slower dark:bg-purple-500/25" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              Smart finance overview
            </span>
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold text-foreground md:text-5xl">Dashboard</h2>
              <p className="text-sm text-muted-foreground" data-testid="current-date">
                Today is {currentDate}
              </p>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground/80">
              Track your spending, understand where your money goes, and make confident financial decisions with a refined, data-driven overview.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-full border-white/50 bg-white/70 px-5 text-foreground shadow-sm backdrop-blur hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
              data-testid="button-filter"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <ExpenseFiltersSheet
              open={isFilterSheetOpen}
              onOpenChange={setIsFilterSheetOpen}
            />
            <AddExpenseModal />
          </div>
        </div>
      </section>

      <ActiveExpenseFilters className="justify-start gap-2" />

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>

      <RecentExpenses />
    </div>
  );
}
