import { PlatformRole, OrganizationStatus, UserStatus } from "@prisma/client";

import { prisma } from "@lib/db";

import { getPricingConfig } from "./platform-settings";

export type PlatformMetrics = {
  mrr: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  activeUsers: number;
  churnRate: number;
  admins: number;
};

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const [pricingConfig, organizations, users, subscriptions] = await Promise.all([
    getPricingConfig(),
    prisma.organization.findMany({ select: { status: true } }),
    prisma.authUser.findMany({ select: { status: true, platformRole: true } }),
    prisma.billingSubscription.findMany({ select: { planTier: true } }),
  ]);

  const planPriceMap = new Map<string, number>();
  pricingConfig.plans.forEach((plan) => {
    planPriceMap.set(plan.id.toUpperCase(), plan.price);
  });

  const mrr = subscriptions.reduce((total, subscription) => {
    const key = subscription.planTier.toString();
    return total + (planPriceMap.get(key) ?? 0);
  }, 0);

  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter((org) => org.status === OrganizationStatus.ACTIVE).length;
  const suspendedOrganizations = organizations.filter((org) => org.status === OrganizationStatus.SUSPENDED).length;
  const activeUsers = users.filter((user) => user.status === UserStatus.ACTIVE).length;
  const adminRoles = new Set<PlatformRole>([PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN]);
  const admins = users.filter((user) => adminRoles.has(user.platformRole)).length;

  const churnRate = totalOrganizations === 0 ? 0 : suspendedOrganizations / totalOrganizations;

  return { mrr, activeOrganizations, suspendedOrganizations, activeUsers, churnRate, admins };
}
