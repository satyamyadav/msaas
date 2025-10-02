import { DomainStatus } from "@prisma/client";

import { prisma } from "@lib/db";
import { randomId } from "@lib/utils";

import { getPlanLimits, getOrganizationPlanTier } from "./links";
import { markChecklistStep, recordOrganizationActivity } from "./organizations";

type RequestDomainInput = {
  organizationId: string;
  domain: string;
  actorId: string;
};

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase();
}

export async function requestCustomDomain({ organizationId, domain, actorId }: RequestDomainInput) {
  const normalizedDomain = normalizeDomain(domain);
  const planTier = await getOrganizationPlanTier(organizationId);
  const limits = getPlanLimits(planTier);

  if (!limits.allowCustomDomains) {
    throw new Error("PLAN_CUSTOM_DOMAIN_NOT_ALLOWED");
  }

  if (limits.customDomainAllowance !== null) {
    const count = await prisma.customDomain.count({ where: { organizationId } });
    if (count >= limits.customDomainAllowance) {
      throw new Error("PLAN_CUSTOM_DOMAIN_LIMIT");
    }
  }

  const existing = await prisma.customDomain.findUnique({ where: { domain: normalizedDomain } });
  if (existing && existing.organizationId !== organizationId) {
    throw new Error("DOMAIN_ALREADY_IN_USE");
  }

  const verificationToken = `msaas-${randomId(24)}`;

  const record = await prisma.customDomain.upsert({
    where: {
      domain: normalizedDomain,
    },
    update: {
      status: DomainStatus.PENDING,
      verificationToken,
    },
    create: {
      organizationId,
      domain: normalizedDomain,
      verificationToken,
    },
  });

  await markChecklistStep(organizationId, "configuredDomain");
  await recordOrganizationActivity(organizationId, actorId, "domain.requested", `Custom domain requested: ${normalizedDomain}`);

  return record;
}

export async function verifyCustomDomain(domainId: string) {
  return prisma.customDomain.update({
    where: { id: domainId },
    data: {
      status: DomainStatus.VERIFIED,
      verifiedAt: new Date(),
    },
  });
}

export function listOrganizationDomains(organizationId: string) {
  return prisma.customDomain.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteCustomDomain(domainId: string, actorId: string) {
  const domain = await prisma.customDomain.delete({ where: { id: domainId } });
  await recordOrganizationActivity(domain.organizationId, actorId, "domain.deleted", `Custom domain removed: ${domain.domain}`);
  return domain;
}
