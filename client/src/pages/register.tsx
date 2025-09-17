import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { AlertCircle, Lock, Mail, User as UserIcon } from "lucide-react";

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
import {
  currentUserQueryKey,
  supabaseUserToPublicUser,
} from "@/hooks/use-current-user";
import { registerUserSchema } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";

const formSchema = registerUserSchema
  .extend({
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof formSchema>;

type RegisterPayload = Omit<RegisterFormValues, "confirmPassword">;

export default function Register() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async (values: RegisterPayload) => {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error(
          "Registration successful. Please confirm your email address before signing in."
        );
      }

      return supabaseUserToPublicUser(data.user);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserQueryKey, user);
      toast({
        title: "Account created",
        description: `Welcome to DollarTrack, ${user.name}!`,
      });
      setFormError(null);
      setLocation("/app");
    },
    onError: (error) => {
      setFormError(extractErrorMessage(error));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setFormError(null);
    const { confirmPassword, ...payload } = values;
    mutation.mutate(payload);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-foreground transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),_transparent_58%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.45),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.85),_transparent_70%)]" />
      <div className="pointer-events-none absolute -left-28 top-28 h-[22rem] w-[22rem] rounded-full bg-sky-200/55 blur-3xl animate-float-slow dark:bg-sky-500/25" />
      <div className="pointer-events-none absolute right-[-14rem] bottom-[-8rem] h-[24rem] w-[24rem] rounded-full bg-purple-200/45 blur-3xl animate-float-slower dark:bg-purple-600/25" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              DollarTrack
            </p>
            <p className="text-sm text-muted-foreground/80">
              Build a calmer relationship with money.
            </p>
          </div>
          <ThemeToggle className="h-10 w-10 rounded-full border border-primary/20 bg-white/80 text-foreground shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70" />
        </header>

        <div className="relative flex flex-1 items-center justify-center">
          <div className="pointer-events-none absolute -left-10 top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/22" />
          <div className="pointer-events-none absolute right-2 bottom-0 h-64 w-64 rounded-full bg-purple-300/25 blur-3xl dark:bg-purple-500/20" />
          <Card className="relative w-full max-w-xl overflow-hidden border border-white/70 bg-white/85 shadow-[0_40px_125px_rgba(124,58,237,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75">
            <span className="pointer-events-none absolute -top-24 right-[-6rem] h-40 w-40 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
            <CardHeader className="relative z-10 space-y-1">
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription>Get started with smarter money tracking in minutes.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="name">
                    Full name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Alex Johnson"
                      autoComplete="name"
                      className="pl-10"
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name ? (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
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
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="pl-10"
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password ? (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Use at least 8 characters, mixing letters and numbers.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="pl-10"
                      {...form.register("confirmPassword")}
                    />
                  </div>
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  ) : null}
                </div>

                {formError ? (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                ) : null}

                <Button type="submit" className="w-full rounded-full shadow-md shadow-primary/20" disabled={mutation.isLoading}>
                  {mutation.isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="relative z-10 flex flex-col items-start gap-4 text-sm text-muted-foreground">
              <div className="flex w-full items-center justify-between gap-2">
                <span>Already have an account?</span>
                <Link href="/login">
                  <a className="font-medium text-primary hover:underline">Sign in</a>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                By creating an account you agree to our imaginary terms and promise to stay awesome.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );

}
