import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";
import { fetchExpenses, deleteExpense as deleteExpenseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { type ExpenseWithCategory } from "@shared/schema";
import { EditExpenseModal } from "@/components/edit-expense-modal";

export function RecentExpenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      await deleteExpenseApi(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday =
      d.toDateString() ===
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today, ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    if (isYesterday) {
      return `Yesterday, ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const filteredExpenses = expenses?.filter((expense: ExpenseWithCategory) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Recent Expenses</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of your latest transactions
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
              data-testid="input-search-expenses"
            />
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            data-testid="button-view-all-expenses"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl bg-white/50 backdrop-blur dark:bg-slate-900/60"
              />
            ))}
          </div>
        ) : !filteredExpenses || filteredExpenses.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-base font-semibold text-foreground">
              {searchQuery ? "No expenses match your search" : "No expenses found"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Add your first expense to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.slice(0, 10).map((expense: ExpenseWithCategory) => {
              const Icon = getCategoryIcon(expense.category.icon);
              return (
                <div
                  key={expense.id}
                  className="expense-card flex items-center justify-between rounded-2xl border border-white/50 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
                  data-testid={`expense-item-${expense.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${expense.category.color}1a`,
                        color: expense.category.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {expense.description}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                      style={{ color: expense.category.color }}
                    >
                      {expense.category.name}
                    </Badge>
                    <p className="text-lg font-semibold text-foreground">
                      -{formatCurrency(expense.amount)}
                    </p>
                    <div className="flex gap-1">
                      <EditExpenseModal expense={expense}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full"
                          data-testid={`button-edit-expense-${expense.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </EditExpenseModal>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                        data-testid={`button-delete-expense-${expense.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
