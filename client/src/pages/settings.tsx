import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { fetchSettings, saveSettings } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

const currencyOptions = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
];

const settingsFormSchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  monthlyBudget: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Monthly budget must be a positive number"
    ),
  notificationsEnabled: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const DEFAULT_VALUES: SettingsFormValues = {
  currency: "USD",
  monthlyBudget: "",
  notificationsEnabled: true,
};

export default function Settings() {
  const { data: user } = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const userId = user?.id;

  const settingsQuery = useQuery({
    queryKey: ["settings", userId],
    queryFn: () => fetchSettings(userId!),
    enabled: Boolean(userId),
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      saveSettings(userId!, {
        currency: values.currency,
        monthlyBudget: values.monthlyBudget,
        notificationsEnabled: values.notificationsEnabled,
      }),
    onSuccess: (updated) => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
      settingsQuery.refetch({ throwOnError: false });
      form.reset({
        currency: updated.currency,
        monthlyBudget: updated.monthlyBudget,
        notificationsEnabled: updated.notificationsEnabled,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to update settings",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const isLoading = settingsQuery.isLoading || settingsQuery.isRefetching;

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset({
        currency: settingsQuery.data.currency,
        monthlyBudget: settingsQuery.data.monthlyBudget,
        notificationsEnabled: settingsQuery.data.notificationsEnabled,
      });
    }
  }, [settingsQuery.data, form]);

  const settingsSummary = useMemo(() => {
    if (!settingsQuery.data) return null;

    const monthlyBudget = settingsQuery.data.monthlyBudget;
    return [
      {
        label: "Preferred currency",
        value: settingsQuery.data.currency,
      },
      {
        label: "Monthly budget",
        value:
          monthlyBudget && monthlyBudget.trim().length > 0
            ? new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: settingsQuery.data.currency,
              }).format(Number(monthlyBudget))
            : "Not set",
      },
      {
        label: "Email notifications",
        value: settingsQuery.data.notificationsEnabled ? "Enabled" : "Disabled",
      },
    ];
  }, [settingsQuery.data]);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and personalize your experience.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-white/60 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Preferences
            </CardTitle>
            <CardDescription>
              Configure your default currency, budget goals, and notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading || mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-2xl border border-white/60 bg-white/85 text-base dark:border-white/10 dark:bg-slate-900/70">
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the currency used across analytics and reports.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly budget</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter an amount"
                          className="rounded-2xl border border-white/60 bg-white/85 text-base dark:border-white/10 dark:bg-slate-900/70"
                          disabled={isLoading || mutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank if you do not want to track a monthly spending limit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/60 bg-white/85 p-4 shadow-sm transition-colors dark:border-white/10 dark:bg-slate-900/70">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-base">Email notifications</FormLabel>
                        <FormDescription>
                          Receive summaries and reminders to stay on top of your spending.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || mutation.isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="rounded-full px-6"
                    disabled={mutation.isPending || isLoading || !userId}
                  >
                    {mutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    disabled={mutation.isPending || isLoading}
                    onClick={() =>
                      form.reset(
                        settingsQuery.data
                          ? {
                              currency: settingsQuery.data.currency,
                              monthlyBudget: settingsQuery.data.monthlyBudget,
                              notificationsEnabled:
                                settingsQuery.data.notificationsEnabled,
                            }
                          : DEFAULT_VALUES
                      )
                    }
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Account overview
                </CardTitle>
                <CardDescription>
                  Details from your profile and the latest preferences.
                </CardDescription>
              </div>
              <ThemeToggle className="h-10 w-10 border-white/60 bg-white/80 text-foreground shadow-none hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="text-base font-medium text-foreground">
                  {user?.name ?? "Loading..."}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Separator className="border-white/60 dark:border-white/10" />
              <div className="space-y-3">
                {settingsSummary?.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/50 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/60">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Need help?
              </CardTitle>
              <CardDescription>
                Adjusting your settings helps DollarTrack tailor insights for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Update your currency to match the accounts you monitor, and set a monthly
                budget to keep spending aligned with your goals.
              </p>
              <p>
                Notifications keep you informed about spending spikes and summaries so you never
                miss important trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
