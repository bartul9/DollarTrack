import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          "flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-base text-foreground shadow-sm backdrop-blur placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900/50",
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
