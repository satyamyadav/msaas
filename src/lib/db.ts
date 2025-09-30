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
    console.error("Failed to establish a database connection.", error);
    throw error;
  });
}

export type DbClient = typeof prisma;
