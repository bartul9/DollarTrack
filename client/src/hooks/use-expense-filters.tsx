import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DateRange } from "react-day-picker";

export type ExpenseFilters = {
  categories: string[];
  dateRange?: DateRange;
};

type ExpenseFiltersContextValue = {
  filters: ExpenseFilters;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
  resetFilters: () => void;
};

const ExpenseFiltersContext = createContext<ExpenseFiltersContextValue | null>(
  null
);

const createDefaultFilters = (): ExpenseFilters => ({
  categories: [],
  dateRange: undefined,
});

export function ExpenseFiltersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [filters, setFilters] = useState<ExpenseFilters>(createDefaultFilters);

  const value = useMemo(() => {
    const resetFilters = () => setFilters(createDefaultFilters());
    return {
      filters,
      setFilters,
      resetFilters,
    };
  }, [filters]);

  return (
    <ExpenseFiltersContext.Provider value={value}>
      {children}
    </ExpenseFiltersContext.Provider>
  );
}

export function useExpenseFilters() {
  const context = useContext(ExpenseFiltersContext);
  if (!context) {
    throw new Error(
      "useExpenseFilters must be used within an ExpenseFiltersProvider"
    );
  }
  return context;
}

