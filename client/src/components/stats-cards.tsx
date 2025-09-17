import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, Calendar, CalendarDays, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type Category } from "@shared/schema";
import {
  fetchExpensesSummary,
  fetchCategories,
  fetchCategoryBreakdown,
  type ExpensesSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

interface StatsCardsProps {}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatTrendPercentage = (value: number | null) => {
  if (value === null) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const getTrendColor = (value: number | null) => {
  if (value === null) {
    return "text-muted-foreground";
  }

  if (value > 0) {
    return "text-rose-500 dark:text-rose-400";
  }

  if (value < 0) {
    return "text-emerald-500 dark:text-emerald-400";
  }

  return "text-muted-foreground";
};

export function StatsCards({}: StatsCardsProps) {
  const { data: summary, isLoading: summaryLoading } =
    useQuery<ExpensesSummary>({
      queryKey: ["analytics-summary"],
      queryFn: fetchExpensesSummary,
    });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery<
    Array<{ category: Category; amount: number; percentage: number }>
  >({
    queryKey: ["analytics-categories"],
    queryFn: fetchCategoryBreakdown,
  });

  const totalCategories = categories?.length ?? 0;
  const topCategory = categoryBreakdown?.[0];

  const isLoading =
    summaryLoading || categoriesLoading || breakdownLoading || !summary;

  const previousMonthLabel = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString(
      "en-US",
      { month: "long" }
    );
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="h-44 animate-pulse rounded-[2.5rem] border-transparent bg-gradient-to-br from-white/75 via-white/45 to-white/20 dark:from-slate-900/75 dark:via-slate-900/45 dark:to-slate-900/25"
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Expenses",
      value: formatCurrency(summary.total),
      icon: TrendingDown,
      accent: "from-rose-500/25 via-rose-400/10 to-transparent",
      iconColor: "text-rose-500 dark:text-rose-400",
      trendValue: formatTrendPercentage(summary.last30DaysChange),
      trendDescriptor:
        summary.last30DaysChange === null
          ? "No expenses in previous 30 days"
          : "vs previous 30 days",
      trendColor: getTrendColor(summary.last30DaysChange),
      meta: `${formatCurrency(summary.last30Days)} spent in last 30 days`,
      testId: "stat-total-expenses",
    },
    {
      title: "This Month",
      value: formatCurrency(summary.monthly),
      icon: Calendar,
      accent: "from-blue-500/25 via-blue-400/10 to-transparent",
      iconColor: "text-blue-500 dark:text-blue-400",
      trendValue: formatTrendPercentage(summary.monthlyChange),
      trendDescriptor:
        summary.monthlyChange === null
          ? `No expenses in ${previousMonthLabel}`
          : `vs ${previousMonthLabel}`,
      trendColor: getTrendColor(summary.monthlyChange),
      meta: `${formatCurrency(
        summary.previousMonth
      )} spent in ${previousMonthLabel}`,
      testId: "stat-monthly-expenses",
    },
    {
      title: "This Week",
      value: formatCurrency(summary.weekly),
      icon: CalendarDays,
      accent: "from-purple-500/25 via-purple-400/10 to-transparent",
      iconColor: "text-purple-500 dark:text-purple-400",
      trendValue: formatTrendPercentage(summary.weeklyChange),
      trendDescriptor:
        summary.weeklyChange === null
          ? "No expenses in previous week"
          : "vs previous week",
      trendColor: getTrendColor(summary.weeklyChange),
      meta: `${formatCurrency(summary.previousWeek)} previous week`,
      testId: "stat-weekly-expenses",
    },
    {
      title: "Categories",
      value: totalCategories.toString(),
      icon: Tag,
      accent: "from-emerald-500/25 via-emerald-400/10 to-transparent",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      trendValue: topCategory
        ? formatCurrency(topCategory.amount)
        : "No spend yet",
      trendDescriptor: topCategory
        ? `Top: ${topCategory.category.name}`
        : "Add expenses to compare",
      trendColor: topCategory
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-muted-foreground",
      meta: topCategory
        ? `${topCategory.percentage.toFixed(1)}% of total spend`
        : undefined,
      testId: "stat-categories",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={cn(
              "group relative overflow-hidden rounded-[2.75rem] border border-white/50 bg-gradient-to-br from-white/85 via-white/55 to-white/25 shadow-[0_35px_90px_rgba(124,58,237,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_45px_120px_rgba(124,58,237,0.22)] dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/55 dark:to-slate-900/30",
              "card-hover"
            )}
          >
            <span
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                stat.accent
              )}
            />
            <span className="pointer-events-none absolute inset-x-6 -top-10 h-28 rounded-full bg-white/50 blur-3xl dark:bg-white/15" />
            <span className="pointer-events-none absolute inset-x-10 bottom-0 h-28 rounded-full bg-white/35 blur-3xl dark:bg-white/15" />
            <CardContent className="relative z-10 flex flex-col gap-8 px-8 py-8">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {stat.title}
                  </p>
                  <p
                    className="text-4xl font-semibold text-foreground md:text-[2.6rem] md:leading-none"
                    data-testid={stat.testId}
                  >
                    {stat.value}
                  </p>
                </div>
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/60 bg-white/80 shadow-inner shadow-primary/10 transition-transform duration-300 ease-out group-hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/65">
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-br opacity-80",
                      stat.accent
                    )}
                  />
                  <Icon
                    className={cn(
                      "relative z-10 h-7 w-7 shrink-0",
                      stat.iconColor
                    )}
                  />
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/55">
                  <span className={cn("font-semibold", stat.trendColor)}>
                    {stat.trendValue}
                  </span>
                  <span>{stat.trendDescriptor}</span>
                </div>
                {stat.meta ? (
                  <p className="text-xs text-muted-foreground/90">{stat.meta}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
