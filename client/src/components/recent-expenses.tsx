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
import { EditExpenseModal } from "@/components/edit-expense-modal";
import { useExpenseFilters } from "@/hooks/use-expense-filters";

const money = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    parseFloat(v || 0)
  );

function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday =
    d.toDateString() === new Date(now.getTime() - 86400000).toDateString();

  if (isToday)
    return `Today, ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  if (isYesterday)
    return `Yesterday, ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function RecentExpenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { filters } = useExpenseFilters();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const del = useMutation({
    mutationFn: async (id) => deleteExpenseApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-categories"] });
      toast({ title: "Success", description: "Expense deleted successfully" });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      }),
  });

  const filtered = useMemo(() => {
    if (!expenses) return [];
    let res = expenses;

    if (filters.categories.length) {
      res = res.filter((e) => filters.categories.includes(e.categoryId));
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      const from = filters.dateRange?.from
        ? new Date(filters.dateRange.from)
        : null;
      const to = filters.dateRange?.to ? new Date(filters.dateRange.to) : null;
      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);
      res = res.filter((e) => {
        const d = new Date(e.date);
        if (Number.isNaN(d)) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.name.toLowerCase().includes(q)
      );
    }

    return res;
  }, [expenses, filters, searchQuery]);

  return (
    <Card className="relative flex h-full flex-col overflow-hidden border bg-gradient-to-br from-white/90 via-white/60 to-white/30 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30 dark:border-white/10">
      <CardHeader className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="leading-tight">Recent Expenses</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of your latest transactions
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border bg-white/80 pl-11 pr-4 text-sm backdrop-blur dark:bg-slate-900/60 dark:border-white/10"
              data-testid="input-search-expenses"
            />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full border bg-white/75 px-4 text-xs font-semibold backdrop-blur dark:bg-slate-900/60 dark:border-white/10"
            data-testid="button-view-all-expenses"
          >
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex-1 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl bg-white/60 dark:bg-slate-900/50"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-base font-semibold">No expenses found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Add your first expense to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, 10).map((e) => {
              const Icon = getCategoryIcon(e.category.icon);
              return (
                <div
                  key={e.id}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border bg-white/80 p-4 backdrop-blur transition hover:-translate-y-0.5 dark:bg-slate-900/60 dark:border-white/10"
                  data-testid={`expense-item-${e.id}`}
                >
                  {/* icon */}
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${e.category.color}1a`,
                      color: e.category.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* main */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="truncate text-[15px] font-semibold">
                        {e.description}
                      </p>
                      <Badge
                        variant="secondary"
                        className="rounded-full border bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground dark:bg-slate-900/55 dark:border-white/10"
                        style={{ color: e.category.color }}
                      >
                        {e.category.name}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {formatDate(e.date)}
                    </p>
                  </div>

                  {/* amount + actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className="text-lg font-semibold">
                        -{money(e.amount)}
                      </p>
                    </div>
                    <EditExpenseModal expense={e}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                        data-testid={`button-edit-expense-${e.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </EditExpenseModal>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this expense?")) del.mutate(e.id);
                      }}
                      disabled={del.isPending}
                      data-testid={`button-delete-expense-${e.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
