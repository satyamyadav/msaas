import Link from "next/link";

import { getModuleCopy, getEnabledModules } from "@lib/feature-flags";

const ROUTE_LOOKUP: Record<string, string> = {
  auth: "/sign-in",
  "billing-stripe": "/billing",
};

export function ModulesOverview() {
  const enabledModules = getEnabledModules();

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 pt-10 sm:grid-cols-2 lg:grid-cols-3">
      {enabledModules.map((moduleKey) => {
        const moduleConfig = getModuleCopy(moduleKey);
        const href = ROUTE_LOOKUP[moduleKey] ?? "/";

        return (
          <Link
            key={moduleKey}
            href={href}
            className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-primary">
                {moduleConfig.displayName}
              </span>
              <p className="text-sm text-muted-foreground">{moduleConfig.description}</p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-medium">
              <span>Explore module</span>
              <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
