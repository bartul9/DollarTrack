import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import {
  currentUserQueryKey,
  supabaseUserToPublicUser,
} from "@/hooks/use-current-user";
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
  const navigate = useNavigate();

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
      navigate("/app");
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
    <div className="mt-4 sm:mt-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_58%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.08),_transparent_62%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.82),_transparent_72%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/25" />
      <div className="pointer-events-none absolute right-[-10rem] bottom-[-7rem] h-[20rem] w-[20rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-600/20" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col px-5 py-6 sm:px-6">
        <div className="relative flex flex-1 items-center justify-center">
          <div className="pointer-events-none absolute -left-6 top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
          <div className="pointer-events-none absolute right-0 bottom-6 h-52 w-52 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/20" />
          <Card className="relative w-full max-w-md overflow-hidden border border-white/70 bg-white/90 shadow-[0_28px_90px_rgba(124,58,237,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
            <span className="pointer-events-none absolute -top-16 right-[-3rem] h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-70 dark:bg-primary/25" />
            <CardHeader className="relative z-10 space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to access your finance dashboard.
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
                      placeholder="At least 8 characters"
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
                  className="w-full rounded-full shadow-md shadow-primary/20"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="relative z-10 flex flex-col items-start gap-4 text-sm text-muted-foreground">
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                <span>New to DollarTrack?</span>
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Demo account:{" "}
                <span className="font-medium text-foreground">
                  demo@dollartrack.app
                </span>{" "}
                /
                <span className="font-medium text-foreground">
                  {" "}
                  Password123!
                </span>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
