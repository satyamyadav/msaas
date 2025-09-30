import { cookies } from "next/headers";
import { cache } from "react";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { prisma } from "@lib/db";

const SESSION_COOKIE_NAME = "msaas_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_TOUCH_THRESHOLD_MS = 1000 * 60 * 15; // 15 minutes

export type SessionUser = {
  id: string;
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt?: Buffer) {
  const resolvedSalt = salt ?? randomBytes(16);
  const derived = scryptSync(password, resolvedSalt, 64);
  return `${resolvedSalt.toString("hex")}:${derived.toString("hex")}`;
}

function verifyPassword(password: string, hashed: string) {
  const [saltHex, derivedHex] = hashed.split(":");
  if (!saltHex || !derivedHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const derived = Buffer.from(derivedHex, "hex");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, derived);
}

function createSessionExpiry() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

function getSessionCookieOptions(expires: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires,
  };
}

async function touchSession(id: string) {
  await prisma.authSession.update({
    where: { id },
    data: { lastActiveAt: new Date() },
  });
}

function getSessionTokenFromCookies() {
  return cookies().get(SESSION_COOKIE_NAME)?.value;
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = hashPassword(password);

  const existingUser = await prisma.authUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  return prisma.authUser.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.authUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return null;
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = createSessionExpiry();

  await prisma.authSession.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  cookies().set({
    ...getSessionCookieOptions(expiresAt),
    value: token,
  });
}

export async function destroySession() {
  const token = getSessionTokenFromCookies();
  if (!token) {
    cookies().delete(SESSION_COOKIE_NAME);
    return;
  }

  await prisma.authSession.deleteMany({
    where: { token },
  });

  cookies().delete(SESSION_COOKIE_NAME);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = getSessionTokenFromCookies();
  if (!token) {
    return null;
  }

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({ where: { id: session.id } });
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (Date.now() - session.lastActiveAt.getTime() > SESSION_TOUCH_THRESHOLD_MS) {
    await touchSession(session.id);
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
});
