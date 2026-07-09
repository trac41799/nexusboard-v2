import type { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { Pool, neonConfig } = await import("@neondatabase/serverless");
  const { PrismaClient: PC } = await import("@prisma/client");

  // Required for Vercel serverless — use WebSocket instead of TCP
  neonConfig.webSocketConstructor = (await import("ws")).default;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  globalForPrisma.prisma = new PC({ adapter: new PrismaNeon(pool) });
  return globalForPrisma.prisma;
}

let prismaPromise: Promise<PrismaClient> | null = null;
export function prisma(): Promise<PrismaClient> {
  if (!prismaPromise) prismaPromise = getPrisma();
  return prismaPromise;
}
