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
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/page-layout";
import { fetchCategoryBreakdown, fetchExpenses, fetchExpensesSummary, type ExpensesSummary } from "@/lib/api";
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
  const { data: summary, isLoading: isSummaryLoading } = useQuery<ExpensesSummary>({
    queryKey: ["expenses", "summary"],
    queryFn: fetchExpensesSummary,
  });

  const { data: expenses, isLoading: isExpensesLoading } = useQuery<
    ExpenseWithCategory[]
  >({
    queryKey: ["expenses", "list"],
    queryFn: fetchExpenses,
  });

  const { data: categoryBreakdown, isLoading: isBreakdownLoading } = useQuery<
    CategoryBreakdownItem[]
  >({
    queryKey: ["expenses", "categories"],
    queryFn: fetchCategoryBreakdown,
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
    const previous =
      monthlyTrendData[monthlyTrendData.length - 2]?.amount ?? 0;
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
        `${topCategory.category.name} accounts for ${topCategory.percentage.toFixed(
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
        `You are averaging ${formatCurrency(
          averagePerDayThisMonth
        )} per day this month.`
      );
    }

    if (weeklyExpenses > 0) {
      items.push(
        `In the last 7 days you have spent ${formatCurrency(weeklyExpenses)}.`
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

  const latestMonthlyAmount =
    monthlyTrendData[monthlyTrendData.length - 1]?.amount ?? 0;

  const previousMonthlyAmount =
    monthlyTrendData.length > 1
      ? monthlyTrendData[monthlyTrendData.length - 2]?.amount ?? 0
      : 0;

  const statsCards = [
    {
      title: "Total Spending",
      value: formatCurrency(totalExpenses),
      meta: `${totalTransactions} ${
        totalTransactions === 1 ? "transaction" : "transactions"
      } recorded`,
      icon: Wallet,
      accent: "from-rose-500/25 via-rose-400/10 to-transparent",
      iconAccent: "text-rose-500 dark:text-rose-400",
      pillValue:
        monthOverMonthChange !== null && monthOverMonthChange !== 0
          ? `${monthOverMonthChange > 0 ? "+" : ""}${monthOverMonthChange.toFixed(
              1
            )}%`
          : "N/A",
      pillTone:
        monthOverMonthChange !== null
          ? monthOverMonthChange > 0
            ? "text-rose-500 dark:text-rose-400"
            : monthOverMonthChange < 0
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-muted-foreground"
          : "text-muted-foreground",
      pillDescription:
        monthOverMonthChange !== null && monthOverMonthChange !== 0
          ? "vs last month"
          : "Tracking overall spend",
      footnote:
        latestMonthlyAmount > 0
          ? `${formatCurrency(latestMonthlyAmount)} in the latest month`
          : undefined,
    },
    {
      title: "Monthly Spend",
      value: formatCurrency(monthlyExpenses),
      meta: `Week-to-date: ${formatCurrency(weeklyExpenses)}`,
      icon: CalendarRange,
      accent: "from-sky-500/25 via-sky-400/10 to-transparent",
      iconAccent: "text-sky-500 dark:text-sky-400",
      pillValue: formatCurrency(averagePerDayThisMonth),
      pillTone: "text-sky-600 dark:text-sky-300",
      pillDescription: "Average per day this month",
      footnote:
        previousMonthlyAmount > 0
          ? `Previous month: ${formatCurrency(previousMonthlyAmount)}`
          : undefined,
    },
    {
      title: "Average Transaction",
      value: formatCurrency(averageTransaction),
      meta:
        totalTransactions > 0
          ? `Across ${totalTransactions} ${
              totalTransactions === 1 ? "record" : "records"
            }`
          : "No transactions yet",
      icon: Activity,
      accent: "from-violet-500/25 via-violet-400/10 to-transparent",
      iconAccent: "text-violet-500 dark:text-violet-400",
      pillValue: highestExpense
        ? formatCurrency(parseFloat(highestExpense.amount))
        : "N/A",
      pillTone: highestExpense
        ? "text-violet-500 dark:text-violet-300"
        : "text-muted-foreground",
      pillDescription: highestExpense
        ? "Largest purchase"
        : "No large purchases yet",
      footnote: highestExpense
        ? `For ${highestExpense.description}`
        : undefined,
    },
    {
      title: "Top Category",
      value: topCategory
        ? formatCurrency(topCategory.amount)
        : formatCurrency(0),
      meta: topCategory
        ? `Top category: ${topCategory.category.name}`
        : "No category insights yet",
      icon: PieChart,
      accent: "from-emerald-500/25 via-emerald-400/10 to-transparent",
      iconAccent: "text-emerald-500 dark:text-emerald-400",
      pillValue: topCategory ? `${topCategory.percentage.toFixed(1)}%` : "N/A",
      pillTone: topCategory
        ? "text-emerald-500 dark:text-emerald-300"
        : "text-muted-foreground",
      pillDescription: topCategory
        ? "of total spend"
        : "Track spending to compare",
      categoryColor: topCategory?.category.color,
      categoryLabel: topCategory
        ? `${topCategory.category.name} is leading`
        : undefined,
      footnote:
        totalExpenses > 0
          ? `${formatCurrency(totalExpenses)} total across categories`
          : undefined,
    },
  ];

  return (
    <PageLayout
      eyebrow="Insights overview"
      title="Analytics"
      description="Dive deeper into your spending patterns, compare periods, and uncover the habits shaping your budget."
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Analytics" },
      ]}
      headerContent={
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/75 px-5 py-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                This month
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(monthlyExpenses)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Averaging {formatCurrency(averagePerDayThisMonth)} per day
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/75 px-5 py-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Largest purchase
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {highestExpense
                  ? formatCurrency(parseFloat(highestExpense.amount))
                  : formatCurrency(0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {highestExpense ? highestExpense.description : "No high-value expenses yet"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              Updated {format(new Date(), "MMM d, yyyy 'at' h:mma")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              {totalTransactions} {totalTransactions === 1 ? "transaction" : "transactions"} tracked
            </span>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="h-40 animate-pulse rounded-[2rem] border-transparent bg-gradient-to-br from-white/80 via-white/50 to-white/30 dark:from-slate-900/70 dark:via-slate-900/45 dark:to-slate-900/30"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-transparent bg-gradient-to-br from-white/85 via-white/50 to-white/25 shadow-[0_28px_55px_rgba(14,116,144,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_32px_65px_rgba(14,116,144,0.16)] dark:from-slate-900/80 dark:via-slate-900/55 dark:to-slate-900/30",
                  "card-hover"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                    stat.accent
                  )}
                />
                <span className="pointer-events-none absolute inset-x-6 -top-6 h-24 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
                <span className="pointer-events-none absolute inset-x-8 bottom-0 h-24 rounded-full bg-white/30 blur-3xl dark:bg-white/10" />
                <CardContent className="relative z-10 space-y-6 px-6 py-6 sm:px-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-foreground">{stat.value}</p>
                      {stat.meta ? (
                        <p className="mt-2 text-xs text-muted-foreground">{stat.meta}</p>
                      ) : null}
                    </div>
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-inner shadow-primary/5 dark:border-white/10 dark:bg-slate-900/70">
                      <span
                        className={cn(
                          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-80",
                          stat.accent
                        )}
                      />
                      <Icon className={cn("relative z-10 h-6 w-6", stat.iconAccent)} />
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                      <span className={cn("font-semibold", stat.pillTone)}>{stat.pillValue}</span>
                      <span>{stat.pillDescription}</span>
                    </div>
                    {stat.footnote ? (
                      <p className="text-xs text-muted-foreground">{stat.footnote}</p>
                    ) : null}
                  </div>
                  {stat.categoryColor ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: stat.categoryColor }}
                      />
                      <span>{stat.categoryLabel}</span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.65fr,1fr]">
        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/88 via-white/60 to-white/35 shadow-[0_24px_60px_rgba(14,116,144,0.14)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
          <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
          <CardHeader className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tracking the last 6 months of expenses
                </p>
              </div>
              {monthOverMonthChange !== null ? (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur dark:border-white/10 dark:bg-slate-900/60",
                    monthOverMonthChange > 0
                      ? "text-rose-500 dark:text-rose-400"
                      : monthOverMonthChange < 0
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  <span>
                    {`${monthOverMonthChange > 0 ? "+" : ""}${Math.abs(
                      monthOverMonthChange
                    ).toFixed(1)}%`}
                  </span>
                  <span className="text-muted-foreground">vs previous month</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 h-[360px]">
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
                    <linearGradient id="fillSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${Math.round(value)}`}
                    width={80}
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

        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/88 via-white/60 to-white/35 shadow-[0_24px_60px_rgba(14,116,144,0.12)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
          <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
          <CardHeader className="relative z-10 pb-3">
            <CardTitle>Performance Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key highlights from your current activity
            </p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-5 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/75 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Month to date
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Daily average
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {formatCurrency(averagePerDayThisMonth)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Highest transaction
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {highestExpense
                  ? `${formatCurrency(parseFloat(highestExpense.amount))} - ${highestExpense.category.name}`
                  : "No transactions yet"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Active categories
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {categoryBreakdown?.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr,1fr]">
        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/88 via-white/60 to-white/35 shadow-[0_24px_60px_rgba(14,116,144,0.12)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
          <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
          <CardHeader className="relative z-10">
            <CardTitle>Spending by Weekday</CardTitle>
            <p className="text-sm text-muted-foreground">
              Identify the days you spend the most
            </p>
          </CardHeader>
          <CardContent className="relative z-10 h-[320px]">
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
                <BarChart data={weekdaySpendingData} margin={{ top: 10, left: 12, right: 24 }}>
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

        <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/88 via-white/60 to-white/35 shadow-[0_24px_60px_rgba(14,116,144,0.12)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
          <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
          <CardHeader className="relative z-10">
            <CardTitle>Category Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top spending categories this month
            </p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
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

      <Card className="relative overflow-hidden border-transparent bg-gradient-to-br from-white/88 via-white/60 to-white/35 shadow-[0_24px_60px_rgba(14,116,144,0.12)] dark:from-slate-900/85 dark:via-slate-900/55 dark:to-slate-900/30">
        <span className="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
        <CardHeader className="relative z-10">
          <CardTitle>Insights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Automatically generated tips based on your activity
          </p>
        </CardHeader>
        <CardContent className="relative z-10">
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
    </PageLayout>
  );
}
