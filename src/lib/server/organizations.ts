import { MemberRole, MemberStatus, PlanTier, Prisma } from "@prisma/client";

import { prisma } from "@lib/db";
import { slugify } from "@lib/utils";

export async function generateOrganizationSlug(name: string) {
  const base = slugify(name);
  let candidate = base;
  let attempt = 1;

  while (true) {
    const existing = await prisma.organization.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return candidate;
    }
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

type CreateOrganizationParams = {
  userId: string;
  name: string;
  slug?: string;
  planTier?: PlanTier;
  logoUrl?: string | null;
};

export async function createOrganizationWithOwner({
  userId,
  name,
  slug,
  planTier = PlanTier.FREE,
  logoUrl,
}: CreateOrganizationParams) {
  const resolvedSlug = slug ? slugify(slug) : await generateOrganizationSlug(name);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name,
        slug: resolvedSlug,
        planTier,
        logoUrl: logoUrl ?? undefined,
        members: {
          create: {
            userId,
            role: MemberRole.OWNER,
            status: MemberStatus.ACTIVE,
          },
        },
        quickstart: {
          create: {},
        },
        auditLogs: {
          create: {
            actorId: userId,
            action: "organization.created",
            description: `Organization created by user ${userId}`,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return organization;
  });
}

export async function getOrganizationsForUser(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
      status: MemberStatus.ACTIVE,
      organization: {
        deletedAt: null,
      },
    },
    include: {
      organization: true,
    },
    orderBy: {
      organization: {
        createdAt: "asc",
      },
    },
  });

  return memberships.map((membership) => ({
    organization: membership.organization,
    membership,
  }));
}

export async function getOrganizationBySlugForUser(slug: string, userId: string) {
  const organization = await prisma.organization.findFirst({
    where: {
      slug,
      deletedAt: null,
      members: {
        some: {
          userId,
          status: MemberStatus.ACTIVE,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      quickstart: true,
    },
  });

  if (!organization) {
    return null;
  }

  const membership = organization.members.find((member) => member.userId === userId);
  if (!membership) {
    return null;
  }

  return {
    organization,
    membership,
  };
}

type UpdateOrganizationInput = {
  organizationId: string;
  name?: string;
  primaryDomain?: string | null;
  logoUrl?: string | null;
  planTier?: PlanTier;
};

export async function updateOrganizationSettings({ organizationId, name, primaryDomain, logoUrl, planTier }: UpdateOrganizationInput) {
  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      name,
      primaryDomain,
      logoUrl: logoUrl ?? undefined,
      planTier,
    },
  });
}

export async function recordOrganizationActivity(organizationId: string, actorId: string | null, action: string, description?: string, metadata?: Prisma.JsonValue) {
  await prisma.auditLog.create({
    data: {
      organizationId,
      actorId: actorId ?? undefined,
      action,
      description,
      metadata: metadata ?? undefined,
    },
  });
}

type ChecklistStep = "createdFirstLink" | "invitedTeam" | "configuredDomain" | "viewedAnalytics";

type ChecklistRecord = {
  id: string;
  createdFirstLinkAt: Date | null;
  invitedTeamAt: Date | null;
  configuredDomainAt: Date | null;
  viewedAnalyticsAt: Date | null;
  completedAt: Date | null;
};

const CHECKLIST_FIELD_MAP: Record<ChecklistStep, keyof Pick<ChecklistRecord, "createdFirstLinkAt" | "invitedTeamAt" | "configuredDomainAt" | "viewedAnalyticsAt" | "completedAt">> = {
  createdFirstLink: "createdFirstLinkAt",
  invitedTeam: "invitedTeamAt",
  configuredDomain: "configuredDomainAt",
  viewedAnalytics: "viewedAnalyticsAt",
};

export async function markChecklistStep(organizationId: string, step: ChecklistStep) {
  const field = CHECKLIST_FIELD_MAP[step];
  const now = new Date();

  const existing = await prisma.quickStartChecklist.findUnique({ where: { organizationId } });
  if (!existing) {
    await prisma.quickStartChecklist.create({
      data: {
        organizationId,
        [field]: now,
      },
    });
    return;
  }

  if ((existing as ChecklistRecord)[field]) {
    return;
  }

  const updates: Partial<Record<typeof field, Date>> = { [field]: now };
  const allStepsCompleted = Object.entries(CHECKLIST_FIELD_MAP).every(([, value]) => {
    if (value === field) {
      return true;
    }
    return Boolean((existing as ChecklistRecord)[value]);
  });

  await prisma.quickStartChecklist.update({
    where: { id: existing.id },
    data: {
      ...updates,
      completedAt: allStepsCompleted ? now : existing.completedAt ?? undefined,
    },
  });
}

export function isOwnerOrAdmin(membership: { role: MemberRole }) {
  return membership.role === MemberRole.OWNER || membership.role === MemberRole.ADMIN;
}

export function assertCanManageBilling(membership: { role: MemberRole }) {
  if (!isOwnerOrAdmin(membership)) {
    throw new Error("FORBIDDEN_BILLING_ACCESS");
  }
}

export async function softDeleteOrganization(organizationId: string) {
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      deletedAt: new Date(),
    },
  });
}
