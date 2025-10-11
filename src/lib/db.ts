import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

type PrismaGlobal = { prismaGlobal?: PrismaClient };
const globalForPrisma = globalThis as unknown as PrismaGlobal;

export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

export const connectToDatabase = async () => {
  await prisma.$connect();
  return prisma;
};

const shouldAutoConnect = process.env.NODE_ENV === "development";

if (shouldAutoConnect) {
  void connectToDatabase().catch((error) => {
    console.warn(
      "Skipping automatic Prisma connection because the database is unavailable. Start your database to enable live data.",
    );
    console.debug(error);
  });
}

export type DbClient = typeof prisma;
