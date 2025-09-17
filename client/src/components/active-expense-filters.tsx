import { useMemo } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchCategories } from "@/lib/api";
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import type { Category } from "@shared/schema";

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

type ActiveExpenseFiltersProps = {
  className?: string;
};

export function ActiveExpenseFilters({
  className,
}: ActiveExpenseFiltersProps) {
  const { filters, setFilters, resetFilters } = useExpenseFilters();
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const category of categories ?? []) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const hasCategoryFilters = filters.categories.length > 0;
  const hasDateFilter = Boolean(filters.dateRange?.from || filters.dateRange?.to);

  if (!hasCategoryFilters && !hasDateFilter) {
    return null;
  }

  const removeCategory = (categoryId: string) => {
    setFilters((previous) => ({
      ...previous,
      categories: previous.categories.filter((id) => id !== categoryId),
    }));
  };

  const clearDate = () => {
    setFilters((previous) => ({ ...previous, dateRange: undefined }));
  };

  const rangeLabel = (() => {
    if (!filters.dateRange) return "";
    const { from, to } = filters.dateRange;
    if (from && to) {
      return `${formatDate(from)} – ${formatDate(to)}`;
    }
    if (from) {
      return `From ${formatDate(from)}`;
    }
    if (to) {
      return `Until ${formatDate(to)}`;
    }
    return "";
  })();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.categories.map((categoryId) => {
        const category = categoryMap.get(categoryId);
        return (
          <button
            key={categoryId}
            type="button"
            onClick={() => removeCategory(categoryId)}
            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:border-white/10 dark:bg-slate-900/60"
          >
            <span>{category?.name ?? "Category"}</span>
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        );
      })}

      {hasDateFilter && rangeLabel && (
        <button
          type="button"
          onClick={clearDate}
          className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:border-white/10 dark:bg-slate-900/60"
        >
          <span>{rangeLabel}</span>
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-xs"
        onClick={resetFilters}
      >
        Clear all
      </Button>
    </div>
  );
}

