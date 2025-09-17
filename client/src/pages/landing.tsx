import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo } from "react";

const features = [
  {
    title: "Actionable insights",
    description:
      "Understand your spending patterns with clear visualizations and personalized highlights.",
    icon: TrendingUp,
  },
  {
    title: "Secure by default",
    description:
      "Your data stays private with encrypted sessions and privacy-first design decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Made for everyday budgets",
    description:
      "Organize expenses by category, set goals, and celebrate the wins that matter to you.",
    icon: Wallet,
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-foreground transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              DollarTrack
            </p>
            <p className="text-sm text-muted-foreground/80">
              Budget smarter. Live better.
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          <a className="hidden rounded-full border border-transparent px-4 py-2 transition hover:text-foreground md:inline" href="#features">
            Features
          </a>
          <Link href="/login">
            <a className="rounded-full border border-white/70 px-4 py-2 transition hover:border-primary/40 hover:text-foreground dark:border-white/10">
              Sign in
            </a>
          </Link>
          <Button size="sm" className="gap-2 rounded-full" onClick={() => setLocation("/register")}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <ThemeToggle className="h-10 w-10 border border-white/70 bg-white/80 text-foreground shadow-none hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70" />
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-20 pt-10 md:pt-20">
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              Modern finance companion
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Take control of your spending with clarity and confidence.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              DollarTrack helps you stay ahead of every transaction, forecast upcoming costs, and make decisions that align with your goals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2 rounded-full" onClick={() => setLocation("/register")}>
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                onClick={() => setLocation("/login")}
              >
                Sign in to dashboard
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Try the demo account: <span className="font-semibold text-foreground">demo@dollartrack.app</span> / <span className="font-semibold text-foreground">Password123!</span>
            </p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/70">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-6 dark:border-white/10 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Weekly report
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                $2,840 saved this month
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Stay on track with digestible summaries, automated reminders, and beautifully simple analytics.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        {feature.title}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/65">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground backdrop-blur md:flex-row">
          <p>&copy; {currentYear} DollarTrack. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="transition hover:text-foreground" href="#features">
              Explore features
            </a>
            <a className="transition hover:text-foreground" href="mailto:hello@dollartrack.app">
              Say hello
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
