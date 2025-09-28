"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xl transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 dark:bg-slate-950/70",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "group fixed left-1/2 top-1/2 z-50 w-[min(95vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-0 text-slate-900 shadow-[0_32px_80px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur-2xl transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-90 dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100 dark:ring-white/10",
        "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/90 before:via-white/40 before:to-white/20 before:opacity-70 before:blur-3xl before:content-[''] dark:before:from-slate-900/70 dark:before:via-slate-900/40 dark:before:to-slate-900/20",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.25),transparent_65%)] opacity-70 dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.3),transparent_70%)]" />
      <div className="relative z-10 flex flex-col gap-6 p-8 pr-12 sm:pr-14">
        <DialogPrimitive.Close
          className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-500 shadow-sm transition hover:-translate-y-[1px] hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        {children}
      </div>
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2 text-left",
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xl font-semibold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
