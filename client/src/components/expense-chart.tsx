import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type ExpenseWithCategory } from "@shared/schema";
import { fetchExpenses } from "@/lib/api";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatAxisCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }

  if (value >= 100) {
    return `$${value.toFixed(0)}`;
  }

  return `$${value.toFixed(1)}`;
};

type ChartRange = "week" | "month" | "year";

type ChartPoint = {
  date: Date;
  label: string;
  tooltipLabel: string;
  value: number;
};

const ChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as ChartPoint;
  const value = payload[0].value ?? 0;

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{data.tooltipLabel}</p>
      <p className="text-muted-foreground">{formatCurrency(value)}</p>
    </div>
  );
};

export function ExpenseChart() {
  const [chartRange, setChartRange] = useState<ChartRange>("month");
  const gradientId = useMemo(
    () => `expense-gradient-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  const now = useMemo(() => new Date(), []);

  const { data: expenses, isLoading } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const parsedExpenses = useMemo(() => {
    if (!expenses) return [];

    return expenses
      .map((expense) => {
        const amount = parseFloat(expense.amount);
        const date = new Date(expense.date);
        if (Number.isNaN(amount) || Number.isNaN(date.getTime())) {
          return null;
        }

        return { amount, date };
      })
      .filter((entry): entry is { amount: number; date: Date } => entry !== null);
  }, [expenses]);

  const totalsByDay = useMemo(() => {
    const totals = new Map<string, number>();

    for (const { amount, date } of parsedExpenses) {
      const key = date.toISOString().slice(0, 10);
      totals.set(key, (totals.get(key) ?? 0) + amount);
    }

    return totals;
  }, [parsedExpenses]);

  const totalsByMonth = useMemo(() => {
    const totals = new Map<string, number>();

    for (const { amount, date } of parsedExpenses) {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      totals.set(key, (totals.get(key) ?? 0) + amount);
    }

    return totals;
  }, [parsedExpenses]);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (chartRange === "week") {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });

      return eachDayOfInterval({ start, end }).map((date) => {
        const key = date.toISOString().slice(0, 10);
        return {
          date,
          label: format(date, "EEE"),
          tooltipLabel: format(date, "EEEE, MMM d"),
          value: totalsByDay.get(key) ?? 0,
        };
      });
    }

    if (chartRange === "year") {
      const start = startOfYear(now);
      const end = endOfYear(now);

      return eachMonthOfInterval({ start, end }).map((date) => {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        return {
          date,
          label: format(date, "MMM"),
          tooltipLabel: format(date, "MMMM yyyy"),
          value: totalsByMonth.get(key) ?? 0,
        };
      });
    }

    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return eachDayOfInterval({ start, end }).map((date) => {
      const key = date.toISOString().slice(0, 10);
      return {
        date,
        label: format(date, "MMM d"),
        tooltipLabel: format(date, "EEEE, MMM d"),
        value: totalsByDay.get(key) ?? 0,
      };
    });
  }, [chartRange, now, totalsByDay, totalsByMonth]);

  const hasAnyExpenses = parsedExpenses.length > 0;
  const hasDataInRange = chartData.some((point) => point.value > 0);
  const totalForRange = useMemo(
    () => chartData.reduce((sum, point) => sum + point.value, 0),
    [chartData]
  );
  const averageValue = hasDataInRange && chartData.length > 0
    ? totalForRange / chartData.length
    : 0;

  const weekRange = useMemo(
    () => ({
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    }),
    [now]
  );

  const rangeSummary = hasAnyExpenses
    ? hasDataInRange
      ? chartRange === "week"
        ? `${formatCurrency(totalForRange)} spent ${format(
            weekRange.start,
            "MMM d"
          )} - ${format(weekRange.end, "MMM d")} ${format(
            weekRange.end,
            "yyyy"
          )}`
        : chartRange === "month"
        ? `${formatCurrency(totalForRange)} spent in ${format(
            now,
            "MMMM yyyy"
          )}`
        : `${formatCurrency(totalForRange)} spent in ${format(now, "yyyy")}`
      : `No expenses recorded in this ${chartRange}`
    : "Track expenses to see spending insights";

  const averageSummary = hasDataInRange
    ? `Avg per ${chartRange === "year" ? "month" : "day"}: ${formatCurrency(
        averageValue
      )}`
    : undefined;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <CardTitle>Spending Overview</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={chartRange === "month" ? "default" : "ghost"}
              onClick={() => setChartRange("month")}
              className="rounded-full px-4" data-testid="button-chart-month"
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={chartRange === "week" ? "default" : "ghost"}
              onClick={() => setChartRange("week")}
              className="rounded-full px-4" data-testid="button-chart-week"
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={chartRange === "year" ? "default" : "ghost"}
              onClick={() => setChartRange("year")}
              className="rounded-full px-4" data-testid="button-chart-year"
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 animate-pulse" />
        ) : !hasAnyExpenses ? (
          <div className="h-80 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-muted-foreground font-medium">No expenses yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first expense to unlock spending insights.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <span>{rangeSummary}</span>
              {averageSummary ? <span>{averageSummary}</span> : null}
            </div>
            <div className="relative h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="label"
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="currentColor"
                    tickFormatter={formatAxisCurrency}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    width={72}
                    domain={[0, (dataMax: number) => (dataMax <= 0 ? 10 : Math.ceil(dataMax * 1.2))]}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "4 4" }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 4 }}
                    animationDuration={400}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {!hasDataInRange ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-md border border-dashed border-muted-foreground/40 bg-background/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                    No expenses recorded in this {chartRange}. Try another range.
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
