import { addMonths, startOfMonth } from "date-fns";

import { LinkStatus, OrganizationStatus, PlanTier, Prisma } from "@prisma/client";

import { prisma } from "@lib/db";
import { hashIdentifier, randomId, slugify } from "@lib/utils";

import { markChecklistStep, recordOrganizationActivity } from "./organizations";

type PlanLimits = {
  linkCreateLimitPerMonth: number | null;
  analyticsLevel: "basic" | "advanced";
  allowCustomDomains: boolean;
  customDomainAllowance: number | null;
};

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  [PlanTier.FREE]: {
    linkCreateLimitPerMonth: 10,
    analyticsLevel: "basic",
    allowCustomDomains: false,
    customDomainAllowance: 0,
  },
  [PlanTier.PRO]: {
    linkCreateLimitPerMonth: null,
    analyticsLevel: "advanced",
    allowCustomDomains: true,
    customDomainAllowance: 3,
  },
};

export function getPlanLimits(plan: PlanTier) {
  return PLAN_LIMITS[plan];
}

type CreateLinkInput = {
  organizationId: string;
  membershipId: string;
  destinationUrl: string;
  slug?: string;
  title?: string | null;
  description?: string | null;
  expiresAt?: Date | null;
  domainId?: string | null;
  tags?: string[];
};

function sanitizeSlug(value: string | undefined | null) {
  if (!value) {
    return randomId(7);
  }
  const slug = slugify(value, { maxLength: 48 });
  return slug || randomId(7);
}

function normalizeTags(tags: string[] = []) {
  const set = new Set<string>();
  tags.forEach((tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed) {
      set.add(trimmed);
    }
  });
  return Array.from(set);
}

async function enforcePlanLimits(organizationId: string, plan: PlanTier, domainId?: string | null) {
  const limits = getPlanLimits(plan);

  const startOfCurrentMonth = startOfMonth(new Date());
  if (limits.linkCreateLimitPerMonth) {
    const createdThisMonth = await prisma.link.count({
      where: {
        organizationId,
        createdAt: {
          gte: startOfCurrentMonth,
        },
      },
    });

    if (createdThisMonth >= limits.linkCreateLimitPerMonth) {
      throw new Error("PLAN_LIMIT_REACHED");
    }
  }

  if (domainId && !limits.allowCustomDomains) {
    throw new Error("PLAN_CUSTOM_DOMAIN_NOT_ALLOWED");
  }

}

