import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// ─── Build the final DATABASE_URL with robust timeouts ─────────────────────

function buildDatabaseUrl(raw: string): string {
  if (!raw || raw.includes('mock@localhost')) return raw;

  try {
    const u = new URL(raw);

    // Supabase transaction-mode pooler (pgbouncer): use generous timeouts
    // so the pool doesn't time out while fetching a connection under load.
    if (!u.searchParams.has('connect_timeout')) {
      u.searchParams.set('connect_timeout', '15');
    }
    if (!u.searchParams.has('pool_timeout')) {
      u.searchParams.set('pool_timeout', '15');
    }
    // Limit pool size — Supabase free tier allows ~15 simultaneous connections.
    // Prisma's default is cpu_count * 2 + 1 which can easily exhaust this.
    if (!u.searchParams.has('connection_limit')) {
      u.searchParams.set('connection_limit', '5');
    }

    return u.toString();
  } catch {
    // Malformed URL — return as-is and let Prisma surface the real error
    return raw;
  }
}

// Provide a dummy fallback so Prisma doesn't throw a validation error at startup
// when DATABASE_URL is not set. All actual DB calls fall back to mockDb on error.
if (!process.env['DATABASE_URL']) {
  process.env['DATABASE_URL'] = 'postgresql://mock:mock@localhost:5432/mock?connect_timeout=3';
}

const finalDatabaseUrl = buildDatabaseUrl(process.env['DATABASE_URL'] ?? '');
const finalDirectUrl   = process.env['DIRECT_URL']
  ? buildDatabaseUrl(process.env['DIRECT_URL'])
  : undefined;

// ─── Singleton Prisma Client ────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        // Pass the fully-built URL directly so the env-var overrides in this
        // file (connect_timeout, pool_timeout, connection_limit) are always
        // respected — even if Prisma re-reads DATABASE_URL internally.
        url: finalDatabaseUrl,
      },
    },
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
