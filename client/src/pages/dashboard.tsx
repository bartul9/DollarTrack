import { useState } from "react";
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

export default function Dashboard() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative space-y-10 pb-12">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-72 bg-gradient-to-b from-primary/15 via-transparent to-transparent dark:from-primary/20" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[90%] -translate-x-1/2 rounded-[6rem] bg-gradient-to-r from-indigo-300/15 via-primary/10 to-purple-300/15 blur-3xl dark:from-indigo-500/20 dark:via-primary/15 dark:to-purple-500/20" />

      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-gradient-to-br from-white/90 via-white/60 to-white/30 px-8 py-10 shadow-2xl shadow-primary/10 backdrop-blur-3xl transition-colors dark:border-white/10 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_65%)]" />
        <div className="pointer-events-none absolute -top-28 -left-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl dark:bg-primary/40" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/25" />
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
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </section>

      <ActiveExpenseFilters />

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>

      <RecentExpenses />
    </div>
  );
}
