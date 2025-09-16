import { supabase } from "./supabase";
import {
  type Category,
  type ExpenseWithCategory,
  type InsertCategory,
  type InsertExpense,
  type UpdateExpense,
} from "@shared/schema";

type ExpenseRow = {
  id: string;
  amount: string;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
};

export type ExpensesSummary = {
  total: number;
  monthly: number;
  previousMonth: number;
  monthlyChange: number | null;
  weekly: number;
  previousWeek: number;
  weeklyChange: number | null;
  last30Days: number;
  previous30Days: number;
  last30DaysChange: number | null;
};

const mapExpense = (row: ExpenseRow): ExpenseWithCategory => ({
  id: row.id,
  amount: row.amount,
  description: row.description,
  categoryId: row.category_id,
  date: row.date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  category: {
    id: row.categories?.id ?? row.category_id,
    name: row.categories?.name ?? "Unknown",
    color: row.categories?.color ?? "#6B7280",
    icon: row.categories?.icon ?? "more-horizontal",
  },
});

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color, icon")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(data: InsertCategory): Promise<Category> {
  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      color: data.color,
      icon: data.icon,
    })
    .select("id, name, color, icon")
    .single();

  if (error) throw error;
  return inserted as Category;
}

export async function updateCategory(
  id: string,
  data: InsertCategory
): Promise<Category> {
  const { data: updated, error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      color: data.color,
      icon: data.icon,
    })
    .eq("id", id)
    .select("id, name, color, icon")
    .single();

  if (error) throw error;
  return updated as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchExpenses(): Promise<ExpenseWithCategory[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, amount, description, category_id, date, created_at, updated_at, categories ( id, name, color, icon )"
    )
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapExpense(row as ExpenseRow));
}

export async function fetchExpensesSummary(): Promise<ExpensesSummary> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, date");

  if (error) throw error;

  const now = new Date();
  const startOfDay = (input: Date) => {
    const normalized = new Date(input);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const startOfToday = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );
  const startOfCurrentWeek = (() => {
    const current = startOfDay(now);
    const day = current.getDay();
    const diffToMonday = (day + 6) % 7;
    current.setDate(current.getDate() - diffToMonday);
    return current;
  })();
  const startOfPreviousWeek = new Date(startOfCurrentWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
  const startOfPrevious30Days = new Date(startOfLast30Days);
  startOfPrevious30Days.setDate(startOfPrevious30Days.getDate() - 30);

  let total = 0;
  let monthly = 0;
  let previousMonth = 0;
  let weekly = 0;
  let previousWeek = 0;
  let last30Days = 0;
  let previous30Days = 0;

  for (const expense of data ?? []) {
    const amount = parseFloat(expense.amount);
    if (Number.isNaN(amount)) continue;

    total += amount;

    const expenseDate = startOfDay(new Date(expense.date));

    if (expenseDate >= startOfMonth) {
      monthly += amount;
    } else if (
      expenseDate >= startOfPreviousMonth &&
      expenseDate < startOfMonth
    ) {
      previousMonth += amount;
    }

    if (expenseDate >= startOfCurrentWeek) {
      weekly += amount;
    } else if (
      expenseDate >= startOfPreviousWeek &&
      expenseDate < startOfCurrentWeek
    ) {
      previousWeek += amount;
    }

    if (expenseDate >= startOfLast30Days) {
      last30Days += amount;
    } else if (
      expenseDate >= startOfPrevious30Days &&
      expenseDate < startOfLast30Days
    ) {
      previous30Days += amount;
    }
  }

  const calculateChange = (current: number, previous: number): number | null => {
    if (previous === 0) {
      return current === 0 ? 0 : null;
    }
    const delta = ((current - previous) / previous) * 100;
    return Number.isFinite(delta) ? delta : null;
  };

  return {
    total,
    monthly,
    previousMonth,
    monthlyChange: calculateChange(monthly, previousMonth),
    weekly,
    previousWeek,
    weeklyChange: calculateChange(weekly, previousWeek),
    last30Days,
    previous30Days,
    last30DaysChange: calculateChange(last30Days, previous30Days),
  };
}

export async function fetchCategoryBreakdown(): Promise<
  Array<{ category: Category; amount: number; percentage: number }>
> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category_id, categories ( id, name, color, icon )");

  if (error) throw error;

  const totals = new Map<string, { category: Category; amount: number }>();
  let grandTotal = 0;

  for (const expense of data ?? []) {
    const amount = parseFloat(expense.amount);
    grandTotal += amount;

    const category = expense.categories;
    if (!category) continue;

    const current = totals.get(category.id) ?? {
      category,
      amount: 0,
    };

    current.amount += amount;
    totals.set(category.id, current);
  }

  return Array.from(totals.values())
    .map(({ category, amount }) => ({
      category,
      amount,
      percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function createExpense(
  data: InsertExpense
): Promise<ExpenseWithCategory> {
  const payload = {
    amount: data.amount,
    description: data.description,
    category_id: data.categoryId,
    date: data.date instanceof Date ? data.date.toISOString() : data.date,
  };

  const { data: inserted, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select(
      "id, amount, description, category_id, date, created_at, updated_at, categories ( id, name, color, icon )"
    )
    .single();

  if (error) throw error;
  return mapExpense(inserted as ExpenseRow);
}

export async function updateExpense(
  data: UpdateExpense
): Promise<ExpenseWithCategory> {
  const { id, date, amount, categoryId, description } = data;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (amount !== undefined) payload.amount = amount;
  if (description !== undefined) payload.description = description;
  if (categoryId !== undefined) payload.category_id = categoryId;
  if (date !== undefined) {
    payload.date = date instanceof Date ? date.toISOString() : date;
  }

  const { data: updated, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select(
      "id, amount, description, category_id, date, created_at, updated_at, categories ( id, name, color, icon )"
    )
    .single();

  if (error) throw error;
  return mapExpense(updated as ExpenseRow);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
