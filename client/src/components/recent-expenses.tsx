import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ExpenseWithCategory } from "@shared/schema";
import { EditExpenseModal } from "@/components/edit-expense-modal";

export function RecentExpenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      await apiRequest("DELETE", `/api/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
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
    } else if (isYesterday) {
      return `Yesterday, ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
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

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Expenses</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
                data-testid="input-search-expenses"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-view-all-expenses"
            >
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : !filteredExpenses || filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
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
                  className="expense-card flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-all"
                  data-testid={`expense-item-${expense.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${expense.category.color}20` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: expense.category.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
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
                    <p className="font-semibold text-foreground">
                      -{formatCurrency(expense.amount)}
                    </p>
                    <div className="flex space-x-1">
                      <EditExpenseModal expense={expense}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-8 w-8"
                          data-testid={`button-edit-expense-${expense.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </EditExpenseModal>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                        data-testid={`button-delete-expense-${expense.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
