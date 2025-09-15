import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { type ExpenseWithCategory } from "@shared/schema";

export function ExpenseChart() {
  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Monthly Overview</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="default"
              data-testid="button-chart-month"
            >
              Month
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-chart-week"
            >
              Week
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-chart-year"
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-subtle">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground text-sm">
              Interactive expense chart will display here
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {!expenses || expenses.length === 0
                ? "Add expenses to see chart visualization"
                : `${expenses.length} expenses ready for visualization`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
