import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
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
              return (
                <div
                  key={item.category.id}
                  className="flex items-center justify-between"
                  data-testid={`category-${item.category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.category.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {item.category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <button
            className="w-full rounded-full bg-white/70 py-2 text-sm font-medium text-primary backdrop-blur transition hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
            data-testid="button-view-all-categories"
          >
            View All Categories
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
