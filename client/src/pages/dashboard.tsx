import { useState } from "react";
import { Filter } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { RecentExpenses } from "@/components/recent-expenses";
import { ExpenseFiltersSheet } from "@/components/expense-filters";
import { ActiveExpenseFilters } from "@/components/active-expense-filters";
import { PageLayout } from "@/components/page-layout";

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
      actions={
        <>
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
    </PageLayout>
  );
}
