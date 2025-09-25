import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { navigation } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import {
  Menu,
  Sparkles,
  LogOut,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser, currentUserQueryKey } from "@/hooks/use-current-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/lib/errors";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();

  const userInitial = user?.name?.[0] ?? user?.email?.[0] ?? "";

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryKey, null);
      queryClient.clear();
      toast({ title: "You have been logged out" });
      setOpen(false);
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

  const handleNavigate = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/60 bg-white/90 px-4 py-4 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/75 md:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full border border-white/60 bg-white/80 text-foreground shadow-sm transition hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-900/60"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              DollarTrack
            </p>
            <p className="text-sm text-muted-foreground/80">Budget smarter. Live better.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddExpenseModal>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full border border-primary/20 bg-primary text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
              aria-label="Add expense"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </AddExpenseModal>
          <ThemeToggle className="h-11 w-11 rounded-full border border-white/60 bg-white/80 text-foreground shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-900/60" />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[320px] flex-col gap-6 border-white/40 bg-white/95 px-0 pb-8 pt-10 text-foreground backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90"
        >
          <SheetHeader className="px-6 text-left">
            <SheetTitle className="flex items-center gap-3 text-base font-semibold">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-lg shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                {userInitial || <Sparkles className="h-5 w-5" />}
              </span>
              <span className="flex flex-col">
                <span>{user?.name || "Welcome back"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || "Stay on budget effortlessly"}
                </span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <nav className="flex flex-col gap-1 px-4">
              {navigation.map((item) => {
                const href = "/app" + item.href;
                const isActive =
                  (location.pathname === "/app" && item.href === "/") ||
                  location.pathname === href;
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleNavigate(href)}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl border border-transparent bg-white/40 px-4 py-4 text-left text-sm font-medium text-muted-foreground backdrop-blur transition dark:bg-white/5",
                      isActive &&
                        "border-primary/40 bg-primary/10 text-foreground shadow-md shadow-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-primary shadow-sm transition dark:border-white/10 dark:bg-slate-900/70">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>{item.name}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </button>
                );
              })}
            </nav>
            <Separator className="mx-6 border-white/60 dark:border-white/10" />
            <div className="flex flex-col gap-3 px-6">
              <AddExpenseModal>
                <Button className="w-full gap-2 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </AddExpenseModal>
              <Button
                variant="ghost"
                className="w-full gap-2 rounded-2xl border border-white/60 bg-white/80 text-muted-foreground backdrop-blur transition hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/70 dark:text-foreground"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
