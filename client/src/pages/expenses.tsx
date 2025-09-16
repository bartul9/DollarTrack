import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCategoryIcon } from "@/lib/categories";
import { type ExpenseWithCategory, type Category } from "@shared/schema";
import { fetchExpenses, fetchCategories } from "@/lib/api";

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");

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

    return expenses.filter((expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

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
    <div className="space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/85 via-white/70 to-purple-100/50 px-8 py-10 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-indigo-900/40">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-600/25" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-primary/25 blur-3xl dark:bg-primary/30" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Manage and track
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">
              All Expenses
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Monitor every transaction, filter by categories, and keep your spending aligned with your goals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              data-testid="button-filter-expenses"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <AddExpenseModal />
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="relative mt-10 grid gap-6 md:grid-cols-2">
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
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/40 backdrop-blur dark:bg-slate-900/50" />
              ))}
            </div>
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
            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const Icon = getCategoryIcon(expense.category.icon);
                return (
                  <div
                    key={expense.id}
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
