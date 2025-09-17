// src/pages/analytics.jsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import {
  fetchCategoryBreakdown,
  fetchExpenses,
  fetchExpensesSummary,
} from "@/lib/api";

// ---- helpers ----------------------------------------------------------------

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

// ---- page -------------------------------------------------------------------

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["expenses", "summary"],
    queryFn: fetchExpensesSummary,
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses", "list"],
    queryFn: fetchExpenses,
  });

  const { data: categoryBreakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: fetchCategoryBreakdown,
  });

  const isLoading = loadingSummary || loadingExpenses || loadingBreakdown;

  const totalExpenses = summary?.total ?? 0;
  const monthlyExpenses = summary?.monthly ?? 0;
  const weeklyExpenses = summary?.weekly ?? 0;
  const totalTransactions = expenses?.length ?? 0;

  // highest expense
  const highestExpense = useMemo(() => {
    if (!expenses?.length) return null;
    return expenses.reduce((max, e) =>
      parseFloat(e.amount) > parseFloat(max.amount) ? e : max
    );
  }, [expenses]);

  const averageTransaction = useMemo(() => {
    if (!expenses?.length) return 0;
    return totalExpenses / expenses.length;
  }, [expenses, totalExpenses]);

  // top category (ensure sorted)
  const topCategory = useMemo(() => {
    if (!categoryBreakdown?.length) return null;
    const sorted = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
    return sorted[0];
  }, [categoryBreakdown]);

  // last 6 months trend (for MoM calc)
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

    return months.map((monthDate) => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const totalForMonth =
        expenses
          ?.filter((exp) => {
            const d = new Date(exp.date);
            return d >= start && d <= end;
          })
          .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) ?? 0;

      return {
        month: format(monthDate, "MMM"),
        amount: Number(totalForMonth.toFixed(2)),
      };
    });
  }, [expenses]);

  const monthOverMonthChange = useMemo(() => {
    if (monthlyTrendData.length < 2) return null;
    const latest = monthlyTrendData.at(-1)?.amount ?? 0;
    const prev = monthlyTrendData.at(-2)?.amount ?? 0;
    if (prev === 0) return latest === 0 ? 0 : null; // avoid div by 0
    return ((latest - prev) / prev) * 100;
  }, [monthlyTrendData]);

  // weekday spending bars
  const weekdaySpendingData = useMemo(() => {
    return weekdayLabels.map((label, idx) => {
      const total =
        expenses
          ?.filter((e) => new Date(e.date).getDay() === idx)
          .reduce((s, e) => s + parseFloat(e.amount || 0), 0) ?? 0;

      return { day: label, amount: Number(total.toFixed(2)) };
    });
  }, [expenses]);

  // month progress
  const daysElapsedThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    return differenceInCalendarDays(new Date(), start) + 1;
  }, []);

  const avgPerDayThisMonth = useMemo(() => {
    if (!monthlyExpenses) return 0;
    return monthlyExpenses / Math.max(daysElapsedThisMonth, 1);
  }, [monthlyExpenses, daysElapsedThisMonth]);

  // textual insights
  const insights = useMemo(() => {
    const out = [];

    if (topCategory && topCategory.amount > 0) {
      out.push(
        `${
          topCategory.category.name
        } accounts for ${topCategory.percentage.toFixed(
          1
        )}% of your total spending.`
      );
    }

    if (highestExpense) {
      const n = fmtMoney(parseFloat(highestExpense.amount));
      const d = highestExpense.description || "an item";
      out.push(`Your largest purchase was ${n} for ${d}.`);
    }

    if (monthOverMonthChange !== null) {
      const delta = Math.abs(monthOverMonthChange).toFixed(1);
      if (monthOverMonthChange > 0)
        out.push(`Spending is up ${delta}% vs last month.`);
      else if (monthOverMonthChange < 0)
        out.push(`Spending is down ${delta}% vs last month.`);
      else out.push("Spending is in line with last month.");
    }

    if (monthlyExpenses > 0) {
      out.push(
        `You are averaging ${fmtMoney(avgPerDayThisMonth)} per day this month.`
      );
    }

    if (weeklyExpenses > 0) {
      out.push(`Last 7 days total: ${fmtMoney(weeklyExpenses)}.`);
    }

    if (out.length === 0)
      out.push("Add expenses to generate personalized insights.");
    return out;
  }, [
    topCategory,
    highestExpense,
    monthOverMonthChange,
    monthlyExpenses,
    avgPerDayThisMonth,
    weeklyExpenses,
  ]);

  const latestMonthlyAmount = monthlyTrendData.at(-1)?.amount ?? 0;
  const previousMonthlyAmount =
    monthlyTrendData.length > 1 ? monthlyTrendData.at(-2)?.amount ?? 0 : 0;

  // ---- stat cards config -----------------------------------------------------

  const statsCards = [
    {
      title: "Total Spending",
      value: fmtMoney(totalExpenses),
      meta: `${totalTransactions} ${
        totalTransactions === 1 ? "transaction" : "transactions"
      } recorded`,
      icon: Wallet,
      accent: "from-rose-500/25 via-rose-400/10 to-transparent",
      iconAccent: "text-rose-500 dark:text-rose-400",
      pillValue:
        monthOverMonthChange !== null && monthOverMonthChange !== 0
          ? `${
              monthOverMonthChange > 0 ? "+" : ""
            }${monthOverMonthChange.toFixed(1)}%`
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
          ? `${fmtMoney(latestMonthlyAmount)} in the latest month`
          : undefined,
    },
    {
      title: "Monthly Spend",
      value: fmtMoney(monthlyExpenses),
      meta: `Week-to-date: ${fmtMoney(weeklyExpenses)}`,
      icon: CalendarRange,
      accent: "from-sky-500/25 via-sky-400/10 to-transparent",
      iconAccent: "text-sky-500 dark:text-sky-400",
      pillValue: fmtMoney(avgPerDayThisMonth),
      pillTone: "text-sky-600 dark:text-sky-300",
      pillDescription: "Average per day this month",
      footnote:
        previousMonthlyAmount > 0
          ? `Previous month: ${fmtMoney(previousMonthlyAmount)}`
          : undefined,
    },
    {
      title: "Average Transaction",
      value: fmtMoney(averageTransaction),
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
        ? fmtMoney(parseFloat(highestExpense.amount))
        : "N/A",
      pillTone: highestExpense
        ? "text-violet-500 dark:text-violet-300"
        : "text-muted-foreground",
      pillDescription: highestExpense
        ? "Largest purchase"
        : "No large purchases yet",
      footnote: highestExpense?.description
        ? `For ${highestExpense.description}`
        : undefined,
    },
    {
      title: "Top Category",
      value: topCategory ? fmtMoney(topCategory.amount) : fmtMoney(0),
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
      categoryColor: topCategory?.category?.color,
      categoryLabel: topCategory
        ? `${topCategory.category.name} is leading`
        : undefined,
      footnote:
        totalExpenses > 0
          ? `${fmtMoney(totalExpenses)} total across categories`
          : undefined,
    },
  ];

  // ---- render ----------------------------------------------------------------

  return (
    <PageLayout
      eyebrow="Insights overview"
      title="Analytics"
      description="Dive deeper into your spending patterns, compare periods, and uncover the habits shaping your budget."
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Analytics" }]}
      headerContent={
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/75 px-5 py-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                This month
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {fmtMoney(monthlyExpenses)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Averaging {fmtMoney(avgPerDayThisMonth)} per day
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/75 px-5 py-4 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Largest purchase
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {highestExpense
                  ? fmtMoney(parseFloat(highestExpense.amount))
                  : fmtMoney(0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {highestExpense?.description || "No high-value expenses yet"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              Updated {format(new Date(), "MMM d, yyyy 'at' h:mma")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              {totalTransactions}{" "}
              {totalTransactions === 1 ? "transaction" : "transactions"} tracked
            </span>
          </div>
        </div>
      }
    >
      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
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
                      <p className="mt-3 text-4xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                      {stat.meta ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {stat.meta}
                        </p>
                      ) : null}
                    </div>
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-inner shadow-primary/5 dark:border-white/10 dark:bg-slate-900/70">
                      <span
                        className={cn(
                          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-80",
                          stat.accent
                        )}
                      />
                      <Icon
                        className={cn("relative z-10 h-6 w-6", stat.iconAccent)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                      <span className={cn("font-semibold", stat.pillTone)}>
                        {stat.pillValue}
                      </span>
                      <span>{stat.pillDescription}</span>
                    </div>
                    {stat.footnote ? (
                      <p className="text-xs text-muted-foreground">
                        {stat.footnote}
                      </p>
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

      {/* Trend + Snapshot */}
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
                  <span>{`${monthOverMonthChange > 0 ? "+" : ""}${Math.abs(
                    monthOverMonthChange
                  ).toFixed(1)}%`}</span>
                  <span className="text-muted-foreground">
                    vs previous month
                  </span>
                </div>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="relative z-10 h-[360px]">
            {expenses?.length ? (
              <ChartContainer
                config={{
                  amount: {
                    label: "Spending",
                    color: "hsl(var(--chart-2, var(--primary)))",
                  },
                }}
                className="h-full"
                style={{
                  ["--color-amount"]: "hsl(var(--chart-2, var(--primary)))",
                }}
              >
                <BarChart
                  data={monthlyTrendData}
                  margin={{ top: 10, left: 12, right: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickFormatter={(v) => `$${Math.round(v)}`}
                    domain={[0, "auto"]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(v) => fmtMoney(Number(v))}
                        labelFormatter={(label) => `${label} total`}
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
                  {fmtMoney(monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Daily average
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {fmtMoney(avgPerDayThisMonth)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Highest transaction
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {highestExpense
                  ? `${fmtMoney(parseFloat(highestExpense.amount))}${
                      highestExpense.category?.name
                        ? ` - ${highestExpense.category.name}`
                        : ""
                    }`
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

      {/* Weekday + Categories */}
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
            {expenses?.length ? (
              <ChartContainer
                config={{
                  amount: { label: "Spending", color: "hsl(var(--primary))" },
                }}
                className="h-full"
                style={{ ["--color-amount"]: "hsl(var(--primary))" }}
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
                    tickFormatter={(v) => `$${Math.round(v)}`}
                    domain={[0, "auto"]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(v) => fmtMoney(Number(v))}
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
            {categoryBreakdown?.length ? (
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
                    {fmtMoney(item.amount)} spent
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

      {/* Insights list */}
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
            {insights.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
