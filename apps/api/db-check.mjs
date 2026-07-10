/**
 * LearnFlow — Supabase connectivity diagnostic
 * Strips sslmode from URL and passes ssl config directly so pg doesn't
 * override rejectUnauthorized with string-parsed modes.
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('./apps/api/.env');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  process.env[key] = val;
}

const poolerUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

console.log('\n==============================');
console.log(' LearnFlow — DB Connectivity  ');
console.log('==============================\n');
console.log('Pooler URL :', poolerUrl ? poolerUrl.replace(/:[^:@]+@/, ':***@') : '❌ NOT SET');
console.log('Direct URL :', directUrl  ? directUrl.replace(/:[^:@]+@/, ':***@')  : '❌ NOT SET');
console.log('');

const require = createRequire(import.meta.url);
const { Client } = require('pg');

function stripSslMode(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('pgbouncer');
    u.searchParams.delete('connect_timeout');
    u.searchParams.delete('pool_timeout');
    return u.toString();
  } catch { return url; }
}

function buildConfig(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port) || 5432,
    database: u.pathname.slice(1),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  };
}

async function testWithPg(label, url) {
  let cfg;
  try { cfg = buildConfig(url); } catch (e) {
    console.log(`❌  ${label} — Invalid URL: ${e.message}\n`); return false;
  }
  const client = new Client(cfg);
  try {
    await client.connect();
    const res = await client.query(
      "SELECT current_database() AS db, now() AS ts, version() AS ver, " +
      "(SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') AS table_count;"
    );
    const row = res.rows[0];
    console.log(`✅  ${label}`);
    console.log(`    Database     : ${row.db}`);
    console.log(`    Server       : ${row.ver.split(',')[0]}`);
    console.log(`    Public tables: ${row.table_count}`);
    console.log(`    Server time  : ${row.ts}\n`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌  ${label}`);
    console.log(`    Error : ${err.message}\n`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function listAndCountTables(url) {
  let cfg;
  try { cfg = buildConfig(url); } catch { return []; }
  const client = new Client(cfg);
  try {
    await client.connect();
    const res = await client.query(`
      SELECT t.table_name,
        (SELECT count(*) FROM information_schema.columns c
         WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS col_count,
        pg_class.reltuples::bigint AS est_rows
      FROM information_schema.tables t
      JOIN pg_class ON pg_class.relname = t.table_name
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name;
    `);

    if (res.rows.length === 0) {
      console.log('⚠️  No tables in public schema — run: npm run db:push --workspace=apps/api\n');
    } else {
      console.log(`📋  Tables in Supabase (${res.rows.length} found):\n`);
      for (const r of res.rows) {
        const rowStr = r.est_rows < 0 ? '~0' : `~${r.est_rows}`;
        console.log(`    ✔  ${r.table_name.padEnd(32)} cols=${r.col_count.toString().padStart(2)}  rows=${rowStr}`);
      }
    }
    await client.end();
    return res.rows;
  } catch (err) {
    console.log('    Could not list tables:', err.message);
    try { await client.end(); } catch {}
    return [];
  }
}

(async () => {
  const poolOk   = poolerUrl ? await testWithPg('Pooler connection (port 6543)', poolerUrl) : false;
  const directOk = directUrl  ? await testWithPg('Direct connection (port 5432)', directUrl)  : false;

  const workingUrl = poolOk ? poolerUrl : (directOk ? directUrl : null);

  if (!workingUrl) {
    console.log('─────────────────────────────────────────────────────');
    console.log('🔴  DIAGNOSIS: Cannot connect to Supabase.\n');
    console.log('    Possible causes:');
    console.log('    1️⃣  Supabase project is PAUSED → https://supabase.com/dashboard');
    console.log('        Go to your project → click "Resume Project"');
    console.log('    2️⃣  Wrong credentials in apps/api/.env');
    console.log('    3️⃣  Firewall/ISP blocking outbound ports 5432 & 6543');
    console.log('─────────────────────────────────────────────────────\n');
    process.exit(1);
  }

  console.log('─────────────────────────────────────────────────────\n');
  const tables = await listAndCountTables(workingUrl);

  console.log('\n─────────────────────────────────────────────────────');
  if (tables.length === 0) {
    console.log('\n⚠️  Schema not applied yet.');
    if (!directOk) {
      console.log('    Direct URL unreachable — cannot run db:push from CLI.');
      console.log('    Run migration via Supabase SQL editor instead.\n');
    } else {
      console.log('    Run: npm run db:push --workspace=apps/api\n');
    }
  } else {
    console.log('\n🟢  Supabase connected & schema is present.');
    if (!directOk) {
      console.log('⚠️  Direct URL (port 5432) failed — schema migrations via CLI will not work.');
      console.log('    DIRECT_URL may be wrong or the host is unreachable.\n');
    } else {
      console.log('✅  Both pooler and direct connections healthy.');
      console.log('    Data IS being stored in Supabase!\n');
    }
  }
})();
