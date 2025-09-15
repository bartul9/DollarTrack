import { StatsCards } from "@/components/stats-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { RecentExpenses } from "@/components/recent-expenses";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1" data-testid="current-date">
            Today is {currentDate}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            className="flex items-center space-x-2"
            data-testid="button-filter"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <AddExpenseModal />
        </div>
      </header>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>

      {/* Recent Expenses */}
      <RecentExpenses />
    </div>
  );
}
