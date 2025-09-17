import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Sparkles } from "lucide-react";
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
    <div className="relative space-y-10 pb-12">
      <div className="pointer-events-none absolute inset-x-0 -top-48 h-96 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.28),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.32),_transparent_70%)]" />

      <section className="relative overflow-hidden rounded-[3rem] border border-white/50 bg-gradient-to-br from-white/85 via-white/55 to-white/25 px-8 py-10 shadow-[0_45px_120px_rgba(124,58,237,0.18)] backdrop-blur-3xl transition-colors dark:border-white/10 dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/35">
        <span className="pointer-events-none absolute inset-x-16 -top-24 h-48 rounded-full bg-white/60 blur-3xl dark:bg-white/15" />
        <span className="pointer-events-none absolute -bottom-28 -right-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl dark:bg-primary/45" />
        <span className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-500/35" />

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                  <Sparkles className="h-3.5 w-3.5" />
                  Today&apos;s Pulse
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/55">
                  {monthlyTotal} this month
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h1 className="text-4xl font-semibold text-foreground md:text-5xl">Dashboard</h1>
                  <span className="inline-flex items-center rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                    {currentDate}
                  </span>
                </div>
                <p className="max-w-xl text-sm text-muted-foreground/80">
                  Track the live health of your spending, see category momentum at a glance, and keep the financial flow aligned with your goals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-4 py-2 backdrop-blur dark:border-white/10 dark:bg-slate-900/55">
                  <span className={`h-2.5 w-2.5 rounded-full ${monthlyChangeDot}`} />
                  <span className={monthlyChangeTone}>{monthlyChangeLabel}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-2 text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/55">
                  <span className="font-semibold text-foreground">{summary ? formatCurrency(summary.total) : "—"}</span>
                  <span>spent overall</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
              <ThemeToggle className="h-12 w-12 rounded-2xl border border-white/60 bg-white/70 text-foreground shadow-lg transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/60" />
              <Button
                variant="outline"
                className="gap-2 rounded-full border-white/60 bg-white/80 px-5 text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
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

          <ActiveExpenseFilters className="justify-start gap-2" />
        </div>
      </section>

      <StatsCards />

      <ExpenseChart />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CategoryBreakdown />
        <RecentExpenses />
      </div>
    </div>
  );
}
