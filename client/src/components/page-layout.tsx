import { Link } from "react-router-dom";
import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface PageLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  headerContent?: ReactNode;
  children: ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

export function PageLayout({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  headerContent,
  children,
  className,
  showThemeToggle = true,
}: PageLayoutProps) {
  const childrenArray = Children.toArray(children);
  const actionArray = actions ? Children.toArray(actions) : [];

  return (
    <div className={cn("relative space-y-12 pb-20", className)}>
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-primary/12 via-transparent to-transparent dark:from-primary/20" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-60 w-[85%] -translate-x-1/2 rounded-[5rem] bg-gradient-to-r from-indigo-300/15 via-primary/10 to-purple-300/15 blur-3xl dark:from-indigo-500/20 dark:via-primary/15 dark:to-purple-500/20" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-white/92 via-white/70 to-white/40 px-5 py-8 shadow-xl shadow-primary/10 backdrop-blur-2xl transition-colors sm:px-6 dark:border-white/10 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/35">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_60%)] opacity-80 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),_transparent_65%)]" />
        <div className="pointer-events-none absolute -top-24 -left-12 h-56 w-56 rounded-full bg-primary/25 blur-3xl opacity-70 dark:bg-primary/35" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl opacity-70 dark:bg-purple-500/25" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex items-center gap-2"
                    >
                      {item.href && !isLast ? (
                        <Link
                          to={item.href}
                          className="transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className={cn(
                            "text-muted-foreground",
                            isLast && "text-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                      {!isLast ? <span className="opacity-50">/</span> : null}
                    </div>
                  );
                })}
              </nav>
            ) : null}
            <div className="space-y-3">
              {eyebrow ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                  {eyebrow}
                </span>
              ) : null}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {actionArray.length > 0 ? (
            <div className="flex flex-wrap items-center justify-start gap-3 self-start sm:justify-end">
              {actionArray.map((action, index) => (
                <div key={`page-action-${index}`} className="flex-shrink-0">
                  {action}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {headerContent ? (
          <div className="relative mt-8 space-y-6 sm:space-y-8">
            {headerContent}
          </div>
        ) : null}
      </section>

      <div className="relative space-y-10">
        {childrenArray.map((child, index) => (
          <div key={(child as { key?: string })?.key ?? `page-section-${index}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
