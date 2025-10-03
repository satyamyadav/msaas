#!/usr/bin/env node
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";

import { PrismaClient, PlatformRole, UserStatus } from "@prisma/client";

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function getEnv(name, options = {}) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    if (options.optional) {
      return undefined;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

async function ensureSuperAdmin(prisma) {
  const email = getEnv("PLATFORM_SUPERADMIN_EMAIL").toLowerCase();
  const password = getEnv("PLATFORM_SUPERADMIN_PASSWORD");
  const displayName = getEnv("PLATFORM_SUPERADMIN_NAME", { optional: true });
  const forceReset = process.env.PLATFORM_SUPERADMIN_FORCE_RESET === "true";

  const existingUser = await prisma.authUser.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = hashPassword(password);
    await prisma.authUser.create({
      data: {
        email,
        passwordHash,
        displayName: displayName ?? undefined,
        platformRole: PlatformRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`✅ Created new super admin: ${email}`);
    return;
  }

  const updates = {
    platformRole: PlatformRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  };

  if (forceReset) {
    updates.passwordHash = hashPassword(password);
  }

  await prisma.authUser.update({ where: { id: existingUser.id }, data: updates });

  console.log(`🔁 Updated existing account ${email} with SUPER_ADMIN access${forceReset ? " and refreshed password" : ""}.`);
}

async function main() {
  let prisma;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }

    prisma = new PrismaClient();
    await ensureSuperAdmin(prisma);
  } catch (error) {
    console.error("Failed to ensure super admin:", error.message ?? error);
    process.exitCode = 1;
  } finally {
    await prisma?.$disconnect().catch(() => undefined);
  }
}

main();
