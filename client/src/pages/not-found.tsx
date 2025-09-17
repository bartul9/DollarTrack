import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Compass } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-foreground transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.1),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.45),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.85),_transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl animate-float-slow dark:bg-primary/20" />
      <div className="pointer-events-none absolute right-[-18rem] bottom-[-12rem] h-[30rem] w-[30rem] rounded-full bg-purple-200/45 blur-3xl animate-float-slower dark:bg-purple-600/25" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            DollarTrack
          </p>
          <p className="text-sm text-muted-foreground/80">Smart finance for everyday life.</p>
        </div>
        <ThemeToggle className="h-10 w-10 rounded-full border border-primary/20 bg-white/80 text-foreground shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70" />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-10 text-center shadow-[0_44px_120px_rgba(124,58,237,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75">
          <span className="pointer-events-none absolute -top-28 right-[-8rem] h-44 w-44 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <AlertCircle className="h-7 w-7" />
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold md:text-4xl">We can’t find that page</h1>
              <p className="text-base text-muted-foreground">
                The link you followed may be broken, or the page may have been removed. Let’s get you back to something helpful.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/">
                <a
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "justify-center bg-gradient-to-r from-primary via-purple-500 to-indigo-500 shadow-lg shadow-primary/30 hover:brightness-105"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go to homepage
                </a>
              </Link>
              <Link href="/app">
                <a
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "justify-center border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 dark:border-white/20 dark:text-slate-100"
                  )}
                >
                  <Compass className="h-4 w-4" />
                  Open dashboard
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
