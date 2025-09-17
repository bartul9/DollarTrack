import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/categories";
import { type Category } from "@shared/schema";
import { fetchCategoryBreakdown } from "@/lib/api";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function CategoryBreakdown() {
  const { data: breakdown, isLoading } = useQuery<
    Array<{ category: Category; amount: number; percentage: number }>
  >({
    queryKey: ["analytics-categories"],
    queryFn: fetchCategoryBreakdown,
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-transparent bg-gradient-to-br from-white/85 via-white/55 to-white/35 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:from-slate-900/80 dark:via-slate-900/55 dark:to-slate-900/30">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-2xl bg-gradient-to-r from-white/60 via-white/30 to-white/50 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative flex h-full flex-col overflow-hidden border-transparent bg-gradient-to-br from-white/85 via-white/55 to-white/30 shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:from-slate-900/80 dark:via-slate-900/55 dark:to-slate-900/30">
      <span className="pointer-events-none absolute inset-x-10 -top-12 h-40 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
      <span className="pointer-events-none absolute inset-x-16 bottom-0 h-32 rounded-full bg-white/30 blur-3xl dark:bg-white/10" />
      <CardHeader className="relative z-10">
        <CardTitle>Category Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your spending is concentrated this period
        </p>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-1 flex-col space-y-6">
        {!breakdown || breakdown.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No expenses found</p>
            <p className="text-sm text-muted-foreground">
              Add your first expense to see category breakdown
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {breakdown.slice(0, 5).map((item) => {
              const Icon = getCategoryIcon(item.category.icon);
              const progressWidth = Math.min(100, Math.max(0, item.percentage));
              return (
                <div
                  key={item.category.id}
                  className="group rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
                  data-testid={`category-${item.category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${item.category.color}20`,
                            color: item.category.color,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.category.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {item.percentage.toFixed(1)}% of spend
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted/60">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${progressWidth}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4 md:mt-auto">
          <Link href="/categories">
            <a
              className="block w-full rounded-full bg-white/70 py-2 text-center text-sm font-medium text-primary backdrop-blur transition hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
              data-testid="button-view-all-categories"
            >
              View All Categories
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
