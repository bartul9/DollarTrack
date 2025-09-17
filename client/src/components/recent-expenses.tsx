import { useMemo, useState } from "react";
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
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import { AnimatePresence, motion } from "framer-motion";

export function RecentExpenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { filters } = useExpenseFilters();

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

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let result = expenses;

    if (filters.categories.length > 0) {
      result = result.filter((expense) =>
        filters.categories.includes(expense.categoryId)
      );
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      const fromDate = filters.dateRange?.from
        ? new Date(filters.dateRange.from)
        : undefined;
      const toDate = filters.dateRange?.to
        ? new Date(filters.dateRange.to)
        : undefined;

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      result = result.filter((expense) => {
        const expenseDate = new Date(expense.date);
        if (Number.isNaN(expenseDate.getTime())) return false;
        if (fromDate && expenseDate < fromDate) {
          return false;
        }
        if (toDate && expenseDate > toDate) {
          return false;
        }
        return true;
      });
    }

    if (searchQuery.trim().length > 0) {
      const searchTerm = searchQuery.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchTerm) ||
          expense.category.name.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [expenses, filters, searchQuery]);

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  return (
    <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/90 via-white/55 to-white/30 shadow-[0_28px_60px_rgba(15,23,42,0.08)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
      <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
      <span className="pointer-events-none absolute inset-x-12 bottom-0 h-32 rounded-full bg-white/30 blur-3xl dark:bg-white/10" />
      <CardHeader className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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
              className="rounded-full border border-white/60 bg-white/80 pl-11 pr-4 text-sm shadow-sm backdrop-blur transition focus-visible:ring-1 dark:border-white/10 dark:bg-slate-900/60"
              data-testid="input-search-expenses"
            />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full border border-white/60 bg-white/75 px-4 text-xs font-semibold text-foreground backdrop-blur transition hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
            data-testid="button-view-all-expenses"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {isLoading ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl bg-gradient-to-r from-white/60 via-white/35 to-white/55 backdrop-blur dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/50"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        ) : filteredExpenses.length === 0 ? (
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
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.06 },
              },
            }}
          >
            <AnimatePresence initial={false}>
              {filteredExpenses.slice(0, 10).map((expense: ExpenseWithCategory) => {
              const Icon = getCategoryIcon(expense.category.icon);
              return (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="expense-card flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
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
                    <div className="space-y-1">
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
                      className="rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                      style={{ color: expense.category.color }}
                    >
                      {expense.category.name}
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        -{formatCurrency(expense.amount)}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        {expense.category.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <EditExpenseModal expense={expense}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full border border-transparent text-muted-foreground hover:border-white/60 hover:text-foreground dark:hover:border-white/20"
                          data-testid={`button-edit-expense-${expense.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </EditExpenseModal>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full border border-transparent text-muted-foreground transition hover:border-white/60 hover:text-destructive dark:hover:border-white/20"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                        data-testid={`button-delete-expense-${expense.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
