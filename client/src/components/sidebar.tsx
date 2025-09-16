import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Tag,
  Settings,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-6 left-6 z-40 hidden w-64 flex-col justify-between overflow-hidden rounded-3xl border border-white/50 bg-sidebar backdrop-blur-2xl shadow-2xl transition-all duration-500 dark:border-white/10 md:flex">
      <div className="relative px-6 pt-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl dark:bg-primary/40" />
        <div className="pointer-events-none absolute -bottom-14 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/30" />
        <div className="relative flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">ExpenseTracker</h1>
            <p className="text-sm text-muted-foreground">Smart Finance</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <a
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                  className={cn(
                    "group flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-300 group-hover:scale-105",
                      isActive ? "text-primary-foreground" : "text-foreground/70"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive ? (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/80" />
                  ) : null}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-5 px-6 pb-8">
        <div className="rounded-3xl border border-white/40 bg-white/60 p-4 text-sm shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">Upgrade Mode</h3>
          <p className="text-xs text-muted-foreground">
            Switch between light and dark experiences for a calmer focus.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {"\u00A9"} {currentYear} DollarTrack
        </p>
      </div>
    </aside>
  );
}
