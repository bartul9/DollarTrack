import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { currentUserQueryKey, supabaseUserToPublicUser } from "@/hooks/use-current-user";
import { loginSchema } from "@shared/schema";

const formSchema = loginSchema;
type LoginFormValues = z.infer<typeof formSchema>;

export default function Login() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword(values);

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error("Login succeeded but no active session was returned.");
      }

      return supabaseUserToPublicUser(data.user);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserQueryKey, user);
      toast({
        title: "Welcome back",
        description: `Good to see you, ${user.name}!`,
      });
      setFormError(null);
      setLocation("/app");
    },
    onError: (error) => {
      setFormError(extractErrorMessage(error));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    mutation.mutate(values);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-purple-100 px-4 py-16 text-foreground transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <span className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
      <span className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/20" />
      <Card className="relative z-10 w-full max-w-md overflow-hidden border border-white/50 bg-gradient-to-br from-white/95 via-white/80 to-white/70 shadow-2xl shadow-primary/20 backdrop-blur-2xl dark:border-white/10 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-900/70">
        <span className="pointer-events-none absolute inset-x-10 -top-16 h-32 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <span className="pointer-events-none absolute inset-x-12 bottom-0 h-32 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/20" />
        <CardHeader className="relative z-10 space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to access your finance dashboard and stay on top of every transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="pl-10"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="relative z-10 flex flex-col items-start gap-4 text-sm text-muted-foreground">
          <div className="flex w-full items-center justify-between gap-2 text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              New to DollarTrack?
            </span>
            <Link href="/register">
              <a className="font-medium text-primary hover:underline">
                Create an account
              </a>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo account:{" "}
            <span className="font-medium text-foreground">
              demo@dollartrack.app
            </span>{" "}
            / <span className="font-medium text-foreground">Password123!</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

