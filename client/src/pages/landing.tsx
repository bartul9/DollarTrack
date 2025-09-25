import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.1),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.85),_transparent_72%)]" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-transparent to-transparent blur-3xl opacity-80 dark:from-primary/35" />
      <div className="pointer-events-none absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/25" />
      <div className="pointer-events-none absolute -right-20 bottom-[-9rem] h-[24rem] w-[24rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-600/20" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 pb-6 sm:pb-24 pt-10 sm:px-6 md:gap-20 md:pt-12">
        <section className="relative grid gap-10 overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/90 p-6 shadow-[0_32px_90px_rgba(124,58,237,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 md:grid-cols-[1.05fr,0.95fr] md:items-center md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.16),_transparent_58%)] opacity-80 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_60%)]" />
          <div className="pointer-events-none absolute -top-20 right-[-6rem] h-[16rem] w-[16rem] rounded-full bg-primary/20 blur-3xl opacity-80 dark:bg-primary/25" />

          <div className="relative z-10 space-y-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary backdrop-blur dark:border-primary/30 dark:bg-primary/15">
              Modern finance companion
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Take control of your spending with clarity and confidence.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              DollarTrack helps you stay ahead of every transaction, forecast
              upcoming costs, and make decisions that align with your goals.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Button
                size="lg"
                className="gap-2 rounded-full shadow-lg shadow-primary/20"
                onClick={() => navigate("/register")}
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border border-primary/30 bg-primary/5 text-primary shadow-sm transition hover:bg-primary/10"
                onClick={() => navigate("/login")}
              >
                Sign in to dashboard
              </Button>
            </div>
          </div>

          <div className="relative z-10 ">
            <div className="pointer-events-none absolute -top-16 right-[-3rem] h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-70 dark:bg-primary/25" />
            <div className="relative space-y-6 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-inner shadow-primary/10 dark:border-white/10 dark:bg-slate-900/65">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Weekly report
              </p>
              <h2 className="text-3xl font-semibold text-foreground">
                $2,840 saved this month
              </h2>
              <p className="text-sm text-muted-foreground">
                Stay on track with digestible summaries, automated reminders,
                and beautifully simple analytics.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:auto-rows-[1fr]">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="group flex h-full flex-col items-center rounded-xl border border-white/70 bg-white/80 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 sm:items-start sm:text-left"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary group-hover:bg-primary/20">
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
      </main>

      <footer className="relative z-10 border-t border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {currentYear} DollarTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
