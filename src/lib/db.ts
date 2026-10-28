import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Whether persistent server-side storage is available in this deployment. */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

export function getDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host.includes("neon.tech") || host.includes("pooler") || host.includes("aws")) {
      if (!url.searchParams.has("connect_timeout")) {
        url.searchParams.set("connect_timeout", "30");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "30");
      }
      if (host.includes("-pooler") && !url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "10");
      }
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const resolvedDbUrl = getDatabaseUrl();

/**
 * A single Prisma client for the process.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = db;

export class DatabaseUnavailableError extends Error {
  code = "DATABASE_UNAVAILABLE" as const;

  constructor() {
    super("Persistent storage is not configured for this deployment.");
    this.name = "DatabaseUnavailableError";
  }
}

export function requireDatabase() {
  if (!isDatabaseConfigured) throw new DatabaseUnavailableError();
  return db;
}

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof DatabaseUnavailableError;
}

/**
 * Executes a database operation with automatic retry on temporary connection errors / cold starts.
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
  delayMs = 600,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const message = String(error?.message || "");
      const isTransient =
        message.includes("connection pool") ||
        message.includes("Can't reach database server") ||
        message.includes("Timed out") ||
        message.includes("terminating connection") ||
        message.includes("ECONNRESET");

      if (attempt < retries && isTransient) {
        await new Promise((res) => setTimeout(res, delayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

