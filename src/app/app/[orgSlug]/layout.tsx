import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { AppShell } from "@components/app/app-shell";
import { getOrganizationsForUser, getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

type Params = Promise<{ orgSlug: string }>;

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(`/app/${orgSlug}`)}`);
  }

  const memberships = await getOrganizationsForUser(user.id);
  if (!memberships.length) {
    redirect("/app/new");
  }

  const active = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!active) {
    notFound();
  }

  const organizations = memberships.map((entry) => ({
    organization: {
      id: entry.organization.id,
      name: entry.organization.name,
      slug: entry.organization.slug,
      planTier: entry.organization.planTier,
      logoUrl: entry.organization.logoUrl ?? null,
    },
    membership: {
      id: entry.membership.id,
      role: entry.membership.role,
    },
  }));

  const activeMembership = organizations.find((entry) => entry.organization.id === active.organization.id);

  return (
    <AppShell
      user={user}
      organizations={organizations}
      activeOrganization={
        activeMembership ?? {
          organization: {
            id: active.organization.id,
            name: active.organization.name,
            slug: active.organization.slug,
            planTier: active.organization.planTier,
            logoUrl: active.organization.logoUrl ?? null,
          },
          membership: {
            id: active.membership.id,
            role: active.membership.role,
          },
        }
      }
    >
      {children}
    </AppShell>
  );
}
