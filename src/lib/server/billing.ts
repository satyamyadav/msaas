import { PlanTier } from "@prisma/client";

import { prisma } from "@lib/db";

import { getPlanLimits } from "./links";

export type BillingOverview = {
  planTier: PlanTier;
  limits: ReturnType<typeof getPlanLimits>;
  subscription: {
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    customerId: string;
    priceId: string;
  } | null;
};

export async function getBillingOverview(organizationId: string): Promise<BillingOverview> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      planTier: true,
      subscriptions: true,
    },
  });

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  const subscription = organization.subscriptions[0] ?? null;

  return {
    planTier: organization.planTier,
    limits: getPlanLimits(organization.planTier),
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          customerId: subscription.customerId,
          priceId: subscription.priceId,
        }
      : null,
  };
}

type SubscriptionUpdateInput = {
  organizationId: string;
  planTier: PlanTier;
  status: string;
  priceId: string;
  customerId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
};

export async function upsertSubscription({
  organizationId,
  planTier,
  status,
  priceId,
  customerId,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
}: SubscriptionUpdateInput) {
  const subscription = await prisma.billingSubscription.upsert({
    where: {
      organizationId,
    },
    update: {
      status,
      priceId,
      customerId,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      planTier,
    },
    create: {
      organizationId,
      status,
      priceId,
      customerId,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      planTier,
    },
  });

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      planTier,
    },
  });

  return subscription;
}

export async function downgradeToFree(organizationId: string) {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      planTier: PlanTier.FREE,
    },
  });

  await prisma.billingSubscription.deleteMany({ where: { organizationId } });
}
