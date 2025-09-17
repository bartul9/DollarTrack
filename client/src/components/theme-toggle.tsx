import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative h-10 w-10 rounded-full border border-border/60 bg-white/60 text-foreground shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white/80 dark:bg-slate-900/60 dark:text-slate-100", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      data-testid="button-toggle-theme"
    >
      <SunMedium className="h-4 w-4 transition-opacity duration-300 dark:opacity-0" />
      <MoonStar className="absolute h-4 w-4 opacity-0 transition-opacity duration-300 dark:opacity-100" />
    </Button>
  );
}