export async function createLink({
  organizationId,
  membershipId,
  destinationUrl,
  slug,
  title,
  description,
  expiresAt,
  domainId,
  tags,
}: CreateLinkInput) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, planTier: true },
  });

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  await enforcePlanLimits(organizationId, organization.planTier, domainId ?? undefined);

  const normalizedSlug = sanitizeSlug(slug);
  const sanitizedTags = normalizeTags(tags);

  const result = await prisma.$transaction(async (tx) => {
    const link = await tx.link.create({
      data: {
        organizationId,
        createdById: membershipId,
        destinationUrl,
        slug: normalizedSlug,
        title: title ?? undefined,
        description: description ?? undefined,
        expiresAt: expiresAt ?? undefined,
        domainId: domainId ?? undefined,
        status: LinkStatus.ACTIVE,
      },
      include: {
        domain: true,
        createdBy: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (sanitizedTags.length) {
      const tagRecords = await Promise.all(
        sanitizedTags.map((tag) =>
          tx.linkTag.upsert({
            where: {
              organizationId_name: {
                organizationId,
                name: tag,
              },
            },
            update: {
              updatedAt: new Date(),
            },
            create: {
              organizationId,
              name: tag,
            },
          }),
        ),
      );

      await Promise.all(
        tagRecords.map((tagRecord) =>
          tx.linkTagAssignment.create({
            data: {
              linkId: link.id,
              tagId: tagRecord.id,
            },
          }),
        ),
      );
    }

    await markChecklistStep(organizationId, "createdFirstLink");
    await recordOrganizationActivity(organizationId, link.createdBy.userId, "link.created", `Link ${link.slug} created`, {
      linkId: link.id,
    });

    return link;
  });

  return result;
}

export async function updateLink(linkId: string, updates: Partial<Pick<CreateLinkInput, "destinationUrl" | "slug" | "title" | "description" | "expiresAt" | "domainId" | "tags">>) {
  const existing = await prisma.link.findUnique({
    where: { id: linkId },
    include: {
      organization: true,
    },
  });

  if (!existing) {
    throw new Error("LINK_NOT_FOUND");
  }

  const normalizedSlug = updates.slug ? sanitizeSlug(updates.slug) : undefined;
  const sanitizedTags = updates.tags ? normalizeTags(updates.tags) : undefined;

  return prisma.$transaction(async (tx) => {
    const link = await tx.link.update({
      where: { id: linkId },
      data: {
        destinationUrl: updates.destinationUrl ?? undefined,
        slug: normalizedSlug,
        title: updates.title ?? undefined,
        description: updates.description ?? undefined,
        expiresAt: updates.expiresAt ?? undefined,
        domainId: updates.domainId ?? undefined,
      },
      include: {
        domain: true,
        createdBy: {
          include: {
            user: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (sanitizedTags) {
      await tx.linkTagAssignment.deleteMany({ where: { linkId } });
      if (sanitizedTags.length) {
        const tagRecords = await Promise.all(
          sanitizedTags.map((tag) =>
            tx.linkTag.upsert({
              where: {
                organizationId_name: {
                  organizationId: existing.organizationId,
                  name: tag,
                },
              },
              update: {
                updatedAt: new Date(),
              },
              create: {
                organizationId: existing.organizationId,
                name: tag,
              },
            }),
          ),
        );

        await Promise.all(
          tagRecords.map((tagRecord) =>
            tx.linkTagAssignment.create({
              data: {
                linkId: link.id,
                tagId: tagRecord.id,
              },
            }),
          ),
        );
      }
    }

    await recordOrganizationActivity(existing.organizationId, link.createdBy.userId, "link.updated", `Link ${link.slug} updated`, {
      linkId: link.id,
    });

    return link;
  });
}

export async function setLinkStatus(linkId: string, status: LinkStatus) {
  return prisma.link.update({
    where: { id: linkId },
    data: { status },
  });
}

export async function deleteLink(linkId: string) {
  await prisma.link.delete({ where: { id: linkId } });
}

export function getLinkById(linkId: string) {
  return prisma.link.findUnique({
    where: { id: linkId },
    include: {
      domain: true,
      createdBy: {
        include: {
          user: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

type LinkListFilters = {
  organizationId: string;
  status?: LinkStatus;
  tag?: string;
  search?: string;
};

export async function listLinks({ organizationId, status, tag, search }: LinkListFilters) {
  return prisma.link.findMany({
    where: {
      organizationId,
      status: status ?? undefined,
      tags: tag
        ? {
            some: {
              tag: {
                name: tag,
              },
            },
          }
        : undefined,
      OR: search
        ? [
            { slug: { contains: search, mode: "insensitive" } },
            { destinationUrl: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      domain: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

type ClickContext = {
  ip?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  geo?: {
    country?: string | null;
    region?: string | null;
    city?: string | null;
  } | null;
  utm?: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string | null>> | null;
};

export async function recordClick(linkId: string, context: ClickContext) {
  const ipHash = context.ip ? hashIdentifier(context.ip) : null;
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const click = await tx.clickEvent.create({
      data: {
        linkId,
        referrer: context.referrer ?? undefined,
        country: context.geo?.country ?? undefined,
        region: context.geo?.region ?? undefined,
        city: context.geo?.city ?? undefined,
        userAgent: context.userAgent ?? undefined,
        deviceType: undefined,
        browser: undefined,
        os: undefined,
        ipHash: ipHash ?? undefined,
        utmSource: context.utm?.source ?? undefined,
        utmMedium: context.utm?.medium ?? undefined,
        utmCampaign: context.utm?.campaign ?? undefined,
        utmTerm: context.utm?.term ?? undefined,
        utmContent: context.utm?.content ?? undefined,
      },
    });

    await tx.link.update({
      where: { id: linkId },
      data: {
        clickCount: { increment: 1 },
        lastClickedAt: now,
      },
    });

    if (ipHash) {
      const visitorCount = await tx.clickEvent.count({
        where: {
          linkId,
          ipHash,
          occurredAt: {
            lt: click.occurredAt,
          },
        },
      });

      if (visitorCount === 0) {
        await tx.link.update({
          where: { id: linkId },
          data: {
            uniqueVisitors: { increment: 1 },
          },
        });
      }
    }

    if (!ipHash) {
      await tx.link.update({
        where: { id: linkId },
        data: {
          uniqueVisitors: { increment: 1 },
        },
      });
    }

    return click;
  });
}

type AnalyticsWindow = {
  organizationId: string;
  from: Date;
  to: Date;
};

export async function getLinkAnalyticsSummary({ organizationId, from, to }: AnalyticsWindow) {
  const [links, totals] = await Promise.all([
    prisma.link.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        slug: true,
        clickCount: true,
        uniqueVisitors: true,
        destinationUrl: true,
      },
      orderBy: {
        clickCount: "desc",
      },
      take: 10,
    }),
    prisma.clickEvent.groupBy({
      by: ["linkId"],
      where: {
        link: {
          organizationId,
        },
        occurredAt: {
          gte: from,
          lte: to,
        },
      },
      _count: { _all: true },
    }),
  ]);

  const totalClicks = totals.reduce((sum, item) => sum + item._count._all, 0);
  const uniqueVisitors = links.reduce((sum, item) => sum + item.uniqueVisitors, 0);

  return {
    topLinks: links,
    totalClicks,
    uniqueVisitors,
  };
}

export async function purgeExpiredLinks(now = new Date()) {
  const links = await prisma.link.findMany({
    where: {
      status: LinkStatus.ACTIVE,
      expiresAt: {
        lte: now,
      },
    },
  });

  if (!links.length) {
    return 0;
  }

  await prisma.link.updateMany({
    where: {
      id: {
        in: links.map((link) => link.id),
      },
    },
    data: {
      status: LinkStatus.EXPIRED,
    },
  });

  return links.length;
}

type RedirectLinkRecord = {
  id: string;
  destinationUrl: string;
};

type ResolveLinkOptions = {
  slug: string;
  domain?: string | null;
  host?: string | null;
};

const baseOrganizationFilter = {
  status: OrganizationStatus.ACTIVE,
  deletedAt: null,
} satisfies Prisma.OrganizationWhereInput;

const redirectLinkSelection = {
  id: true,
  destinationUrl: true,
} as const;

function buildSlugFilter(slug: string): Prisma.StringFilter {
  return {
    equals: slug,
    mode: "insensitive",
  };
}

function normalizeCandidate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed.toLowerCase() : null;
}

export async function resolveLinkForRedirect({ slug, domain, host }: ResolveLinkOptions): Promise<RedirectLinkRecord | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const normalizedDomain = normalizeCandidate(domain);
  const normalizedHost = normalizeCandidate(host);
  const now = new Date();

  const baseWhere = (): Prisma.LinkWhereInput => ({
    status: LinkStatus.ACTIVE,
    slug: buildSlugFilter(normalizedSlug),
    OR: [
      { expiresAt: null },
      {
        expiresAt: {
          gt: now,
        },
      },
    ],
    organization: {
      ...baseOrganizationFilter,
    },
  });

  const attempts: Prisma.LinkWhereInput[] = [];

  if (normalizedDomain) {
    attempts.push({
      ...baseWhere(),
      domain: {
        domain: {
          equals: normalizedDomain,
          mode: "insensitive",
        },
      },
    });
  }

  if (normalizedHost) {
    attempts.push({
      ...baseWhere(),
      domain: {
        domain: {
          equals: normalizedHost,
          mode: "insensitive",
        },
      },
    });

    attempts.push({
      ...baseWhere(),
      organization: {
        ...baseOrganizationFilter,
        primaryDomain: {
          equals: normalizedHost,
          mode: "insensitive",
        },
      },
      domainId: null,
    });
  }

  attempts.push({
    ...baseWhere(),
    domainId: null,
  });

  for (const where of attempts) {
    const link = await prisma.link.findFirst({
      where,
      select: redirectLinkSelection,
      orderBy: {
        createdAt: "asc",
      },
    });
    if (link) {
      return {
        id: link.id,
        destinationUrl: link.destinationUrl,
      };
    }
  }

  return null;
}

export async function computeUsageStats(organizationId: string) {
  const [linkCount, clickCount] = await Promise.all([
    prisma.link.count({ where: { organizationId } }),
    prisma.clickEvent.count({
      where: {
        link: {
          organizationId,
        },
      },
    }),
  ]);

  return {
    linkCount,
    clickCount,
  };
}

export async function getLinkWithClicksBySlug(organizationId: string, slug: string, domainId?: string | null) {
  return prisma.link.findFirst({
    where: {
      organizationId,
      slug,
      domainId: domainId ?? null,
    },
    include: {
      clicks: {
        orderBy: {
          occurredAt: "desc",
        },
        take: 50,
      },
    },
  });
}

export async function getOrganizationPlanTier(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true },
  });

  return organization?.planTier ?? PlanTier.FREE;
}

export async function getCustomDomainUsage(organizationId: string) {
  return prisma.customDomain.count({ where: { organizationId } });
}

export function getNextBillingPreviewDate(currentPeriodEnd: Date) {
  return addMonths(currentPeriodEnd, 1);
}
