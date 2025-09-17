import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-purple-100 px-6 py-16 text-foreground transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <span className="pointer-events-none absolute -left-44 top-12 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
      <span className="pointer-events-none absolute right-[-8rem] bottom-16 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/25" />
      <Card className="relative z-10 w-full max-w-lg overflow-hidden border border-white/50 bg-gradient-to-br from-white/95 via-white/80 to-white/70 shadow-2xl shadow-primary/20 backdrop-blur-2xl dark:border-white/10 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-900/70">
        <span className="pointer-events-none absolute inset-x-14 -top-20 h-36 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <span className="pointer-events-none absolute inset-x-16 bottom-0 h-36 rounded-full bg-purple-200/20 blur-3xl dark:bg-purple-500/25" />
        <CardHeader className="relative z-10 space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-semibold">Page not found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to where things make sense.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4 text-sm text-muted-foreground">
          <p>
            Double-check the URL, explore the navigation menu, or return to your dashboard to continue managing your finances.
          </p>
          <p>
            Need a hand? Reach out to <a className="font-medium text-primary hover:underline" href="mailto:hello@dollartrack.app">hello@dollartrack.app</a> and we&apos;ll help you find what you need.
          </p>
        </CardContent>
        <CardFooter className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/">
            <a className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500 px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-105 hover:shadow-xl sm:w-auto">
              Back to safety
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
          <Link href="/login">
            <a className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm font-medium text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-primary dark:border-white/15 dark:bg-slate-900/60 dark:hover:text-primary sm:w-auto">
              Go to sign in
            </a>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
