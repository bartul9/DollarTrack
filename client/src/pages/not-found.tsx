import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-foreground transition-colors">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_56%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.1),_transparent_62%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.38),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.82),_transparent_72%)]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-[20rem] w-[20rem] rounded-full bg-primary/12 blur-3xl dark:bg-primary/22" />
      <div className="pointer-events-none absolute right-[-16rem] bottom-[-10rem] h-[26rem] w-[26rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-600/20" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            DollarTrack
          </p>
          <p className="text-sm text-muted-foreground/80">
            Smart finance for everyday life.
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 p-10 text-center shadow-[0_44px_120px_rgba(124,58,237,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75">
          <span className="pointer-events-none absolute -top-28 right-[-8rem] h-44 w-44 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <AlertCircle className="h-7 w-7" />
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold md:text-4xl">
                We can’t find that page
              </h1>
              <p className="text-base text-muted-foreground">
                The link you followed may be broken, or the page may have been
                removed. Let’s get you back to something helpful.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "justify-center bg-gradient-to-r from-primary via-purple-500 to-indigo-500 shadow-lg shadow-primary/30 hover:brightness-105"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Go to homepage
              </Link>
              <Link
                to="/app"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-center border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 dark:border-white/20 dark:text-slate-100"
                )}
              >
                <Compass className="h-4 w-4" />
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
