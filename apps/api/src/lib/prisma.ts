import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Provide a dummy fallback so Prisma doesn't throw a validation error at startup
// when DATABASE_URL is not set. All actual DB calls fall back to mockDb on error.
if (!process.env['DATABASE_URL']) {
  process.env['DATABASE_URL'] = 'postgresql://mock:mock@localhost:5432/mock?connect_timeout=3';
}

// Append fast-fail timeouts to Supabase URLs so the app doesn't hang
// for 30 s on every request when the project is paused.
const rawUrl = process.env['DATABASE_URL'] ?? '';
if (rawUrl.includes('supabase.co') && !rawUrl.includes('connect_timeout')) {
  const separator = rawUrl.includes('?') ? '&' : '?';
  process.env['DATABASE_URL'] = `${rawUrl}${separator}connect_timeout=5&pool_timeout=5`;
}
if (process.env['DIRECT_URL']) {
  const raw = process.env['DIRECT_URL'];
  if (raw.includes('supabase.co') && !raw.includes('connect_timeout')) {
    const sep = raw.includes('?') ? '&' : '?';
    process.env['DIRECT_URL'] = `${raw}${sep}connect_timeout=5`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
