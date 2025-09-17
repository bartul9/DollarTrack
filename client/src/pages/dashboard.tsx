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
import { fetchExpensesSummary } from "@/lib/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(n) ? n : 0
  );

const changeLabel = (n) => {
  if (n === null || n === undefined)
    return "Compare with last month once you add more expenses";
  if (+n === 0) return "Spending is on par with last month";
  const d = n > 0 ? "Up" : "Down";
  return `${d} ${Math.abs(n).toFixed(1)}% vs last month`;
};

const changeTone = (n) =>
  n == null
    ? "text-muted-foreground"
    : n > 0
    ? "text-rose-500 dark:text-rose-400"
    : n < 0
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-primary";

const changeDot = (n) =>
  n == null
    ? "bg-muted-foreground/40"
    : n > 0
    ? "bg-rose-500/80 dark:bg-rose-400"
    : n < 0
    ? "bg-emerald-500/80 dark:bg-emerald-400"
    : "bg-primary/80";

export default function Dashboard() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchExpensesSummary,
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const monthlyTotal = summary ? fmt(summary.monthly) : "—";
  const monthlyChange = summary?.monthlyChange ?? null;

  return (
    <div className="relative pb-14">
      {/* page max-width & padding */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero / header */}
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white/80 via-white/55 to-white/30 backdrop-blur-xl dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30 dark:border-white/10 border-white/60 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-x-12 -top-10 h-24 rounded-full bg-white/50 blur-3xl dark:bg-white/10" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />

          <div className="relative grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-10">
            {/* Left */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 backdrop-blur dark:bg-slate-900/60 dark:border-white/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  Today’s Pulse
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 backdrop-blur text-muted-foreground dark:bg-slate-900/55 dark:border-white/10">
                  {monthlyTotal} this month
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                  Dashboard
                </h1>
                <span className="rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:bg-slate-900/55 dark:border-white/10">
                  {currentDate}
                </span>
              </div>

              <p className="max-w-xl text-sm text-muted-foreground/90">
                Track the live health of your spending, spot category momentum
                at a glance, and keep the flow aligned with your goals.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-muted-foreground backdrop-blur dark:bg-slate-900/55 dark:border-white/10">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${changeDot(
                      monthlyChange
                    )}`}
                  />
                  <span className={changeTone(monthlyChange)}>
                    {changeLabel(monthlyChange)}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-muted-foreground backdrop-blur dark:bg-slate-900/55 dark:border-white/10">
                  <span className="font-semibold text-foreground">
                    {summary ? fmt(summary.total) : "—"}
                  </span>
                  <span>spent overall</span>
                </div>
              </div>
            </div>

            {/* Right – controls align to the right column edge */}
            <div className="flex items-center justify-start gap-3 lg:justify-end">
              <ThemeToggle className="h-11 w-11 rounded-2xl border bg-white/80 text-foreground shadow-sm dark:bg-slate-900/60 dark:border-white/10" />
              <Button
                variant="outline"
                className="gap-2 rounded-full border bg-white/80 px-5 text-foreground backdrop-blur dark:bg-slate-900/60 dark:border-white/10"
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

          {/* active filters under hero edges */}
          <div className="relative border-t border-white/50 dark:border-white/10 px-6 py-4">
            <div className="mx-auto max-w-7xl">
              <ActiveExpenseFilters className="justify-start gap-2" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <StatsCards />

        {/* Chart */}
        <ExpenseChart />

        {/* Bottom grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CategoryBreakdown />
          <RecentExpenses />
        </div>
      </div>
    </div>
  );
}
