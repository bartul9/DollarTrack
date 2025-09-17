import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  differenceInCalendarDays,
} from "date-fns";
import {
  TrendingDown,
  Wallet,
  PieChart,
  CalendarRange,
  Activity,
} from "lucide-react";
import { type ExpenseWithCategory } from "@shared/schema";

type CategoryBreakdownItem = {
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  amount: number;
  percentage: number;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export default function Analytics() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery<{
    total: number;
    monthly: number;
    weekly: number;
  }>({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: expenses, isLoading: isExpensesLoading } = useQuery<
    ExpenseWithCategory[]
  >({
    queryKey: ["/api/expenses"],
  });

  const { data: categoryBreakdown, isLoading: isBreakdownLoading } = useQuery<
    CategoryBreakdownItem[]
  >({
    queryKey: ["/api/analytics/categories"],
  });

  const isLoading = isSummaryLoading || isExpensesLoading || isBreakdownLoading;

  const totalExpenses = summary?.total ?? 0;
  const monthlyExpenses = summary?.monthly ?? 0;
  const weeklyExpenses = summary?.weekly ?? 0;
  const totalTransactions = expenses?.length ?? 0;

  const averageTransaction = useMemo(() => {
    if (!expenses || expenses.length === 0) return 0;
    return totalExpenses / expenses.length;
  }, [expenses, totalExpenses]);

  const highestExpense = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;
    return expenses.reduce((max, expense) =>
      parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
    );
  }, [expenses]);

  const topCategory = categoryBreakdown?.[0] ?? null;

  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) =>
      subMonths(now, 5 - index)
    );

    return months.map((monthDate) => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const totalForMonth =
        expenses
          ?.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= start && expenseDate <= end;
          })
          .reduce((sum, expense) => sum + parseFloat(expense.amount), 0) ?? 0;

      return {
        month: format(monthDate, "MMM"),
        amount: Number(totalForMonth.toFixed(2)),
      };
    });
  }, [expenses]);

  const monthOverMonthChange = useMemo(() => {
    if (monthlyTrendData.length < 2) return null;
    const latest = monthlyTrendData[monthlyTrendData.length - 1]?.amount ?? 0;
    const previous = monthlyTrendData[monthlyTrendData.length - 2]?.amount ?? 0;
    if (previous === 0) return latest === 0 ? 0 : null;
    return ((latest - previous) / previous) * 100;
  }, [monthlyTrendData]);

  const weekdaySpendingData = useMemo(() => {
    return weekdayLabels.map((label, index) => {
      const totalForDay =
        expenses
          ?.filter((expense) => new Date(expense.date).getDay() === index)
          .reduce((sum, expense) => sum + parseFloat(expense.amount), 0) ?? 0;

      return {
        day: label,
        amount: Number(totalForDay.toFixed(2)),
      };
    });
  }, [expenses]);

  const daysElapsedThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    return differenceInCalendarDays(new Date(), start) + 1;
  }, []);

  const averagePerDayThisMonth = useMemo(() => {
    if (!monthlyExpenses) return 0;
    return monthlyExpenses / Math.max(daysElapsedThisMonth, 1);
  }, [monthlyExpenses, daysElapsedThisMonth]);

  const insights = useMemo(() => {
    const items: string[] = [];

    if (topCategory && topCategory.amount > 0) {
      items.push(
        `${
          topCategory.category.name
        } accounts for ${topCategory.percentage.toFixed(
          1
        )}% of your total spending.`
      );
    }

    if (highestExpense) {
      items.push(
        `Your largest purchase was ${formatCurrency(
          parseFloat(highestExpense.amount)
        )} for ${highestExpense.description}.`
      );
    }

    if (monthOverMonthChange !== null) {
      const changeValue = Math.abs(monthOverMonthChange).toFixed(1);
      if (monthOverMonthChange > 0) {
        items.push(`Spending is up ${changeValue}% compared to last month.`);
      } else if (monthOverMonthChange < 0) {
        items.push(`Spending is down ${changeValue}% compared to last month.`);
      } else {
        items.push("Spending is in line with last month.");
      }
    }

    if (monthlyExpenses > 0) {
      items.push(
        `You're averaging ${formatCurrency(
          averagePerDayThisMonth
        )} per day this month.`
      );
    }

    if (weeklyExpenses > 0) {
      items.push(
        `In the last 7 days you've spent ${formatCurrency(weeklyExpenses)}.`
      );
    }

    if (items.length === 0) {
      items.push("Add expenses to generate personalized insights.");
    }

    return items;
  }, [
    topCategory,
    highestExpense,
    monthOverMonthChange,
    monthlyExpenses,
    averagePerDayThisMonth,
    weeklyExpenses,
  ]);

  const statsCards = [
    {
      title: "Total Spending",
      value: formatCurrency(totalExpenses),
      subtext: `${totalTransactions} ${
        totalTransactions === 1 ? "transaction" : "transactions"
      } recorded`,
      icon: Wallet,
      trend:
        monthOverMonthChange !== null && monthOverMonthChange !== 0
          ? `${
              monthOverMonthChange > 0 ? "+" : ""
            }${monthOverMonthChange.toFixed(1)}% vs last month`
          : "Tracking overall spend",
      trendColor:
        monthOverMonthChange !== null
          ? monthOverMonthChange > 0
            ? "text-red-600"
            : monthOverMonthChange < 0
            ? "text-emerald-600"
            : "text-muted-foreground"
          : "text-muted-foreground",
    },
    {
      title: "Monthly Spend",
      value: formatCurrency(monthlyExpenses),
      subtext: `Week-to-date: ${formatCurrency(weeklyExpenses)}`,
      icon: CalendarRange,
      trend: "Current month performance",
      trendColor: "text-muted-foreground",
    },
    {
      title: "Average Transaction",
      value: formatCurrency(averageTransaction),
      subtext:
        totalTransactions > 0
          ? `Across ${totalTransactions} records`
          : "No transactions yet",
      icon: Activity,
      trend:
        totalTransactions > 0 ? "Healthy spending cadence" : "Waiting for data",
      trendColor: "text-muted-foreground",
    },
    {
      title: "Top Category",
      value: topCategory
        ? formatCurrency(topCategory.amount)
        : formatCurrency(0),
      subtext: topCategory
        ? `${topCategory.category.name} · ${topCategory.percentage.toFixed(1)}%`
        : "No category insights yet",
      icon: PieChart,
      trend: topCategory ? "Leading category" : "Track spending to compare",
      trendColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Dive deeper into your spending patterns and identify opportunities
            to save.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Updated {format(new Date(), "MMM d, yyyy 'at' h:mma")}
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.subtext}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className={`mt-4 text-sm font-medium ${stat.trendColor}`}>
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tracking the last 6 months of expenses
                </p>
              </div>
              {monthOverMonthChange !== null && (
                <div
                  className={`text-sm font-medium ${
                    monthOverMonthChange > 0
                      ? "text-red-600"
                      : monthOverMonthChange < 0
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {monthOverMonthChange > 0 && "↑"}
                  {monthOverMonthChange < 0 && "↓"}
                  {monthOverMonthChange === 0 && "→"}{" "}
                  {monthOverMonthChange
                    ? Math.abs(monthOverMonthChange).toFixed(1)
                    : 0}
                  % vs previous month
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-[360px]">
            {expenses && expenses.length > 0 ? (
              <ChartContainer
                config={{
                  amount: {
                    label: "Spending",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-full"
              >
                <AreaChart
                  data={monthlyTrendData}
                  margin={{ top: 20, right: 24, left: 12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillSpending"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${Math.round(value)}`}
                    width={80}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: "4 4" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `${label} spending`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    fill="url(#fillSpending)"
                    strokeWidth={2}
                    name="Spending"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Add expenses to visualize your spending trend.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key highlights from your current activity
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Month to date</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Daily average this month
              </p>
              <p className="text-lg font-medium text-foreground">
                {formatCurrency(averagePerDayThisMonth)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Highest transaction
              </p>
              <p className="text-lg font-medium text-foreground">
                {highestExpense
                  ? `${formatCurrency(parseFloat(highestExpense.amount))} · ${
                      highestExpense.category.name
                    }`
                  : "No transactions yet"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active categories tracked
              </p>
              <p className="text-lg font-medium text-foreground">
                {categoryBreakdown?.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Weekday</CardTitle>
            <p className="text-sm text-muted-foreground">
              Identify the days you spend the most
            </p>
          </CardHeader>
          <CardContent className="h-[320px]">
            {expenses && expenses.length > 0 ? (
              <ChartContainer
                config={{
                  amount: {
                    label: "Spending",
                    color: "hsl(var(--chart-2, var(--primary)))",
                  },
                }}
                className="h-full"
              >
                <BarChart
                  data={weekdaySpendingData}
                  margin={{ top: 10, left: 12, right: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickFormatter={(value) => `$${Math.round(value)}`}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `${label} spending`}
                        indicator="dot"
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    name="Spending"
                    fill="var(--color-amount)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Add expenses to compare weekdays.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top spending categories this month
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              categoryBreakdown.slice(0, 5).map((item) => (
                <div key={item.category.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="font-medium text-foreground">
                        {item.category.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(item.amount)} spent
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Add expenses to see category distribution.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Automatically generated tips based on your activity
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
