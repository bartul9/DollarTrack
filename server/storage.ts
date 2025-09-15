import { type Category, type InsertCategory, type Expense, type InsertExpense, type UpdateExpense, type ExpenseWithCategory, categories, expenses } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Expenses
  getExpenses(): Promise<ExpenseWithCategory[]>;
  getExpenseById(id: string): Promise<ExpenseWithCategory | undefined>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]>;
  getExpensesByCategory(categoryId: string): Promise<ExpenseWithCategory[]>;
  createExpense(expense: InsertExpense): Promise<ExpenseWithCategory>;
  updateExpense(expense: UpdateExpense): Promise<ExpenseWithCategory>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Analytics
  getExpensesSummary(): Promise<{
    total: number;
    monthly: number;
    weekly: number;
  }>;
  getCategoryBreakdown(): Promise<Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.categories = new Map();
    this.expenses = new Map();
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Food & Dining", color: "#3B82F6", icon: "utensils" },
      { name: "Transport", color: "#10B981", icon: "car" },
      { name: "Entertainment", color: "#8B5CF6", icon: "film" },
      { name: "Utilities", color: "#F59E0B", icon: "zap" },
      { name: "Healthcare", color: "#EF4444", icon: "heart" },
      { name: "Shopping", color: "#EC4899", icon: "shopping-bag" },
      { name: "Education", color: "#06B6D4", icon: "book" },
      { name: "Other", color: "#6B7280", icon: "more-horizontal" },
    ];

    defaultCategories.forEach(category => {
      const id = randomUUID();
      this.categories.set(id, { ...category, id });
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getExpenses(): Promise<ExpenseWithCategory[]> {
    const expenses = Array.from(this.expenses.values());
    return expenses.map(expense => ({
      ...expense,
      category: this.categories.get(expense.categoryId)!,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpenseById(id: string): Promise<ExpenseWithCategory | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const category = this.categories.get(expense.categoryId);
    if (!category) return undefined;
    
    return { ...expense, category };
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]> {
    const expenses = await this.getExpenses();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  async getExpensesByCategory(categoryId: string): Promise<ExpenseWithCategory[]> {
    const expenses = await this.getExpenses();
    return expenses.filter(expense => expense.categoryId === categoryId);
  }

  async createExpense(insertExpense: InsertExpense): Promise<ExpenseWithCategory> {
    const id = randomUUID();
    const now = new Date();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.expenses.set(id, expense);
    
    const category = this.categories.get(expense.categoryId)!;
    return { ...expense, category };
  }

  async updateExpense(updateExpense: UpdateExpense): Promise<ExpenseWithCategory> {
    const existing = this.expenses.get(updateExpense.id);
    if (!existing) {
      throw new Error("Expense not found");
    }

    const updated: Expense = {
      ...existing,
      ...updateExpense,
      updatedAt: new Date(),
    };

    this.expenses.set(updateExpense.id, updated);
    
    const category = this.categories.get(updated.categoryId)!;
    return { ...updated, category };
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesSummary(): Promise<{
    total: number;
    monthly: number;
    weekly: number;
  }> {
    const expenses = await this.getExpenses();
    const now = new Date();
    
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = expenses.filter(expense => new Date(expense.date) >= startOfMonth);
    const monthly = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weeklyExpenses = expenses.filter(expense => new Date(expense.date) >= startOfWeek);
    const weekly = weeklyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return { total, monthly, weekly };
  }

  async getCategoryBreakdown(): Promise<Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>> {
    const expenses = await this.getExpenses();
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const categoryAmounts = new Map<string, number>();
    
    expenses.forEach(expense => {
      const current = categoryAmounts.get(expense.categoryId) || 0;
      categoryAmounts.set(expense.categoryId, current + parseFloat(expense.amount));
    });

    const breakdown = Array.from(categoryAmounts.entries()).map(([categoryId, amount]) => {
      const category = this.categories.get(categoryId)!;
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return { category, amount, percentage };
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  }
}

// Database storage using Drizzle with Supabase
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    try {
      // Check if categories already exist
      const existingCategories = await this.db.select().from(categories);
      
      if (existingCategories.length === 0) {
        const defaultCategories: InsertCategory[] = [
          { name: "Food & Dining", color: "#3B82F6", icon: "utensils" },
          { name: "Transport", color: "#10B981", icon: "car" },
          { name: "Entertainment", color: "#8B5CF6", icon: "film" },
          { name: "Utilities", color: "#F59E0B", icon: "zap" },
          { name: "Healthcare", color: "#EF4444", icon: "heart" },
          { name: "Shopping", color: "#EC4899", icon: "shopping-bag" },
          { name: "Education", color: "#06B6D4", icon: "book" },
          { name: "Other", color: "#6B7280", icon: "more-horizontal" },
        ];

        await this.db.insert(categories).values(defaultCategories);
      }
    } catch (error) {
      console.error("Failed to initialize default categories:", error);
    }
  }

  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async getExpenses(): Promise<ExpenseWithCategory[]> {
    const result = await this.db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        description: expenses.description,
        categoryId: expenses.categoryId,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .orderBy(desc(expenses.date));

    return result.map(row => ({
      ...row,
      category: row.category!,
    }));
  }

  async getExpenseById(id: string): Promise<ExpenseWithCategory | undefined> {
    const result = await this.db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        description: expenses.description,
        categoryId: expenses.categoryId,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(eq(expenses.id, id));

    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row,
      category: row.category!,
    };
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]> {
    const result = await this.db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        description: expenses.description,
        categoryId: expenses.categoryId,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ))
      .orderBy(desc(expenses.date));

    return result.map(row => ({
      ...row,
      category: row.category!,
    }));
  }

  async getExpensesByCategory(categoryId: string): Promise<ExpenseWithCategory[]> {
    const result = await this.db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        description: expenses.description,
        categoryId: expenses.categoryId,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(eq(expenses.categoryId, categoryId))
      .orderBy(desc(expenses.date));

    return result.map(row => ({
      ...row,
      category: row.category!,
    }));
  }

  async createExpense(insertExpense: InsertExpense): Promise<ExpenseWithCategory> {
    const result = await this.db.insert(expenses).values(insertExpense).returning();
    const expense = result[0];
    
    const category = await this.getCategoryById(expense.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    return { ...expense, category };
  }

  async updateExpense(updateExpense: UpdateExpense): Promise<ExpenseWithCategory> {
    const { id, ...updateData } = updateExpense;
    const result = await this.db
      .update(expenses)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Expense not found");
    }

    const expense = result[0];
    const category = await this.getCategoryById(expense.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    return { ...expense, category };
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await this.db.delete(expenses).where(eq(expenses.id, id)).returning();
    return result.length > 0;
  }

  async getExpensesSummary(): Promise<{
    total: number;
    monthly: number;
    weekly: number;
  }> {
    const allExpenses = await this.db.select().from(expenses);
    const now = new Date();
    
    const total = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = allExpenses.filter(expense => new Date(expense.date) >= startOfMonth);
    const monthly = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weeklyExpenses = allExpenses.filter(expense => new Date(expense.date) >= startOfWeek);
    const weekly = weeklyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return { total, monthly, weekly };
  }

  async getCategoryBreakdown(): Promise<Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>> {
    const allExpenses = await this.getExpenses();
    const total = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const categoryAmounts = new Map<string, { category: Category; amount: number }>();
    
    allExpenses.forEach(expense => {
      const current = categoryAmounts.get(expense.categoryId) || { category: expense.category, amount: 0 };
      categoryAmounts.set(expense.categoryId, {
        category: expense.category,
        amount: current.amount + parseFloat(expense.amount)
      });
    });

    const breakdown = Array.from(categoryAmounts.values()).map(({ category, amount }) => {
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return { category, amount, percentage };
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  }
}

// Use database storage by default
export const storage = new DatabaseStorage();
