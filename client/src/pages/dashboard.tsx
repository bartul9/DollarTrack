import { Filter } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCards } from "@/components/stats-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { RecentExpenses } from "@/components/recent-expenses";

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/80 via-white/60 to-purple-100/50 px-8 py-10 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-indigo-900/40">
        <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-primary/30 blur-3xl dark:bg-primary/40" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-500/25" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Smart finance overview
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">Dashboard</h2>
            <p className="mt-3 text-sm text-muted-foreground" data-testid="current-date">
              Today is {currentDate}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <AddExpenseModal />
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </section>

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>

      <RecentExpenses />
    </div>
  );
}
