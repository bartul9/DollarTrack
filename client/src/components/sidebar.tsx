import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
  AlbumIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { useCurrentUser, currentUserQueryKey } from "@/hooks/use-current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Categories", href: "/categories", icon: AlbumIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
    <aside
      data-collapsed={collapsed ? "true" : undefined}
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-white/60 bg-white/85 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70 lg:flex",
        collapsed ? "w-24" : "w-72"
      )}
    >
      <span className="pointer-events-none absolute inset-x-4 top-6 h-32 rounded-3xl bg-gradient-to-b from-primary/25 via-transparent to-transparent blur-3xl dark:from-primary/20" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 via-transparent to-transparent blur-3xl dark:from-primary/20" />
      <div
        className={cn(
          "relative flex h-full flex-col pb-6 pt-8 transition-all",
          collapsed ? "px-4" : "px-6"
        )}
      >
        <div className={clsx("flex items-center gap-3", !collapsed && "")}>
          <div className="flex items-center gap-3">
            {collapsed ? (
              <></>
            ) : (
              <div className="transition-all">
                <h1 className="text-lg font-semibold text-foreground">
                  DollarTrack
                </h1>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Smart finance
                </p>
              </div>
            )}
          </div>
          <div
            className={clsx(
              "hidden items-center gap-2 lg:flex",
              collapsed && "flex-col"
            )}
          >
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <ThemeToggle className="h-11 w-11 border-white/70 bg-white/80 text-foreground shadow-none hover:bg-white/90 dark:border-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-900/60" />
              </TooltipTrigger>
              {collapsed ? (
                <TooltipContent side="right">Toggle theme</TooltipContent>
              ) : null}
            </Tooltip>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-white/60 bg-white/70 text-foreground shadow-sm backdrop-blur transition hover:bg-white/90 dark:border-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-900/60"
                  onClick={onToggle}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive =
              (location.pathname == "/app" && item.href == "/") ||
              location.pathname == "/app" + item.href;
            const Icon = item.icon;

            return (
              <Tooltip key={item.name} disableHoverableContent>
                <TooltipTrigger asChild>
                  <Link
                    to={"/app" + item.href}
                    data-testid={`nav-link-${item.name.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center rounded-2xl text-sm font-medium transition-all",
                      collapsed
                        ? "justify-center gap-0 px-2 py-3"
                        : "gap-3 px-4 py-3",
                      isActive
                        ? "bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-white shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-primary shadow-sm backdrop-blur transition-all dark:border-white/10 dark:bg-slate-900/70",
                        isActive &&
                          "border-transparent bg-white/20 text-white shadow-none dark:bg-white/10"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        "ml-3 whitespace-nowrap text-sm transition-all duration-200",
                        collapsed
                          ? "ml-0 w-0 overflow-hidden opacity-0"
                          : "w-auto opacity-100"
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && !collapsed ? (
                      <span className="ml-auto h-2 w-2 rounded-full bg-white/80 shadow" />
                    ) : null}
                  </Link>
                </TooltipTrigger>
                {collapsed ? (
                  <TooltipContent side="right">{item.name}</TooltipContent>
                ) : null}
              </Tooltip>
            );
          })}
        </nav>

        {user ? (
          <div
            className={cn(
              "mt-auto rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur transition-all dark:border-white/10 dark:bg-slate-900/70",
              collapsed && "p-4"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                collapsed && "flex-col gap-2"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                {userInitial.toUpperCase()}
              </div>
              {!collapsed ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              ) : null}
            </div>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "mt-4 w-full justify-center gap-2 rounded-full border-white/60 bg-white/80 text-foreground shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70",
                    collapsed && "mt-3"
                  )}
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed ? "Logout" : null}
                </Button>
              </TooltipTrigger>
              {collapsed ? (
                <TooltipContent side="right">Logout</TooltipContent>
              ) : null}
            </Tooltip>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
