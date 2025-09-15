import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryIcon } from "@/lib/categories";

export function CategoryBreakdown() {
  const { data: breakdown, isLoading } = useQuery({
    queryKey: ["/api/analytics/categories"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
                <div className="h-12 bg-muted rounded"></div>
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
          <div className="text-center py-8">
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
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    ></div>
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

        <div className="mt-6 pt-4 border-t border-border">
          <button
            className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            data-testid="button-view-all-categories"
          >
            View All Categories
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
