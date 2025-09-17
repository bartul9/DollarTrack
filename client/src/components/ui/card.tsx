import * as React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

import { cn } from "@/lib/utils";

type CardProps = HTMLMotionProps<"div"> & {
  disableAnimation?: boolean;
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      disableAnimation = false,
      initial,
      animate,
      exit,
      transition,
      ...props
    },
    ref
  ) => (
    <motion.div
      ref={ref}
      layout
      initial={disableAnimation ? false : initial ?? { opacity: 0, y: 20, scale: 0.98 }}
      animate={disableAnimation ? animate : animate ?? { opacity: 1, y: 0, scale: 1 }}
      exit={disableAnimation ? exit : exit ?? { opacity: 0, y: -12, scale: 0.98 }}
      transition={
        disableAnimation
          ? transition
          : transition ?? { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
      }
      className={cn(
        "will-change-auto rounded-3xl border border-white/40 bg-card text-card-foreground shadow-lg shadow-black/5 transition-colors supports-[backdrop-filter:blur(0px)]:backdrop-blur-xl dark:border-white/10",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 px-6 pb-4 pt-6 sm:px-8 sm:pt-8", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6 sm:px-8", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-6 pb-6 pt-0 sm:px-8", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
