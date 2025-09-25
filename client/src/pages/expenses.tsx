import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { getCategoryIcon } from "@/lib/categories";
import { type ExpenseWithCategory, type Category } from "@shared/schema";
import {
  fetchExpenses,
  fetchCategories,
  deleteExpense as deleteExpenseApi,
} from "@/lib/api";
import { ExpenseFiltersSheet } from "@/components/expense-filters";
import { ActiveExpenseFilters } from "@/components/active-expense-filters";
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import { PageLayout } from "@/components/page-layout";
import { AnimatePresence, motion } from "framer-motion";
import { EditExpenseModal } from "@/components/edit-expense-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { filters } = useExpenseFilters();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [expenseToDelete, setExpenseToDelete] =
    useState<ExpenseWithCategory | null>(null);

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

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(typeof amount === "number" ? amount : parseFloat(amount));
  };

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      await deleteExpenseApi(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      setExpenseToDelete(null);
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

  const DeleteCategoryIcon = expenseToDelete
    ? getCategoryIcon(expenseToDelete.category.icon)
    : null;

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    deleteExpenseMutation.mutate(expenseToDelete.id);
  };

  return (
    <>
      <ExpenseFiltersSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
      />
      <PageLayout
        eyebrow="Manage and track"
        title="All Expenses"
        description="Monitor every transaction, filter by categories, and keep your spending aligned with your goals."
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2 rounded-full border-white/60 bg-white/80 px-4 text-sm font-semibold backdrop-blur transition hover:border-primary/40 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <AddExpenseModal>
              <Button className="gap-2 rounded-full border border-primary/10 bg-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </AddExpenseModal>
          </>
        }
        headerContent={
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Total card */}
          <div className="rounded-2xl border border-white/60 bg-white/75 p-4 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Total Expenses
            </p>
            <p className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
              {formatCurrency(totalAmount)}
            </p>
            <div className="mt-4 sm:mt-6 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3 sm:p-4 text-sm shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <span className="text-muted-foreground">Total Records</span>
              <span className="text-xl sm:text-2xl font-semibold text-foreground tabular-nums">
                {filteredExpenses.length}
              </span>
            </div>
          </div>

          {/* Search card */}
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search expenses or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 h-11 text-sm sm:text-base"
                data-testid="input-search-all-expenses"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <ActiveExpenseFilters className="mt-3 sm:mt-4" />
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              {categories?.slice(0, 6).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="rounded-full border border-white/40 bg-white/70 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        }
      >
      <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/90 via-white/55 to-white/35 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:from-slate-950/85 dark:via-slate-900/55 dark:to-slate-900/35">
        <span className="pointer-events-none absolute inset-x-10 -top-14 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
        <span className="pointer-events-none absolute inset-x-12 bottom-0 h-32 rounded-full bg-white/25 blur-3xl dark:bg-white/10" />
        <CardHeader className="relative z-10 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Expenses</CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 px-2 sm:px-6">
          {isLoading ? (
            <motion.div
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-16 sm:h-20 rounded-2xl bg-white/40 backdrop-blur dark:bg-slate-900/50"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                />
              ))}
            </motion.div>
          ) : filteredExpenses.length === 0 ? (
            // empty state unchanged
            <div className="flex flex-col items-center justify-center space-y-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-muted bg-muted/50 text-muted-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  {searchQuery
                    ? "No expenses match your search"
                    : "No expenses yet"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start tracking your expenses by adding your first expense"}
                </p>
              </div>
              <AddExpenseModal>
                <Button size="lg">Add your first expense</Button>
              </AddExpenseModal>
            </div>
          ) : (
            <motion.div
              className="space-y-2.5 sm:space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              <AnimatePresence initial={false}>
                {filteredExpenses.map((expense) => {
                  const Icon = getCategoryIcon(expense.category.icon);
                  return (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 18 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="expense-card group flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/50 bg-white/75 p-4 sm:p-5 shadow-md backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-900/60"
                      data-testid={`expense-row-${expense.id}`}
                    >
                      {/* Left: icon + text */}
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div
                          className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shrink-0"
                          style={{
                            backgroundColor: `${expense.category.color}1a`,
                            color: expense.category.color,
                          }}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm sm:text-lg font-medium text-foreground leading-snug line-clamp-2">
                            {expense.description}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatDate(expense.date)}
                          </p>
                        </div>
                      </div>

                      {/* Right: amount + actions */}
                      <div className="ml-auto flex items-center gap-3 sm:gap-4">
                        <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
                          <Badge
                            variant="secondary"
                            className="rounded-full border border-white/50 bg-white/70 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                            style={{ color: expense.category.color }}
                          >
                            {expense.category.name}
                          </Badge>
                          <p className="text-lg sm:text-xl font-semibold text-foreground tabular-nums tracking-tight">
                            -{formatCurrency(expense.amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <EditExpenseModal expense={expense}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-full border border-white/60 bg-white/70 text-muted-foreground shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-primary hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
                              data-testid={`button-edit-expense-${expense.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </EditExpenseModal>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setExpenseToDelete(expense)}
                            disabled={deleteExpenseMutation.isPending}
                            className="h-9 w-9 rounded-full border border-white/60 bg-white/70 text-muted-foreground shadow-sm backdrop-blur transition hover:border-destructive/40 hover:text-destructive hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
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
        <Modal
          open={Boolean(expenseToDelete)}
          onOpenChange={(open) => {
            if (!open && !deleteExpenseMutation.isPending) {
              setExpenseToDelete(null);
            }
          }}
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete expense</ModalTitle>
              <ModalDescription>
                {expenseToDelete
                  ? `Are you sure you want to remove "${expenseToDelete.description}"?`
                  : "Are you sure you want to delete this expense?"}
              </ModalDescription>
            </ModalHeader>

            {expenseToDelete ? (
              <div className="rounded-2xl border border-white/50 bg-white/75 p-5 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${expenseToDelete.category.color}1a`,
                        color: expenseToDelete.category.color,
                      }}
                    >
                      {DeleteCategoryIcon ? (
                        <DeleteCategoryIcon className="h-5 w-5" />
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">
                        {expenseToDelete.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expenseToDelete.date)}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-destructive">
                    -{formatCurrency(expenseToDelete.amount)}
                  </p>
                </div>
              </div>
            ) : null}

            <ModalFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  if (deleteExpenseMutation.isPending) return;
                  setExpenseToDelete(null);
                }}
                disabled={deleteExpenseMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleteExpenseMutation.isPending}
                variant="destructive"
                className="rounded-full px-6 shadow-lg shadow-destructive/30"
              >
                {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Card>
    </PageLayout>
    </>
  );
}
