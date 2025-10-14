import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { recordClick, resolveLinkForRedirect } from "@lib/server/links";

export const runtime = "nodejs";

type RouteParams = {
  slug?: string[];
};

function buildNotFoundResponse() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function decodeSegment(value: string | undefined) {
  if (!value) {
    return null;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function extractHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost ?? request.headers.get("host");
  if (!hostHeader) {
    return null;
  }
  const primary = hostHeader.split(",")[0]?.trim();
  if (!primary) {
    return null;
  }
  const [hostname] = primary.split(":");
  return hostname?.trim() ?? null;
}

function extractClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const candidate = forwarded.split(",")[0]?.trim();
    if (candidate) {
      return candidate;
    }
  }

  const realIpHeaders = ["x-real-ip", "cf-connecting-ip"] as const;
  for (const header of realIpHeaders) {
    const value = request.headers.get(header);
    if (value && value.trim().length) {
      return value.trim();
    }
  }

  return null;
}

type RequestGeo = {
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

function extractGeo(request: NextRequest) {
  const geo = (request as NextRequest & { geo?: RequestGeo | null }).geo;
  if (!geo) {
    return null;
  }

  return {
    country: geo.country ?? null,
    region: geo.region ?? null,
    city: geo.city ?? null,
  };
}

function extractUtmParams(searchParams: URLSearchParams) {
  const get = (key: string) => {
    const value = searchParams.get(key);
    return value && value.trim().length ? value : null;
  };

  const utm = {
    source: get("utm_source"),
    medium: get("utm_medium"),
    campaign: get("utm_campaign"),
    term: get("utm_term"),
    content: get("utm_content"),
  };

  return Object.values(utm).some((value) => value) ? utm : null;
}

const STATIC_REDIRECTS: Record<string, string> = {
  satyam: "https://www.linkedin.com/in/satyamyadav3/",
};

function buildRedirectResponse(destination: string) {
  const response = NextResponse.redirect(destination, {
    status: 302,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

async function handleRedirect(request: NextRequest, { slug }: RouteParams, shouldRecordClick: boolean) {
  const segments = Array.isArray(slug) ? slug : slug ? [slug] : [];
  if (!segments.length || segments.length > 2) {
    return buildNotFoundResponse();
  }

  const [first, second] = segments;
  const pathDomain = segments.length === 2 ? decodeSegment(first) : null;
  const slugSegment = segments.length === 2 ? decodeSegment(second) : decodeSegment(first);

  if (!slugSegment) {
    return buildNotFoundResponse();
  }

  const staticDestination = STATIC_REDIRECTS[slugSegment.toLowerCase()];
  if (!pathDomain && staticDestination) {
    return buildRedirectResponse(staticDestination);
  }

  const host = extractHost(request);
  const link = await resolveLinkForRedirect({
    slug: slugSegment,
    domain: pathDomain,
    host,
  });

  if (!link) {
    return buildNotFoundResponse();
  }

  if (shouldRecordClick) {
    const searchParams = request.nextUrl.searchParams;
    const utm = extractUtmParams(searchParams);
    const referrer = request.headers.get("referer") ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;
    const geo = extractGeo(request);
    const ip = extractClientIp(request);

    try {
      await recordClick(link.id, {
        ip,
        userAgent,
        referrer,
        geo,
        utm,
      });
    } catch (error) {
      console.error("Failed to record click event", error);
    }
  }

  return buildRedirectResponse(link.destinationUrl);
}

type RouteContext = { params: Promise<RouteParams> };

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return handleRedirect(request, params, true);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return handleRedirect(request, params, false);
}
