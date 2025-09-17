import * as React from "react";
import {
  Dialog as DialogPrimitive,
  DialogContent as DialogPrimitiveContent,
  DialogTrigger as DialogPrimitiveTrigger,
  DialogHeader as DialogPrimitiveHeader,
  DialogTitle as DialogPrimitiveTitle,
  DialogDescription as DialogPrimitiveDescription,
  DialogFooter as DialogPrimitiveFooter,
  DialogClose as DialogPrimitiveClose,
  type DialogProps as DialogPrimitiveProps,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const baseContentClasses =
  "group/modal sm:max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-3xl dark:border-slate-800/60 dark:bg-slate-950/85";

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitiveContent> {
  containerClassName?: string;
}

const Modal = DialogPrimitive;
const ModalTrigger = DialogPrimitiveTrigger;

const ModalClose = DialogPrimitiveClose;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitiveContent>,
  ModalContentProps
>(({ className, containerClassName, children, ...props }, ref) => (
  <DialogPrimitiveContent
    ref={ref}
    className={cn(baseContentClasses, className)}
    {...props}
  >
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/25 opacity-90 dark:from-primary/10 dark:via-transparent dark:to-primary/20" />
      <div className={cn("relative px-8 py-7", containerClassName)}>{children}</div>
    </div>
  </DialogPrimitiveContent>
));
ModalContent.displayName = DialogPrimitiveContent.displayName;

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogPrimitiveHeader
    className={cn(
      "space-y-2 text-left",
      "[&>p]:text-base [&>p]:text-muted-foreground",
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitiveTitle>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitiveTitle>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitiveTitle
    ref={ref}
    className={cn(
      "text-3xl font-semibold tracking-tight text-foreground",
      "drop-shadow-sm",
      className
    )}
    {...props}
  >
    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
      {children}
    </span>
  </DialogPrimitiveTitle>
));
ModalTitle.displayName = DialogPrimitiveTitle.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitiveDescription>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitiveDescription>
>(({ className, ...props }, ref) => (
  <DialogPrimitiveDescription
    ref={ref}
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitiveDescription.displayName;

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogPrimitiveFooter
    className={cn(
      "mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

export type ModalProps = DialogPrimitiveProps;

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
};
