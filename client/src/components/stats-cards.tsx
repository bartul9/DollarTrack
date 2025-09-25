import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, Calendar, CalendarDays, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchExpensesSummary,
  fetchCategories,
  fetchCategoryBreakdown,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(n) ? n : 0
  );

const pct = (v) => {
  if (v == null) return "—";
  const s = v > 0 ? "+" : "";
  return `${s}${v.toFixed(1)}%`;
};

const tone = (v) =>
  v == null
    ? "text-muted-foreground"
    : v > 0
    ? "text-rose-500 dark:text-rose-400"
    : "text-emerald-500 dark:text-emerald-400";

export function StatsCards() {
  const { data: summary, isLoading: sL } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchExpensesSummary,
  });

  const { data: categories, isLoading: cL } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: breakdown, isLoading: bL } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: fetchCategoryBreakdown,
  });

  const totalCategories = categories?.length ?? 0;
  const top = breakdown?.[0];

  const previousMonthLabel = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString(
      "en-US",
      {
        month: "long",
      }
    );
  }, []);

  const loading = sL || cL || bL || !summary;

  const baseCard =
    "relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white/90 via-white/60 to-white/35 backdrop-blur-xl dark:from-slate-900/85 dark:via-slate-900/60 dark:to-slate-900/35 dark:border-white/10 border-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.08)]";

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(baseCard, "h-44 animate-pulse")}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          />
        ))}
      </motion.div>
    );
  }

  const stats = [
    {
      title: "Total Expenses",
      value: money(summary.total),
      meta: `${money(summary.last30Days)} spent in last 30 days`,
      trend: pct(summary.last30DaysChange),
      trendNote:
        summary.last30DaysChange == null
          ? "No expenses in previous 30 days"
          : "vs previous 30 days",
      Icon: TrendingDown,
      accent: "from-rose-500/20 via-rose-400/10 to-transparent",
      iconTone: "text-rose-500 dark:text-rose-400",
      trendTone: tone(summary.last30DaysChange),
      testId: "stat-total-expenses",
    },
    {
      title: "This Month",
      value: money(summary.monthly),
      meta: `${money(summary.previousMonth)} spent in ${previousMonthLabel}`,
      trend: pct(summary.monthlyChange),
      trendNote:
        summary.monthlyChange == null
          ? `No expenses in ${previousMonthLabel}`
          : `vs ${previousMonthLabel}`,
      Icon: Calendar,
      accent: "from-blue-500/20 via-blue-400/10 to-transparent",
      iconTone: "text-blue-500 dark:text-blue-400",
      trendTone: tone(summary.monthlyChange),
      testId: "stat-monthly-expenses",
    },
    {
      title: "This Week",
      value: money(summary.weekly),
      meta: `${money(summary.previousWeek)} previous week`,
      trend: pct(summary.weeklyChange),
      trendNote:
        summary.weeklyChange == null
          ? "No expenses in previous week"
          : "vs previous week",
      Icon: CalendarDays,
      accent: "from-purple-500/20 via-purple-400/10 to-transparent",
      iconTone: "text-purple-500 dark:text-purple-400",
      trendTone: tone(summary.weeklyChange),
      testId: "stat-weekly-expenses",
    },
    {
      title: "Categories",
      value: String(totalCategories),
      meta: top
        ? `${top.percentage.toFixed(1)}% of total spend`
        : "Add expenses to compare",
      trend: top ? money(top.amount) : "—",
      trendNote: top ? `Top: ${top.category.name}` : "No spend yet",
      Icon: Tag,
      accent: "from-emerald-500/20 via-emerald-400/10 to-transparent",
      iconTone: "text-emerald-500 dark:text-emerald-400",
      trendTone: top
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-muted-foreground",
      testId: "stat-categories",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(
        ({
          title,
          value,
          meta,
          trend,
          trendNote,
          Icon,
          accent,
          iconTone,
          trendTone,
          testId,
        }) => (
          <motion.div
            key={title}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.96 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            layout
          >
            <Card
              className={cn(
                "relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white/90 via-white/60 to-white/35 backdrop-blur-xl dark:from-slate-900/85 dark:via-slate-900/60 dark:to-slate-900/35 dark:border-white/10 border-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
                "h-48"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br opacity-80",
                  accent
                )}
              />

              <CardContent className="relative z-10 h-full p-6">
                {/* top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-5">
                    <div className="flex gap-2 items-center justify-center">
                      <Icon className={cn("h-6 w-6", iconTone)} />

                      <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        {title}
                      </p>
                    </div>
                    <p
                      className="text-3xl md:text-[2.2rem] md:leading-none font-semibold"
                      data-testid={testId}
                    >
                      {value}
                    </p>
                  </div>
                </div>

                {/* bottom block pinned to bottom for equal heights */}
                <div className="absolute inset-x-6 bottom-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded-full border bg-white/75 px-3 py-1 font-semibold backdrop-blur dark:bg-slate-900/55 dark:border-white/10",
                        trendTone
                      )}
                    >
                      {trend}
                    </span>
                    <span className="text-muted-foreground">{trendNote}</span>
                  </div>
                  {meta ? (
                    <p className="mt-2 w-full text-center text-xs text-muted-foreground/90">
                      {meta}
                    </p>
                  ) : (
                    <div className="mt-2 h-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      )}
    </div>
  );
}
