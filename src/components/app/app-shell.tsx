import { ReactNode } from "react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { AppContextProvider } from "@components/app/app-context";
import { ActiveOrganizationProvider } from "@components/app/active-organization-context";

import { OrganizationSwitcher } from "./organization-switcher";
import { AppSidebar } from "./app-sidebar";

import { getBillingOverview } from "@lib/server/billing";

import { signOutAction } from "@modules/auth/actions";

import type { MemberRole, PlanTier } from "@prisma/client";

type OrganizationSummary = {
  organization: {
    id: string;
    name: string;
    slug: string;
    planTier: PlanTier;
    logoUrl: string | null;
  };
  membership: {
    id: string;
    role: MemberRole;
  };
};

type AppShellProps = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
  organizations: OrganizationSummary[];
  activeOrganization: OrganizationSummary;
  children: ReactNode;
  actions?: ReactNode;
};

function PlanBadge({ planTier }: { planTier: PlanTier }) {
  const variants: Record<PlanTier, { label: string; tone: string }> = {
    FREE: { label: "Free plan", tone: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
    PRO: { label: "Pro plan", tone: "bg-amber-500/90 text-white" },
  };
  const variant = variants[planTier];
  return <Badge className={variant.tone}>{variant.label}</Badge>;
}

export async function AppShell({
  user,
  organizations,
  activeOrganization,
  children,
  actions,
}: AppShellProps) {
  const billing = await getBillingOverview(activeOrganization.organization.id).catch(() => null);

  return (
    <AppContextProvider value={{ user, organizations }}>
      <ActiveOrganizationProvider value={activeOrganization}>
        <div className="flex min-h-[calc(100vh-4rem)] bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="flex flex-col gap-4 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <OrganizationSwitcher />
                  {billing ? <PlanBadge planTier={billing.planTier} /> : null}
                </div>
                <div className="flex items-center gap-2">
                  {actions}
                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" size="sm">
                      Sign out
                    </Button>
                  </form>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-muted/10 px-6 py-6">{children}</main>
          </div>
        </div>
      </ActiveOrganizationProvider>
    </AppContextProvider>
  );
}
