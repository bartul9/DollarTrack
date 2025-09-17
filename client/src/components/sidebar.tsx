import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  BarChart3,
  AlbumIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { useCurrentUser, currentUserQueryKey } from "@/hooks/use-current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Categories", href: "/categories", icon: AlbumIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryKey, null);
      queryClient.clear();
      toast({ title: "You have been logged out" });
      navigate("/", { replace: true });
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to logout",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const userInitial = user?.name?.[0] ?? user?.email?.[0] ?? "";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-white/60 bg-white/85 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-slate-950/70">
      <span className="pointer-events-none absolute inset-x-4 top-6 h-32 rounded-3xl bg-gradient-to-b from-primary/25 via-transparent to-transparent blur-3xl dark:from-primary/20" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 via-transparent to-transparent blur-3xl dark:from-primary/20" />
      <div className="relative flex h-full flex-col px-6 pb-6 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                DollarTrack
              </h1>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Smart finance
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <ThemeToggle className="h-11 w-11 border-white/70 bg-white/80 text-foreground shadow-none hover:bg-white/90 dark:border-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-900/60" />
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive =
              (location.pathname == "/app" && item.href == "/") ||
              location.pathname == "/app" + item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} to={"/app" + item.href}>
                <a
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-white shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-primary shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
                      isActive &&
                        "border-transparent bg-white/20 text-white shadow-none dark:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{item.name}</span>
                  {isActive ? (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/80 shadow" />
                  ) : null}
                </a>
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="mt-auto rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                {userInitial.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full justify-center gap-2 rounded-full border-white/60 bg-white/80 text-foreground shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
