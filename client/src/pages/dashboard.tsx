import { useState } from "react";
import { Filter } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { RecentExpenses } from "@/components/recent-expenses";
import { ExpenseFiltersSheet } from "@/components/expense-filters";
import { ActiveExpenseFilters } from "@/components/active-expense-filters";
import { PageLayout } from "@/components/page-layout";
import { AddExpenseFab } from "@/components/add-expense-fab";

export default function Dashboard() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageLayout
      eyebrow="Smart finance overview"
      title="Dashboard"
      description="Track your spending, understand where your money goes, and make confident financial decisions with a refined, data-driven overview."
      breadcrumbs={[{ label: "Dashboard" }]}
      actions={
        <>
          <Button
            variant="outline"
            className="w-full gap-2 rounded-full border-white/50 bg-white/70 px-5 text-foreground shadow-sm backdrop-blur hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 sm:w-auto"
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
        </>
      }
      headerContent={
        <p className="text-sm text-muted-foreground" data-testid="current-date">
          Today is {currentDate}
        </p>
      }
    >
      <ActiveExpenseFilters />

      <StatsCards />

      <div className="grid grid-cols-1">
        <ExpenseChart />
      </div>

      <RecentExpenses />

      <AddExpenseFab />
    </PageLayout>
  );
}
