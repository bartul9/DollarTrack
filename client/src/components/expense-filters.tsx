import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fetchCategories } from "@/lib/api";
import { useExpenseFilters } from "@/hooks/use-expense-filters";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";

type ExpenseFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function ExpenseFiltersSheet({
  open,
  onOpenChange,
}: ExpenseFiltersSheetProps) {
  const { filters, setFilters, resetFilters } = useExpenseFilters();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const selectedCategoryIds = filters.categories;

  const selectedSummary = useMemo(() => {
    const pieces: string[] = [];
    if (selectedCategoryIds.length) {
      pieces.push(
        `${selectedCategoryIds.length} categor${
          selectedCategoryIds.length === 1 ? "y" : "ies"
        }`
      );
    }
    if (filters.dateRange?.from || filters.dateRange?.to) {
      if (filters.dateRange?.from && filters.dateRange?.to) {
        pieces.push(
          `${formatDate(filters.dateRange.from)} – ${formatDate(
            filters.dateRange.to
          )}`
        );
      } else if (filters.dateRange?.from) {
        pieces.push(`From ${formatDate(filters.dateRange.from)}`);
      } else if (filters.dateRange?.to) {
        pieces.push(`Until ${formatDate(filters.dateRange.to)}`);
      }
    }

    if (pieces.length === 0) return "No filters selected";
    return pieces.join(" · ");
  }, [filters.dateRange, selectedCategoryIds]);

  const toggleCategory = (categoryId: string, checked: boolean) => {
    setFilters((previous) => {
      const alreadySelected = previous.categories.includes(categoryId);
      if (checked && !alreadySelected) {
        return {
          ...previous,
          categories: [...previous.categories, categoryId],
        };
      }
      if (!checked && alreadySelected) {
        return {
          ...previous,
          categories: previous.categories.filter((id) => id !== categoryId),
        };
      }
      return previous;
    });
  };

  const clearDateRange = () => {
    setFilters((previous) => ({ ...previous, dateRange: undefined }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex h-dvh w-full flex-col gap-6 overflow-hidden rounded-none border border-white/70 bg-gradient-to-b from-white/95 via-white/90 to-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/70 dark:shadow-[0_24px_80px_rgba(15,23,42,0.45)] sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-l-[32px]"
      >
        <div className="flex h-full flex-col gap-6">
          <SheetHeader>
            <SheetTitle>Filter expenses</SheetTitle>
            <SheetDescription>{selectedSummary}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto pr-1 sm:pr-0">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Categories</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose one or multiple categories to narrow down results.
                  </p>
                </div>
                <ScrollArea className="max-h-[60vh] rounded-2xl border border-white/60 bg-white/70 p-3 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-950/60 sm:max-h-64">
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-10 animate-pulse rounded-lg bg-muted/60"
                          />
                        ))}
                      </div>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category) => {
                        const isChecked = selectedCategoryIds.includes(category.id);
                        return (
                          <Label
                            key={category.id}
                            htmlFor={`filter-category-${category.id}`}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                              isChecked &&
                                "border-primary/40 bg-primary/10 text-primary shadow-sm dark:border-primary/30 dark:bg-primary/15 dark:text-primary-foreground"
                            )}
                          >
                            <Checkbox
                              id={`filter-category-${category.id}`}
                              checked={isChecked}
                              onCheckedChange={(value) =>
                                toggleCategory(category.id, value === true)
                              }
                            />
                            <span className="font-medium text-foreground">
                              {category.name}
                            </span>
                          </Label>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No categories available.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Date range</h3>
                    <p className="text-xs text-muted-foreground">
                      Select a start and end date to filter transactions.
                    </p>
                  </div>
                  {(filters.dateRange?.from || filters.dateRange?.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={clearDateRange}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={filters.dateRange}
                    onSelect={(range) =>
                      setFilters((previous) => ({
                        ...previous,
                        dateRange: range,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-4 shrink-0 pt-2">
            <Button
              variant="outline"
              className="justify-center"
              onClick={() => {
                resetFilters();
              }}
            >
              Reset filters
            </Button>
            <Button onClick={() => onOpenChange(false)}>Apply filters</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

