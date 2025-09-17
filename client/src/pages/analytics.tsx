"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  isValid as isValidDate,
} from "date-fns";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/page-layout";
import {
  fetchCategoryBreakdown,
  fetchExpenses,
  fetchExpensesSummary,
} from "@/lib/api";
import type { ExpenseWithCategory, Category } from "@shared/schema";

// ── helpers ───────────────────────────────────────────────────────────────────

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    // strip currency/commas/spaces
    const cleaned = v.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const safeDate = (v: unknown): Date | null => {
  const d = new Date(String(v ?? ""));
  return isValidDate(d) ? d : null;
};

const toCurrency = (n: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(toNumber(n));

const fmtAxisMoney = (value: number) => {
  const val = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
  if (abs >= 100) return `$${val.toFixed(0)}`;
  return `$${val.toFixed(1)}`;
};

const withFallbackColor = (hex?: string) =>
  typeof hex === "string" && /^#?[0-9a-f]{3,8}$/i.test(hex)
    ? hex.startsWith("#")
      ? hex
      : `#${hex}`
    : "hsl(var(--primary))";

// ── small UI bits ─────────────────────────────────────────────────────────────

function CardGlow({
  topClass,
  bottomClass,
}: {
  topClass?: string;
  bottomClass?: string;
}) {
  return (
    <>
      {topClass ? <span className={topClass} /> : null}
      {bottomClass ? <span className={bottomClass} /> : null}
    </>
  );
}

function HighlightCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="relative px-6 py-5 text-sm shadow-[0_18px_50px_rgba(14,116,144,0.1)] sm:px-7 sm:py-6">
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/75 via-white/45 to-white/15 dark:from-white/10 dark:via-white/5 dark:to-transparent" />
      <CardGlow
        topClass="pointer-events-none absolute inset-x-6 -top-10 h-24 rounded-full bg-white/45 blur-3xl dark:bg-white/10"
        bottomClass="pointer-events-none absolute inset-x-6 bottom-0 h-20 rounded-full bg-white/30 blur-3xl dark:bg-white/10"
      />
      <div className="relative z-10 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function CategoryProgress({ value, color }: { value: number; color?: string }) {
  const clamped = Math.max(
    0,
    Math.min(100, Number.isFinite(value) ? value : 0)
  );
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20 dark:bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: withFallbackColor(color),
        }}
      />
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["expenses", "summary"],
    queryFn: fetchExpensesSummary,
  });

  const { data: expensesRaw, isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses", "list"],
    queryFn: fetchExpenses,
  });

  const { data: categoriesRaw, isLoading: loadingBreakdown } = useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: fetchCategoryBreakdown,
  });

  const isLoading = loadingSummary || loadingExpenses || loadingBreakdown;

  // sanitize expenses
  const expenses = useMemo(() => {
    return (expensesRaw ?? [])
      .map((e) => {
        const date = safeDate(e?.date);
        const amount = toNumber(e?.amount);
        if (!date || amount <= 0) return null;
        return {
          ...e,
          amount: String(amount),
          date: date.toISOString(),
          category: e?.category ?? ({} as { id?: string; name?: string }),
          description: String(e?.description ?? "").trim(),
        } as ExpenseWithCategory;
      })
      .filter(Boolean) as ExpenseWithCategory[];
  }, [expensesRaw]);

  // sanitize category breakdown
  const categoryBreakdown = useMemo(() => {
    const arr =
      (categoriesRaw ?? []).map((item) => {
        const amount = toNumber(item?.amount);
        const percentage = Number.isFinite(item?.percentage)
          ? Number(item.percentage)
          : 0;
        const category: Category = {
          id: String(item?.category?.id ?? ""),
          name: String(item?.category?.name ?? "Unknown"),
          color: withFallbackColor(item?.category?.color),
        } as any;
        return amount > 0 ? { amount, percentage, category } : null;
      }) || [];
    return arr.filter(Boolean) as Array<{
      amount: number;
      percentage: number;
      category: Category;
    }>;
  }, [categoriesRaw]);

  // derive metrics
  const totalExpenses = toNumber(summary?.total);
  const monthlyExpenses = toNumber(summary?.monthly);
  const weeklyExpenses = toNumber(summary?.weekly);

  const totalTransactions = expenses.length;
  const totalCategories = categoryBreakdown.length;
  const hasExpenses = totalTransactions > 0;

  const highestExpense = useMemo(() => {
    if (!hasExpenses) return null;
    return expenses.reduce((max, expense) =>
      toNumber(expense.amount) > toNumber(max.amount) ? expense : max
    );
  }, [expenses, hasExpenses]);

  const averageTransaction = useMemo(() => {
    if (!hasExpenses) return 0;
    return totalExpenses / totalTransactions || 0;
  }, [hasExpenses, totalExpenses, totalTransactions]);

  const topCategory = useMemo(() => {
    if (!totalExpenses || !categoryBreakdown.length) return null;
    return [...categoryBreakdown].sort((a, b) => b.amount - a.amount)[0];
  }, [categoryBreakdown, totalExpenses]);

  const monthlyTrendData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const reference = subMonths(new Date(), 5 - index);
        const start = startOfMonth(reference);
        const end = endOfMonth(reference);
        const totalForMonth = expenses.reduce((sum, expense) => {
          const d = safeDate(expense.date);
          if (d && d >= start && d <= end) {
            return sum + toNumber(expense.amount);
          }
          return sum;
        }, 0);
        return {
          month: format(reference, "MMM"),
          amount: Number(totalForMonth.toFixed(2)),
        };
      }),
    [expenses]
  );

  const monthOverMonthChange = useMemo(() => {
    if (!hasExpenses || monthlyTrendData.length < 2) return null;
    const latest = monthlyTrendData.at(-1)?.amount ?? 0;
    const previous = monthlyTrendData.at(-2)?.amount ?? 0;
    if (previous === 0) return latest === 0 ? 0 : null;
    return ((latest - previous) / previous) * 100;
  }, [monthlyTrendData, hasExpenses]);

  const weekdaySpendingData = useMemo(
    () =>
      weekdayLabels.map((label, index) => {
        const total = expenses.reduce((sum, expense) => {
          const d = safeDate(expense.date);
          if (d && d.getDay() === index) {
            return sum + toNumber(expense.amount);
          }
          return sum;
        }, 0);
        return { day: label, amount: Number(total.toFixed(2)) };
      }),
    [expenses]
  );

  const daysElapsedThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    return Math.max(1, differenceInCalendarDays(new Date(), start) + 1);
  }, []);

  const avgPerDayThisMonth = useMemo(() => {
    const m = monthlyExpenses;
    if (!Number.isFinite(m) || m <= 0) return 0;
    return m / daysElapsedThisMonth;
  }, [monthlyExpenses, daysElapsedThisMonth]);

  const insights = useMemo(() => {
    const messages: string[] = [];

    if (topCategory && topCategory.amount > 0) {
      messages.push(
        `${
          topCategory.category.name
        } accounts for ${topCategory.percentage.toFixed(
          1
        )}% of your total spending.`
      );
    }

    if (highestExpense) {
      const value = toCurrency(toNumber(highestExpense.amount));
      const descriptor =
        highestExpense.description?.trim() ||
        highestExpense.category?.name ||
        "an item";
      messages.push(`Your largest purchase was ${value} for ${descriptor}.`);
    }

    if (monthOverMonthChange !== null) {
      const delta = Math.abs(monthOverMonthChange).toFixed(1);
      if (monthOverMonthChange > 0) {
        messages.push(`Spending is up ${delta}% vs last month.`);
      } else if (monthOverMonthChange < 0) {
        messages.push(`Spending is down ${delta}% vs last month.`);
      } else {
        messages.push("Spending is in line with last month.");
      }
    }

    if (monthlyExpenses > 0) {
      messages.push(
        `You are averaging ${toCurrency(
          avgPerDayThisMonth
        )} per day this month.`
      );
    }

    if (weeklyExpenses > 0) {
      messages.push(`Last 7 days total: ${toCurrency(weeklyExpenses)}.`);
    }

    return messages;
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

  const updatedAtLabel = useMemo(
    () => format(new Date(), "MMM d, yyyy 'at' h:mma"),
    []
  );

  const largestPurchaseValue = highestExpense
    ? toCurrency(toNumber(highestExpense.amount))
    : toCurrency(0);

  const largestPurchaseDescription = highestExpense
    ? [highestExpense.description, highestExpense.category?.name]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part && part.length > 0))
        .join(" • ") || "Largest purchase recorded"
    : "No high-value expenses yet";

  const monthOverMonthLabel =
    monthOverMonthChange !== null
      ? `${monthOverMonthChange > 0 ? "+" : ""}${Math.abs(
          monthOverMonthChange
        ).toFixed(1)}%`
      : null;

  // unique gradient ids (fix for empty id / fill)
  const trendGradId = useMemo(
    () => `grad-trend-${Math.random().toString(36).slice(2)}`,
    []
  );
  const weekdayGradId = useMemo(
    () => `grad-weekday-${Math.random().toString(36).slice(2)}`,
    []
  );

  return (
    <PageLayout
      eyebrow="Insights overview"
      title="Analytics"
      description="Dive deeper into your spending patterns, compare periods, and uncover the habits shaping your budget."
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Analytics" }]}
      headerContent={
        <div className="space-y-6">
          {hasExpenses ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <HighlightCard
                label="This month"
                value={toCurrency(monthlyExpenses)}
                description={`Averaging ${toCurrency(
                  avgPerDayThisMonth
                )} per day`}
              />
              <HighlightCard
                label="Largest purchase"
                value={largestPurchaseValue}
                description={largestPurchaseDescription}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <HighlightCard
                label="No data yet"
                value="Add your first expense"
                description="Once you add transactions, insights will appear here."
              />
              <HighlightCard
                label="Tips"
                value="Categorize transactions"
                description="Adding categories unlocks distribution and top-category stats."
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Updated {updatedAtLabel}</span>
            <span>
              {totalTransactions}{" "}
              {totalTransactions === 1 ? "transaction" : "transactions"} tracked
            </span>
          </div>
        </div>
      }
    >
      {/* top stat skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-44 animate-pulse opacity-60" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.65fr,1fr]">
        <Card className="relative overflow-hidden shadow-[0_24px_60px_rgba(14,116,144,0.14)]">
          <CardGlow
            topClass="pointer-events-none absolute inset-x-8 -top-12 h-32 rounded-full bg-white/40 blur-3xl dark:bg-white/10"
            bottomClass="pointer-events-none absolute inset-x-10 bottom-0 h-28 rounded-full bg-white/25 blur-3xl dark:bg-white/10"
          />
          <CardHeader className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tracking the last 6 months of expenses
                </p>
              </div>
              {monthOverMonthLabel && hasExpenses ? (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur dark:border-white/10 dark:bg-slate-900/60",
                    monthOverMonthChange && monthOverMonthChange > 0
                      ? "text-rose-500 dark:text-rose-400"
                      : monthOverMonthChange && monthOverMonthChange < 0
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{monthOverMonthLabel}</span>
                  <span className="text-muted-foreground">
                    vs previous month
                  </span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 h-[360px]">
            {hasExpenses ? (
              <ChartContainer
                config={{
                  amount: {
                    label: "Spending",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-full w-full aspect-auto [&_.recharts-cartesian-grid_line]:stroke-[rgba(148,163,184,0.35)] [&_.recharts-cartesian-grid_line]:opacity-60 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-[13px]"
              >
                <BarChart
                  data={monthlyTrendData}
                  margin={{ top: 10, left: 12, right: 24, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <defs>
                    <linearGradient
                      id={trendGradId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c084fc"
                        stopOpacity={0.85}
                      />
                      <stop
                        offset="100%"
                        stopColor="#7c3aed"
                        stopOpacity={0.25}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(148,163,184,0.35)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={84}
                    tickFormatter={fmtAxisMoney}
                    domain={[0, "auto"]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => toCurrency(Number(value))}
                        labelFormatter={(label) => `${label} total`}
                        indicator="dot"
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    name="Spending"
                    fill={`url(#${trendGradId})`}
                    radius={[12, 12, 0, 0]}
                    maxBarSize={48}
                    animationDuration={420}
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

        <Card className="relative overflow-hidden shadow-[0_24px_60px_rgba(14,116,144,0.12)]">
          <CardGlow />
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
                  {toCurrency(monthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Daily average
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {toCurrency(avgPerDayThisMonth)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Highest transaction
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {highestExpense
                  ? `${toCurrency(toNumber(highestExpense.amount))}${
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
                {totalCategories}
              </p>
            </div>

            {latestMonthlyAmount > 0 || previousMonthlyAmount > 0 ? (
              <div className="text-xs text-muted-foreground">
                {latestMonthlyAmount > 0 && (
                  <div>Latest month: {toCurrency(latestMonthlyAmount)}</div>
                )}
                {previousMonthlyAmount > 0 && (
                  <div>Previous month: {toCurrency(previousMonthlyAmount)}</div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr,1fr]">
        <Card className="relative overflow-hidden shadow-[0_24px_60px_rgba(14,116,144,0.12)]">
          <CardGlow />
          <CardHeader className="relative z-10">
            <CardTitle>Spending by Weekday</CardTitle>
            <p className="text-sm text-muted-foreground">
              Identify the days you spend the most
            </p>
          </CardHeader>
          <CardContent className="relative z-10 h-[320px]">
            {hasExpenses ? (
              <ChartContainer
                config={{
                  amount: { label: "Spending", color: "hsl(var(--primary))" },
                }}
                className="h-full w-full aspect-auto [&_.recharts-cartesian-grid_line] [&_.recharts-cartesian-grid_line]:opacity-60 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-[13px]"
              >
                <BarChart
                  data={weekdaySpendingData}
                  margin={{ top: 10, left: 12, right: 24, bottom: 0 }}
                  barCategoryGap="32%"
                >
                  <defs>
                    <linearGradient
                      id={weekdayGradId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#38bdf8"
                        stopOpacity={0.85}
                      />
                      <stop
                        offset="100%"
                        stopColor="#0ea5e9"
                        stopOpacity={0.25}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(148,163,184,0.35)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={90}
                    tickFormatter={fmtAxisMoney}
                    domain={[0, "auto"]}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => toCurrency(Number(value))}
                        labelFormatter={(label) => `${label} spending`}
                        indicator="dot"
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    name="Spending"
                    fill={`url(#${weekdayGradId})`}
                    radius={[12, 12, 0, 0]}
                    maxBarSize={48}
                    animationDuration={420}
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

        <Card className="relative overflow-hidden shadow-[0_24px_60px_rgba(14,116,144,0.12)]">
          <CardGlow />
          <CardHeader className="relative z-10">
            <CardTitle>Category Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top spending categories this month
            </p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            {categoryBreakdown.length ? (
              categoryBreakdown.slice(0, 5).map((item) => (
                <div
                  key={`${item.category.id}-${item.category.name}`}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: withFallbackColor(
                            item.category.color
                          ),
                        }}
                      />
                      <span className="font-medium text-foreground">
                        {item.category.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {Number(item.percentage).toFixed(1)}%
                    </span>
                  </div>
                  <CategoryProgress
                    value={Number(item.percentage)}
                    color={withFallbackColor(item.category.color)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {toCurrency(item.amount)} spent
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

      {insights.length > 0 && (
        <Card className="relative overflow-hidden shadow-[0_24px_60px_rgba(14,116,144,0.12)]">
          <CardGlow />
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
      )}
    </PageLayout>
  );
}
