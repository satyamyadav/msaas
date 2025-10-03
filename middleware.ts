import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@lib/db";
import { PlatformRole, UserStatus } from "@prisma/client";

const SESSION_COOKIE_NAME = "msaas_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/sign-in" || pathname.startsWith("/admin/sign-in/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return redirectToLogin(request);
  }

  if (session.user.status !== UserStatus.ACTIVE) {
    return redirectToLogin(request, true);
  }

  const allowedPlatformRoles = [PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN];

  if (!allowedPlatformRoles.includes(session.user.platformRole)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, clearCookie = false) {
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL(`/admin/sign-in?redirectTo=${encodeURIComponent(redirectTarget)}`, request.url);
  const response = NextResponse.redirect(loginUrl);
  if (clearCookie) {
    response.cookies.delete(SESSION_COOKIE_NAME);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs",
};
