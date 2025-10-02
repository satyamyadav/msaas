import { differenceInCalendarDays, eachDayOfInterval, formatISO, startOfDay } from "date-fns";

import { prisma } from "@lib/db";

export type AnalyticsRange = {
  from: Date;
  to: Date;
};

export type AnalyticsSeriesPoint = {
  date: string;
  clicks: number;
  uniqueVisitors: number;
};

export type TopItem = {
  label: string;
  value: number;
};

function resolveReferrerLabel(referrer: string | null | undefined) {
  if (!referrer) {
    return "Direct";
  }
  try {
    const hostname = new URL(referrer).hostname;
    return hostname || referrer;
  } catch {
    return referrer;
  }
}

type AnalyticsSnapshot = {
  totalClicks: number;
  uniqueVisitors: number;
  timeline: AnalyticsSeriesPoint[];
  topLinks: (TopItem & { linkId: string; slug: string; destinationUrl: string })[];
  topReferrers: TopItem[];
  topCountries: TopItem[];
};

export async function getOrganizationAnalyticsSnapshot(organizationId: string, range: AnalyticsRange): Promise<AnalyticsSnapshot> {
  const events = await prisma.clickEvent.findMany({
    where: {
      link: {
        organizationId,
      },
      occurredAt: {
        gte: range.from,
        lte: range.to,
      },
    },
    include: {
      link: {
        select: {
          id: true,
          slug: true,
          destinationUrl: true,
        },
      },
    },
  });

  const totalClicks = events.length;
  const uniqueVisitors = new Set(events.map((event) => event.ipHash ?? event.id)).size;

  const topLinksMap = new Map<string, { count: number; slug: string; destinationUrl: string }>();
  const referrerMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const uniqueByDay = new Map<string, Set<string>>();
  const clicksByDay = new Map<string, number>();

  for (const event of events) {
    const linkKey = event.link.id;
    const referrerKey = resolveReferrerLabel(event.referrer);
    const countryKey = event.country || "Unknown";
    const dayKey = formatISO(startOfDay(event.occurredAt), { representation: "date" });
    const visitorIdentifier = event.ipHash ?? event.id;

    const topLinkEntry = topLinksMap.get(linkKey) ?? {
      count: 0,
      slug: event.link.slug,
      destinationUrl: event.link.destinationUrl,
    };
    topLinkEntry.count += 1;
    topLinkEntry.slug = event.link.slug;
    topLinkEntry.destinationUrl = event.link.destinationUrl;
    topLinksMap.set(linkKey, topLinkEntry);

    referrerMap.set(referrerKey, (referrerMap.get(referrerKey) ?? 0) + 1);
    countryMap.set(countryKey, (countryMap.get(countryKey) ?? 0) + 1);

    clicksByDay.set(dayKey, (clicksByDay.get(dayKey) ?? 0) + 1);
    const uniqueSet = uniqueByDay.get(dayKey) ?? new Set<string>();
    uniqueSet.add(visitorIdentifier);
    uniqueByDay.set(dayKey, uniqueSet);
  }

  const topLinks = Array.from(topLinksMap.entries())
    .map(([linkId, meta]) => ({
      label: meta.slug,
      value: meta.count,
      linkId,
      slug: meta.slug,
      destinationUrl: meta.destinationUrl,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const topReferrers = Array.from(referrerMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const topCountries = Array.from(countryMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalDays = differenceInCalendarDays(range.to, range.from) + 1;
  const timelineDays = totalDays > 60 ? 60 : totalDays;
  const timelineDates = eachDayOfInterval({ start: startOfDay(range.from), end: startOfDay(range.to) }).slice(-timelineDays);

  const timeline = timelineDates.map((date) => {
    const key = formatISO(date, { representation: "date" });
    return {
      date: key,
      clicks: clicksByDay.get(key) ?? 0,
      uniqueVisitors: uniqueByDay.get(key)?.size ?? 0,
    };
  });

  return {
    totalClicks,
    uniqueVisitors,
    timeline,
    topLinks,
    topReferrers,
    topCountries,
  };
}

export async function getLinkAnalytics(linkId: string, range: AnalyticsRange) {
  const events = await prisma.clickEvent.findMany({
    where: {
      linkId,
      occurredAt: {
        gte: range.from,
        lte: range.to,
      },
    },
  });

  const totalClicks = events.length;
  const uniqueVisitors = new Set(events.map((event) => event.ipHash ?? event.id)).size;

  const referrers = new Map<string, number>();
  const countries = new Map<string, number>();

  events.forEach((event) => {
    const referrerKey = resolveReferrerLabel(event.referrer);
    const countryKey = event.country || "Unknown";
    referrers.set(referrerKey, (referrers.get(referrerKey) ?? 0) + 1);
    countries.set(countryKey, (countries.get(countryKey) ?? 0) + 1);
  });

  return {
    totalClicks,
    uniqueVisitors,
    referrers: Array.from(referrers.entries()).map(([label, value]) => ({ label, value })),
    countries: Array.from(countries.entries()).map(([label, value]) => ({ label, value })),
  };
}
