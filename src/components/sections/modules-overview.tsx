import Link from "next/link";

import { Badge } from "@components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@components/ui/card";
import { getModuleCopy, getEnabledModules } from "@lib/feature-flags";

const ROUTE_LOOKUP: Record<string, string> = {
  auth: "/sign-in",
  "billing-stripe": "/billing",
};

export function ModulesOverview() {
  const enabledModules = getEnabledModules();

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-20 pt-12 sm:grid-cols-2 lg:grid-cols-3">
      {enabledModules.map((moduleKey) => {
        const moduleConfig = getModuleCopy(moduleKey);
        const href = ROUTE_LOOKUP[moduleKey] ?? "/";

        return (
          <Link key={moduleKey} href={href} className="group">
            <Card className="flex h-full flex-col transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <Badge>{moduleConfig.displayName}</Badge>
                <CardDescription>{moduleConfig.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Explore how this module integrates with auth flows, billing, and workspace management.
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between text-sm font-medium text-primary">
                <span>Open module</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}
