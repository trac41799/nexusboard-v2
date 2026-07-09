import type { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient: PC } = await import("@prisma/client");

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  globalForPrisma.prisma = new PC({ adapter });
  return globalForPrisma.prisma;
}

// Sync wrapper for convenience — queues the promise
let prismaPromise: Promise<PrismaClient> | null = null;
export function prisma(): Promise<PrismaClient> {
  if (!prismaPromise) prismaPromise = getPrisma();
  return prismaPromise;
}
