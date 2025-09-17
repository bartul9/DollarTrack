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
import { currentUserQueryKey, supabaseUserToPublicUser } from "@/hooks/use-current-user";
import { registerUserSchema } from "@shared/schema";

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
        throw new Error("Registration successful. Please confirm your email address before signing in.");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-purple-100 px-4 py-16 text-foreground transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <span className="pointer-events-none absolute -left-40 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
      <span className="pointer-events-none absolute right-[-6rem] bottom-12 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/20" />
      <Card className="relative z-10 w-full max-w-lg overflow-hidden border border-white/50 bg-gradient-to-br from-white/95 via-white/80 to-white/70 shadow-2xl shadow-primary/20 backdrop-blur-2xl dark:border-white/10 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-900/70">
        <span className="pointer-events-none absolute inset-x-14 -top-20 h-36 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <span className="pointer-events-none absolute inset-x-16 bottom-0 h-36 rounded-full bg-purple-200/20 blur-3xl dark:bg-purple-500/20" />
        <CardHeader className="relative z-10 space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Get started with smarter money tracking in minutes.
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
                htmlFor="name"
              >
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
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="pl-10"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters, mixing letters and numbers.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="confirmPassword"
              >
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
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.confirmPassword.message}
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
              {mutation.isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="relative z-10 flex flex-col items-start gap-4 text-sm text-muted-foreground">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              Already have an account?
            </span>
            <Link href="/login">
              <a className="font-medium text-primary hover:underline">
                Sign in
              </a>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            By creating an account you agree to our imaginary terms and promise
            to stay awesome.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

