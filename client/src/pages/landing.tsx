import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo } from "react";

const features = [
  {
    title: "Actionable insights",
    description: "Understand your spending patterns with clear visualizations and personalized highlights.",
    icon: TrendingUp,
  },
  {
    title: "Secure by default",
    description: "Your data stays private with encrypted sessions and privacy-first design decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Made for everyday budgets",
    description: "Organize expenses by category, set goals, and celebrate the wins that matter to you.",
    icon: Wallet,
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">DollarTrack</p>
            <p className="text-sm text-slate-400">Budget smarter. Live better.</p>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <a className="hidden transition hover:text-white md:inline" href="#features">
            Features
          </a>
          <Link href="/login">
            <a className="transition hover:text-white">Sign in</a>
          </Link>
          <Button size="sm" onClick={() => setLocation("/register")} className="gap-2">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-20 pt-10 md:pt-20">
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-slate-200">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Modern finance companion
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Take control of your spending with clarity and confidence.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              DollarTrack helps you stay ahead of every transaction, forecast upcoming costs, and make decisions that align with
              your goals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" onClick={() => setLocation("/register")}>
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setLocation("/login")}
              >
                Sign in to dashboard
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Try the demo account:&nbsp;
              <span className="font-semibold">demo@dollartrack.app</span>
              &nbsp;/&nbsp;
              <span className="font-semibold">Password123!</span>
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-primary/30">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Weekly report</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">$2,840 saved this month</h2>
              <p className="mt-3 text-sm text-slate-300">
                Stay on track with digestible summaries, automated reminders, and beautifully simple analytics.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {features.map(feature => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-white">{feature.title}</p>
                      <p className="mt-2 text-xs text-slate-300">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row">
          <p>© {currentYear} DollarTrack. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-white" href="#features">
              Explore features
            </a>
            <a className="hover:text-white" href="mailto:hello@dollartrack.app">
              Say hello
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
