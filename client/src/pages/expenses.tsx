import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { getCategoryIcon } from "@/lib/categories";
import { type ExpenseWithCategory, type Category } from "@shared/schema";
import { fetchExpenses, fetchCategories } from "@/lib/api";
import { ExpenseFiltersSheet } from "@/components/expense-filters";
import { ActiveExpenseFilters } from "@/components/active-expense-filters";
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import { PageLayout } from "@/components/page-layout";
import { AnimatePresence, motion } from "framer-motion";

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { filters } = useExpenseFilters();

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

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

  return (
    <PageLayout
      eyebrow="Manage and track"
      title="All Expenses"
      description="Monitor every transaction, filter by categories, and keep your spending aligned with your goals."
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Expenses" },
      ]}
      actions={
        <>
          <Button
            variant="outline"
            className="gap-2 rounded-full border-white/60 bg-white/70 px-5 text-foreground shadow-sm backdrop-blur hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
            data-testid="button-filter-expenses"
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-muted-foreground">
              Total Expenses
            </p>
            <p className="mt-3 text-4xl font-semibold text-foreground">
              {formatCurrency(totalAmount)}
            </p>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-4 text-sm shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
              <span className="text-muted-foreground">Total Records</span>
              <span className="text-2xl font-semibold text-foreground">
                {filteredExpenses.length}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search expenses or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 text-base"
                data-testid="input-search-all-expenses"
              />
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
            <ActiveExpenseFilters className="mt-4" />
            <div className="mt-4 flex flex-wrap gap-2">
              {categories?.slice(0, 6).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-20 rounded-2xl bg-white/40 backdrop-blur dark:bg-slate-900/50"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                />
              ))}
            </motion.div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-muted bg-muted/50 text-muted-foreground">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {searchQuery ? "No expenses match your search" : "No expenses yet"}
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
              className="space-y-3"
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
                    className="expense-card flex items-center justify-between rounded-2xl border border-white/50 bg-white/75 p-5 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
                    data-testid={`expense-row-${expense.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: `${expense.category.color}1a`,
                          color: expense.category.color,
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {expense.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                        style={{ color: expense.category.color }}
                      >
                        {expense.category.name}
                      </Badge>
                      <p className="text-xl font-semibold text-foreground">
                        -{formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </motion.div>
                );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
