import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractErrorMessage } from "@/lib/errors";
import { useCurrentUser, currentUserQueryKey } from "@/hooks/use-current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Expenses", href: "/app/expenses", icon: CreditCard },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryKey, null);
      queryClient.clear();
      toast({ title: "You have been logged out" });
      setLocation("/login");
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to logout",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-white shadow-lg">
      <div className="flex-1 p-6">
        <div className="mb-8 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">DollarTrack</h1>
            <p className="text-sm text-muted-foreground">Smart Finance</p>
          </div>
        </div>

        <nav className="space-y-2">
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
                  <Icon className="h-5 w-5" />
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
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            Upgrade Mode
          </h3>
          <p className="text-xs text-muted-foreground">
            Switch between light and dark experiences for a calmer focus.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {"\u00A9"} {currentYear} DollarTrack
        </p>
      </div>

      {user ? (
        <div className="border-t border-border p-6">
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isLoading}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
