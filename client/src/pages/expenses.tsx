import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Search, Plus, Filter } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";
import { type ExpenseWithCategory, type Category } from "@shared/schema";

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const filteredExpenses = expenses?.filter((expense: ExpenseWithCategory) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = filteredExpenses?.reduce(
    (sum: number, expense: ExpenseWithCategory) => sum + parseFloat(expense.amount),
    0
  ) || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">All Expenses</h2>
          <p className="text-muted-foreground mt-1">
            Manage and track your expenses
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            className="flex items-center space-x-2"
            data-testid="button-filter-expenses"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          <AddExpenseModal />
        </div>
      </header>

      {/* Summary Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Expenses
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(totalAmount.toString())}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium">
                Total Records
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {filteredExpenses?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search expenses or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-all-expenses"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : !filteredExpenses || filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">
                {searchQuery ? "No expenses match your search" : "No expenses yet"}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start tracking your expenses by adding your first expense"}
              </p>
              <AddExpenseModal>
                <Button>Add Your First Expense</Button>
              </AddExpenseModal>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense: ExpenseWithCategory) => {
                const Icon = getCategoryIcon(expense.category.icon);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-all"
                    data-testid={`expense-row-${expense.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${expense.category.color}20` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: expense.category.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-lg">
                          {expense.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${expense.category.color}20`,
                          color: expense.category.color,
                        }}
                      >
                        {expense.category.name}
                      </Badge>
                      <p className="font-bold text-foreground text-xl">
                        -{formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
