#!/usr/bin/env node
import "dotenv/config";

import { createHash, randomBytes, scryptSync } from "node:crypto";

import {
  DomainStatus,
  InviteStatus,
  LinkStatus,
  MemberRole,
  MemberStatus,
  OrganizationStatus,
  PlanTier,
  PlatformRole,
  PrismaClient,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function hashApiKeySecret(secret) {
  return createHash("sha256").update(secret).digest("hex");
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function ensureDate(value, fallbackDaysAgo = 0) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return daysAgo(fallbackDaysAgo);
}

const DEFAULT_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? "password123";

const demoUsers = [
  {
    email: "lucy@acme.dev",
    displayName: "Lucy Vance",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "marco@acme.dev",
    displayName: "Marco Li",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "jo@acme.dev",
    displayName: "Jo Carver",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "nina@northwind.io",
    displayName: "Nina Patel",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "owen@northwind.io",
    displayName: "Owen Hart",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "sasha@sunrise.studio",
    displayName: "Sasha Torres",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "karim@sunrise.studio",
    displayName: "Karim Lang",
    platformRole: PlatformRole.MEMBER,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
  {
    email: "platform-admin@msaas.dev",
    displayName: "Platform Admin",
    platformRole: PlatformRole.ADMIN,
    status: UserStatus.ACTIVE,
    password: DEFAULT_USER_PASSWORD,
  },
];

const demoOrganizations = [
  {
    name: "Acme Analytics",
    slug: "acme",
    planTier: PlanTier.PRO,
    status: OrganizationStatus.ACTIVE,
    primaryDomain: "acme.dev",
    logoUrl: "https://dummyimage.com/96x96/0f172a/ffffff&text=AC",
    analyticsRetentionMonths: 24,
    isOnboardingComplete: true,
    members: [
      {
        email: "lucy@acme.dev",
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
        joinedAt: daysAgo(120),
        lastSeenAt: new Date(),
      },
      {
        email: "marco@acme.dev",
        role: MemberRole.ADMIN,
        status: MemberStatus.ACTIVE,
        joinedAt: daysAgo(95),
        lastSeenAt: daysAgo(1),
      },
      {
        email: "jo@acme.dev",
        role: MemberRole.MEMBER,
        status: MemberStatus.ACTIVE,
        joinedAt: daysAgo(45),
        lastSeenAt: daysAgo(3),
      },
    ],
    invites: [
      {
        email: "andi@acme.dev",
        role: MemberRole.MEMBER,
        status: InviteStatus.PENDING,
        token: "demo-acme-pending",
        expiresAt: daysFromNow(7),
        invitedByEmail: "lucy@acme.dev",
      },
      {
        email: "casey@acme.dev",
        role: MemberRole.ADMIN,
        status: InviteStatus.ACCEPTED,
        token: "demo-acme-accepted",
        expiresAt: daysAgo(20),
        invitedByEmail: "lucy@acme.dev",
        acceptedByEmail: "marco@acme.dev",
      },
    ],
    quickstart: {
      createdFirstLinkAt: daysAgo(110),
      invitedTeamAt: daysAgo(108),
      configuredDomainAt: daysAgo(60),
      viewedAnalyticsAt: daysAgo(30),
      completedAt: daysAgo(30),
    },
    subscription: {
      customerId: "cus_demo_acme",
      status: "active",
      priceId: "price_demo_pro",
      planTier: PlanTier.PRO,
      currentPeriodEnd: daysFromNow(18),
      cancelAtPeriodEnd: false,
      trialEndsAt: daysAgo(60),
    },
    domains: [
      {
        domain: "go.acme.dev",
        status: DomainStatus.VERIFIED,
        verificationToken: "verify-acme-go",
        verifiedAt: daysAgo(55),
      },
    ],
    tags: [
      { name: "Lifecycle", description: "Onboarding and lifecycle campaigns" },
      { name: "Paid", description: "Paid acquisition experiments" },
      { name: "Product", description: "Product feature announcements" },
    ],
    links: [
      {
        slug: "welcome",
        destinationUrl: "https://acme.dev/welcome",
        title: "Welcome Tour",
        description: "Direct new users to the interactive onboarding tour.",
        status: LinkStatus.ACTIVE,
        createdByEmail: "lucy@acme.dev",
        clickCount: 420,
        uniqueVisitors: 280,
        tags: ["Lifecycle", "Product"],
        lastClickedAt: daysAgo(1),
        clicks: [
          {
            occurredAt: daysAgo(1),
            country: "US",
            region: "CA",
            city: "San Francisco",
            deviceType: "Desktop",
            browser: "Chrome",
            os: "macOS",
            referrer: "https://mail.acme.dev",
            utmSource: "email",
            utmCampaign: "welcome-series",
          },
          {
            occurredAt: daysAgo(2),
            country: "GB",
            region: "London",
            city: "London",
            deviceType: "Mobile",
            browser: "Safari",
            os: "iOS",
            referrer: "https://mail.acme.dev",
            utmSource: "email",
            utmCampaign: "welcome-series",
          },
        ],
      },
      {
        slug: "q2-launch",
        destinationUrl: "https://acme.dev/blog/q2-launch",
        title: "Q2 Launch Recap",
        description: "Highlights from the Q2 feature launch.",
        status: LinkStatus.ACTIVE,
        createdByEmail: "marco@acme.dev",
        clickCount: 198,
        uniqueVisitors: 150,
        tags: ["Product"],
        lastClickedAt: daysAgo(4),
        domain: "go.acme.dev",
        clicks: [
          {
            occurredAt: daysAgo(4),
            country: "US",
            region: "NY",
            city: "New York",
            deviceType: "Desktop",
            browser: "Firefox",
            os: "macOS",
            referrer: "https://news.ycombinator.com",
            utmSource: "hackernews",
            utmCampaign: "q2-launch",
          },
          {
            occurredAt: daysAgo(6),
            country: "CA",
            region: "Ontario",
            city: "Toronto",
            deviceType: "Mobile",
            browser: "Chrome",
            os: "Android",
            referrer: "https://twitter.com",
            utmSource: "social",
            utmCampaign: "q2-launch",
          },
        ],
      },
      {
        slug: "pricing",
        destinationUrl: "https://acme.dev/pricing",
        title: "Pricing Overview",
        description: "Compare plans and see what's included with Acme Analytics.",
        status: LinkStatus.ACTIVE,
        createdByEmail: "jo@acme.dev",
        clickCount: 312,
        uniqueVisitors: 260,
        tags: ["Paid"],
        lastClickedAt: daysAgo(2),
        clicks: [
          {
            occurredAt: daysAgo(2),
            country: "US",
            region: "TX",
            city: "Austin",
            deviceType: "Desktop",
            browser: "Edge",
            os: "Windows",
            referrer: "https://ads.google.com",
            utmSource: "google",
            utmMedium: "cpc",
            utmCampaign: "brand-search",
          },
          {
            occurredAt: daysAgo(3),
            country: "DE",
            region: "BE",
            city: "Berlin",
            deviceType: "Desktop",
            browser: "Chrome",
            os: "Windows",
            referrer: "https://bing.com",
            utmSource: "bing",
            utmMedium: "cpc",
            utmCampaign: "eu-expansion",
          },
        ],
      },
    ],
    apiKeys: [
      {
        name: "Production ingestion",
        secret: "msa_prod_acme_ingest",
        createdByEmail: "marco@acme.dev",
        lastUsedAt: daysAgo(5),
      },
      {
        name: "Staging dashboards",
        secret: "msa_stage_acme_dashboard",
        createdByEmail: "lucy@acme.dev",
        revokedAt: daysAgo(20),
      },
    ],
    auditLogs: [
      {
        action: "organization.updated",
        description: "Updated workspace logo and primary domain.",
        actorEmail: "lucy@acme.dev",
        createdAt: daysAgo(58),
      },
      {
        action: "member.invited",
        description: "Invited Casey to join the workspace.",
        actorEmail: "marco@acme.dev",
        createdAt: daysAgo(21),
      },
      {
        action: "link.created",
        description: "Created link go.acme.dev/q2-launch.",
        actorEmail: "marco@acme.dev",
        createdAt: daysAgo(6),
      },
    ],
  },
  {
    name: "Northwind Labs",
    slug: "northwind",
    planTier: PlanTier.FREE,
    status: OrganizationStatus.ACTIVE,
    primaryDomain: "northwind.io",
    logoUrl: "https://dummyimage.com/96x96/312e81/ffffff&text=NL",
    analyticsRetentionMonths: 12,
    isOnboardingComplete: false,
    members: [
      {
        email: "nina@northwind.io",
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
        joinedAt: daysAgo(35),
        lastSeenAt: daysAgo(1),
      },
      {
        email: "owen@northwind.io",
        role: MemberRole.MEMBER,
        status: MemberStatus.ACTIVE,
        joinedAt: daysAgo(20),
        lastSeenAt: daysAgo(2),
      },
    ],
    quickstart: {
      createdFirstLinkAt: daysAgo(30),
      invitedTeamAt: daysAgo(25),
      configuredDomainAt: null,
      viewedAnalyticsAt: null,
      completedAt: null,
    },
    tags: [
      { name: "Growth", description: "Experiments for user acquisition" },
      { name: "Lifecycle", description: "Lifecycle automations" },
    ],
    links: [
      {
        slug: "beta-invite",
        destinationUrl: "https://northwind.io/beta",
        title: "Invite to private beta",
        description: "Collect applications to join the beta program.",
        status: LinkStatus.ACTIVE,
        createdByEmail: "nina@northwind.io",
        clickCount: 64,
        uniqueVisitors: 53,
        tags: ["Growth"],
        lastClickedAt: daysAgo(7),
        clicks: [
          {
            occurredAt: daysAgo(7),
            country: "US",
            region: "WA",
            city: "Seattle",
            deviceType: "Desktop",
            browser: "Chrome",
            os: "Linux",
            referrer: "https://producthunt.com",
            utmSource: "producthunt",
            utmCampaign: "beta-launch",
          },
        ],
      },
      {
        slug: "changelog",
        destinationUrl: "https://northwind.io/changelog",
        title: "Product Changelog",
        description: "Latest updates and improvements.",
        status: LinkStatus.ACTIVE,
        createdByEmail: "owen@northwind.io",
        clickCount: 25,
        uniqueVisitors: 21,
        tags: ["Lifecycle"],
        lastClickedAt: daysAgo(10),
        clicks: [
          {
            occurredAt: daysAgo(10),
            country: "AU",
            region: "NSW",
            city: "Sydney",
            deviceType: "Mobile",
            browser: "Safari",
            os: "iOS",
            referrer: "https://northwind.io",
            utmSource: "in-product",
            utmCampaign: "changelog",
          },
        ],
      },
    ],
    auditLogs: [
      {
        action: "organization.created",
        description: "Northwind Labs workspace created.",
        actorEmail: "nina@northwind.io",
        createdAt: daysAgo(35),
      },
      {
        action: "member.invited",
        description: "Owen invited to collaborate.",
        actorEmail: "nina@northwind.io",
        createdAt: daysAgo(28),
      },
    ],
  },
  {
    name: "Sunrise Ventures",
    slug: "sunrise",
    planTier: PlanTier.PRO,
    status: OrganizationStatus.SUSPENDED,
    primaryDomain: "sunrise.studio",
    logoUrl: "https://dummyimage.com/96x96/7c3aed/ffffff&text=SV",
    analyticsRetentionMonths: 18,
    isOnboardingComplete: true,
    suspendedAt: daysAgo(12),
    members: [
      {
        email: "sasha@sunrise.studio",
        role: MemberRole.OWNER,
        status: MemberStatus.SUSPENDED,
        joinedAt: daysAgo(200),
        lastSeenAt: daysAgo(40),
      },
      {
        email: "karim@sunrise.studio",
        role: MemberRole.ADMIN,
        status: MemberStatus.SUSPENDED,
        joinedAt: daysAgo(180),
        lastSeenAt: daysAgo(50),
      },
    ],
    subscription: {
      customerId: "cus_demo_sunrise",
      status: "past_due",
      priceId: "price_demo_pro",
      planTier: PlanTier.PRO,
      currentPeriodEnd: daysAgo(5),
      cancelAtPeriodEnd: true,
      trialEndsAt: daysAgo(150),
    },
    auditLogs: [
      {
        action: "billing.payment_failed",
        description: "Failed to capture renewal payment.",
        actorEmail: null,
        createdAt: daysAgo(15),
      },
      {
        action: "organization.suspended",
        description: "Workspace suspended due to payment issues.",
        actorEmail: null,
        createdAt: daysAgo(12),
      },
    ],
  },
];

async function seedUsers() {
  const result = new Map();
  for (const spec of demoUsers) {
    const email = spec.email.toLowerCase();
    const passwordHash = hashPassword(spec.password);
    const data = {
      email,
      displayName: spec.displayName ?? null,
      passwordHash,
      platformRole: spec.platformRole ?? PlatformRole.MEMBER,
      status: spec.status ?? UserStatus.ACTIVE,
    };

    const user = await prisma.authUser.upsert({
      where: { email: data.email },
      update: {
        displayName: data.displayName ?? undefined,
        platformRole: data.platformRole,
        status: data.status,
        passwordHash,
      },
      create: data,
    });

    result.set(email, user);
  }
  console.log(`👤 Seeded ${result.size} demo users.`);
  return result;
}

async function ensureQuickstart(organizationId, quickstart) {
  if (!quickstart) {
    return;
  }

  const existing = await prisma.quickStartChecklist.findUnique({ where: { organizationId } });
  const data = {
    createdFirstLinkAt: quickstart.createdFirstLinkAt ? ensureDate(quickstart.createdFirstLinkAt) : null,
    invitedTeamAt: quickstart.invitedTeamAt ? ensureDate(quickstart.invitedTeamAt) : null,
    configuredDomainAt: quickstart.configuredDomainAt ? ensureDate(quickstart.configuredDomainAt) : null,
    viewedAnalyticsAt: quickstart.viewedAnalyticsAt ? ensureDate(quickstart.viewedAnalyticsAt) : null,
    completedAt: quickstart.completedAt ? ensureDate(quickstart.completedAt) : null,
  };

  if (!existing) {
    await prisma.quickStartChecklist.create({
      data: {
        organizationId,
        ...data,
      },
    });
  } else {
    await prisma.quickStartChecklist.update({
      where: { id: existing.id },
      data,
    });
  }
}

async function ensureMembership(organizationId, userId, memberSpec) {
  const existing = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  const baseData = {
    role: memberSpec.role ?? MemberRole.MEMBER,
    status: memberSpec.status ?? MemberStatus.ACTIVE,
  };
  if (memberSpec.joinedAt) {
    baseData.joinedAt = ensureDate(memberSpec.joinedAt);
  }
  if (memberSpec.lastSeenAt) {
    baseData.lastSeenAt = ensureDate(memberSpec.lastSeenAt);
  }
  if (memberSpec.invitedByInviteId) {
    baseData.invitedByInviteId = memberSpec.invitedByInviteId;
  }

  if (existing) {
    return prisma.organizationMember.update({
      where: { id: existing.id },
      data: baseData,
    });
  }

  return prisma.organizationMember.create({
    data: {
      organizationId,
      userId,
      ...baseData,
    },
  });
}

async function ensureInvite(organizationId, inviteSpec, usersByEmail) {
  const invitedById = inviteSpec.invitedByEmail ? usersByEmail.get(inviteSpec.invitedByEmail.toLowerCase())?.id : undefined;
  const acceptedById = inviteSpec.acceptedByEmail ? usersByEmail.get(inviteSpec.acceptedByEmail.toLowerCase())?.id : undefined;

  const data = {
    organizationId,
    email: inviteSpec.email.toLowerCase(),
    role: inviteSpec.role ?? MemberRole.MEMBER,
    status: inviteSpec.status ?? InviteStatus.PENDING,
    expiresAt: ensureDate(inviteSpec.expiresAt, -7),
    invitedById,
    acceptedById,
  };

  const existing = await prisma.organizationInvite.findUnique({ where: { token: inviteSpec.token } });

  if (existing) {
    await prisma.organizationInvite.update({
      where: { id: existing.id },
      data,
    });
    return existing;
  }

  return prisma.organizationInvite.create({
    data: {
      ...data,
      token: inviteSpec.token,
    },
  });
}

async function ensureSubscription(organizationId, subscription) {
  if (!subscription) {
    return;
  }
  await prisma.billingSubscription.upsert({
    where: { organizationId },
    update: {
      status: subscription.status,
      priceId: subscription.priceId,
      planTier: subscription.planTier ?? PlanTier.PRO,
      currentPeriodEnd: ensureDate(subscription.currentPeriodEnd),
      cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
      trialEndsAt: subscription.trialEndsAt ? ensureDate(subscription.trialEndsAt) : null,
    },
    create: {
      organizationId,
      customerId: subscription.customerId,
      status: subscription.status,
      priceId: subscription.priceId,
      planTier: subscription.planTier ?? PlanTier.PRO,
      currentPeriodEnd: ensureDate(subscription.currentPeriodEnd),
      cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
      trialEndsAt: subscription.trialEndsAt ? ensureDate(subscription.trialEndsAt) : null,
    },
  });
}

async function ensureCustomDomain(organizationId, domainSpec) {
  const existing = await prisma.customDomain.findUnique({ where: { domain: domainSpec.domain } });
  const data = {
    organizationId,
    status: domainSpec.status ?? DomainStatus.PENDING,
    verificationToken: domainSpec.verificationToken,
    verifiedAt: domainSpec.verifiedAt ? ensureDate(domainSpec.verifiedAt) : null,
  };

  if (existing) {
    return prisma.customDomain.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.customDomain.create({
    data: {
      ...data,
      domain: domainSpec.domain,
    },
  });
}

async function ensureTag(organizationId, tagSpec) {
  const existing = await prisma.linkTag.findFirst({
    where: {
      organizationId,
      name: tagSpec.name,
    },
  });

  if (existing) {
    await prisma.linkTag.update({
      where: { id: existing.id },
      data: {
        description: tagSpec.description ?? null,
      },
    });
    return existing;
  }

  return prisma.linkTag.create({
    data: {
      organizationId,
      name: tagSpec.name,
      description: tagSpec.description ?? null,
    },
  });
}

async function ensureLink(organizationId, linkSpec, membershipMap, domainMap, tagMap) {
  const createdByMembership = membershipMap.get(linkSpec.createdByEmail.toLowerCase());
  if (!createdByMembership) {
    throw new Error(`Missing membership for ${linkSpec.createdByEmail} in organization ${organizationId}`);
  }

  const domainId = linkSpec.domain ? domainMap.get(linkSpec.domain)?.id ?? null : null;

  const existing = await prisma.link.findFirst({
    where: {
      organizationId,
      slug: linkSpec.slug,
      domainId,
    },
  });

  const baseData = {
    organizationId,
    createdById: createdByMembership.id,
    destinationUrl: linkSpec.destinationUrl,
    title: linkSpec.title ?? null,
    description: linkSpec.description ?? null,
    status: linkSpec.status ?? LinkStatus.ACTIVE,
    expiresAt: linkSpec.expiresAt ? ensureDate(linkSpec.expiresAt) : null,
    lastClickedAt: linkSpec.lastClickedAt ? ensureDate(linkSpec.lastClickedAt) : null,
    clickCount: linkSpec.clickCount ?? linkSpec.clicks?.length ?? 0,
    uniqueVisitors: linkSpec.uniqueVisitors ?? Math.max(0, linkSpec.clicks?.length ?? 0),
    domainId,
  };

  let link;
  if (existing) {
    link = await prisma.link.update({
      where: { id: existing.id },
      data: {
        ...baseData,
        slug: linkSpec.slug,
      },
    });
  } else {
    link = await prisma.link.create({
      data: {
        ...baseData,
        slug: linkSpec.slug,
      },
    });
  }

  if (Array.isArray(linkSpec.tags)) {
    for (const tagName of linkSpec.tags) {
      const tag = tagMap.get(tagName);
      if (!tag) {
        continue;
      }
      const assignment = await prisma.linkTagAssignment.findFirst({
        where: {
          linkId: link.id,
          tagId: tag.id,
        },
      });
      if (!assignment) {
        await prisma.linkTagAssignment.create({
          data: {
            linkId: link.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  if (Array.isArray(linkSpec.clicks) && linkSpec.clicks.length > 0) {
    const existingClickCount = await prisma.clickEvent.count({ where: { linkId: link.id } });
    if (existingClickCount === 0) {
      await prisma.clickEvent.createMany({
        data: linkSpec.clicks.map((event) => ({
          linkId: link.id,
          occurredAt: ensureDate(event.occurredAt ?? new Date()),
          referrer: event.referrer ?? null,
          country: event.country ?? null,
          region: event.region ?? null,
          city: event.city ?? null,
          deviceType: event.deviceType ?? null,
          browser: event.browser ?? null,
          os: event.os ?? null,
          userAgent: event.userAgent ?? null,
          ipHash: event.ipHash ?? null,
          utmSource: event.utmSource ?? null,
          utmMedium: event.utmMedium ?? null,
          utmCampaign: event.utmCampaign ?? null,
          utmTerm: event.utmTerm ?? null,
          utmContent: event.utmContent ?? null,
        })),
      });
    }
  }

  return link;
}

async function ensureApiKey(organizationId, apiKeySpec, membershipMap) {
  const secret = apiKeySpec.secret;
  const prefix = secret.slice(0, 8);
  const createdByMembership = apiKeySpec.createdByEmail ? membershipMap.get(apiKeySpec.createdByEmail.toLowerCase()) : null;

  const existing = await prisma.apiKey.findUnique({ where: { prefix } });
  const data = {
    organizationId,
    name: apiKeySpec.name,
    keyHash: hashApiKeySecret(secret),
    createdById: createdByMembership ? createdByMembership.id : null,
    lastUsedAt: apiKeySpec.lastUsedAt ? ensureDate(apiKeySpec.lastUsedAt) : null,
    revokedAt: apiKeySpec.revokedAt ? ensureDate(apiKeySpec.revokedAt) : null,
  };

  if (existing) {
    await prisma.apiKey.update({
      where: { id: existing.id },
      data,
    });
    return existing;
  }

  return prisma.apiKey.create({
    data: {
      ...data,
      prefix,
    },
  });
}

async function ensureAuditLog(organizationId, logSpec, usersByEmail) {
  const existing = await prisma.auditLog.findFirst({
    where: {
      organizationId,
      action: logSpec.action,
      description: logSpec.description ?? null,
    },
  });

  if (existing) {
    return existing;
  }

  const actorId = logSpec.actorEmail ? usersByEmail.get(logSpec.actorEmail.toLowerCase())?.id : null;

  return prisma.auditLog.create({
    data: {
      organizationId,
      actorId: actorId ?? undefined,
      action: logSpec.action,
      description: logSpec.description ?? null,
      metadata: logSpec.metadata ?? undefined,
      createdAt: ensureDate(logSpec.createdAt ?? new Date()),
    },
  });
}

async function seedOrganizations(usersByEmail) {
  for (const orgSpec of demoOrganizations) {
    const existingOrg = await prisma.organization.findUnique({ where: { slug: orgSpec.slug } });
    const orgData = {
      name: orgSpec.name,
      slug: orgSpec.slug,
      planTier: orgSpec.planTier ?? PlanTier.FREE,
      status: orgSpec.status ?? OrganizationStatus.ACTIVE,
      logoUrl: orgSpec.logoUrl ?? null,
      primaryDomain: orgSpec.primaryDomain ?? null,
      analyticsRetentionMonths: orgSpec.analyticsRetentionMonths ?? 18,
      isOnboardingComplete: Boolean(orgSpec.isOnboardingComplete),
      suspendedAt: orgSpec.suspendedAt ? ensureDate(orgSpec.suspendedAt) : null,
      deletedAt: orgSpec.deletedAt ? ensureDate(orgSpec.deletedAt) : null,
    };

    let organization;
    if (existingOrg) {
      organization = await prisma.organization.update({
        where: { id: existingOrg.id },
        data: orgData,
      });
    } else {
      organization = await prisma.organization.create({
        data: {
          ...orgData,
        },
      });
    }

    const membershipMap = new Map();

    if (Array.isArray(orgSpec.members)) {
      for (const member of orgSpec.members) {
        const memberEmail = member.email.toLowerCase();
        const user = usersByEmail.get(memberEmail);
        if (!user) {
          throw new Error(`Cannot seed member ${member.email} because the user does not exist.`);
        }
        const membership = await ensureMembership(organization.id, user.id, member);
        membershipMap.set(memberEmail, membership);
      }
    }

    if (Array.isArray(orgSpec.invites)) {
      for (const invite of orgSpec.invites) {
        await ensureInvite(organization.id, invite, usersByEmail);
      }
    }

    await ensureQuickstart(organization.id, orgSpec.quickstart);
    await ensureSubscription(organization.id, orgSpec.subscription);

    const domainMap = new Map();
    if (Array.isArray(orgSpec.domains)) {
      for (const domain of orgSpec.domains) {
        const result = await ensureCustomDomain(organization.id, domain);
        domainMap.set(domain.domain, result);
      }
    }

    const tagMap = new Map();
    if (Array.isArray(orgSpec.tags)) {
      for (const tag of orgSpec.tags) {
        const record = await ensureTag(organization.id, tag);
        tagMap.set(tag.name, record);
      }
    }

    if (Array.isArray(orgSpec.links)) {
      for (const link of orgSpec.links) {
        await ensureLink(organization.id, link, membershipMap, domainMap, tagMap);
      }
    }

    if (Array.isArray(orgSpec.apiKeys)) {
      for (const apiKey of orgSpec.apiKeys) {
        await ensureApiKey(organization.id, apiKey, membershipMap);
      }
    }

    if (Array.isArray(orgSpec.auditLogs)) {
      for (const log of orgSpec.auditLogs) {
        await ensureAuditLog(organization.id, log, usersByEmail);
      }
    }
  }

  console.log(`🏢 Seeded ${demoOrganizations.length} demo organizations with related data.`);
}

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }

    const users = await seedUsers();
    await seedOrganizations(users);

    console.log("✅ Demo data seeding complete.");
  } catch (error) {
    console.error("Failed to seed demo data:", error?.message ?? error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

main();
