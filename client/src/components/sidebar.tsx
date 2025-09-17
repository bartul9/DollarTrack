import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  LogOut,
  Settings,
  AlbumIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Sidebar as SidebarPrimitive,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, currentUserQueryKey } from "@/hooks/use-current-user";
import { supabase } from "@/lib/supabase";
import { extractErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

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
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = state === "collapsed";

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
    <SidebarPrimitive
      collapsible="icon"
      className="relative z-40 hidden border-r border-white/60 bg-white/85 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-slate-950/70 md:flex"
    >
      {!isMobile && <SidebarRail />}
      <span className="pointer-events-none absolute inset-x-4 top-6 h-32 rounded-3xl bg-gradient-to-b from-primary/25 via-transparent to-transparent blur-3xl dark:from-primary/20" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 via-transparent to-transparent blur-3xl dark:from-primary/20" />

      <div className="relative flex h-full flex-col px-4 pb-6 pt-8">
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            isCollapsed && "flex-col items-center gap-6"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "flex-col items-center gap-2"
            )}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold uppercase tracking-[0.28em] text-primary shadow-sm">
              DT
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-foreground">DollarTrack</h1>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Smart finance
                </p>
              </div>
            )}
          </div>
          <div
            className={cn(
              "hidden items-center gap-2 md:flex",
              isCollapsed && "flex-col"
            )}
          >
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-foreground shadow-none transition hover:bg-white/90 dark:border-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-900/60"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            <ThemeToggle
              className={cn(
                "h-11 w-11 border-white/70 bg-white/80 text-foreground shadow-none hover:bg-white/90 dark:border-white/20 dark:bg-slate-900/70 dark:hover:bg-slate-900/60",
                isCollapsed && "mt-2"
              )}
            />
          </div>
        </div>

        <nav
          className={cn(
            "mt-10 flex flex-1 flex-col gap-2 overflow-y-auto",
            isCollapsed && "mt-8 items-center gap-3"
          )}
        >
          {navigation.map((item) => {
            const isActive =
              (location.pathname === "/app" && item.href === "/") ||
              location.pathname === "/app" + item.href;
            const Icon = item.icon;

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    to={"/app" + item.href}
                    data-testid={`nav-link-${item.name.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                    title={isCollapsed ? item.name : undefined}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    className={cn(
                      "group/nav relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-white shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10",
                      isCollapsed &&
                        "justify-center px-0 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-primary shadow-sm backdrop-blur transition-colors dark:border-white/10 dark:bg-slate-900/70",
                        isActive &&
                          "border-transparent bg-white/20 text-white shadow-none dark:bg-white/10",
                        isCollapsed && "h-11 w-11"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                    {isActive && !isCollapsed ? (
                      <span className="ml-auto h-2 w-2 rounded-full bg-white/80 shadow" />
                    ) : null}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  hidden={!isCollapsed}
                >
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {user ? (
          <div
            className={cn(
              "mt-6 rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur transition-colors dark:border-white/10 dark:bg-slate-900/70",
              isCollapsed && "flex flex-col items-center gap-3 p-4"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "flex-col gap-2 text-center"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                {userInitial.toUpperCase()}
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isCollapsed ? "icon" : "sm"}
                  aria-label="Logout"
                  className={cn(
                    "mt-4 w-full justify-center gap-2 rounded-full border-white/60 bg-white/80 text-foreground shadow-sm transition-colors hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/70",
                    isCollapsed &&
                      "h-11 w-11 rounded-2xl border-white/40 bg-white/75 p-0"
                  )}
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && "Logout"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" hidden={!isCollapsed}>
                Logout
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>
    </SidebarPrimitive>
  );
}
