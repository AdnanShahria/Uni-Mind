#!/usr/bin/env node
/**
 * UniMind DB Inspector — One-shot database schema & insights viewer
 * Shows all tables, columns, row counts, and DB health info.
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// ── ANSI Colors ──────────────────────────────────────────────
const c = {
  reset:    '\x1b[0m',
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  italic:   '\x1b[3m',
  red:      '\x1b[31m',
  green:    '\x1b[32m',
  yellow:   '\x1b[33m',
  blue:     '\x1b[34m',
  magenta:  '\x1b[35m',
  cyan:     '\x1b[36m',
  white:    '\x1b[37m',
  bGreen:   '\x1b[92m',
  bCyan:    '\x1b[96m',
  bMagenta: '\x1b[95m',
  bYellow:  '\x1b[93m',
  bBlue:    '\x1b[94m',
  bWhite:   '\x1b[97m',
  bgBlue:   '\x1b[44m',
  bgMagenta:'\x1b[45m',
};

const divider    = `${c.dim}  ${'─'.repeat(60)}${c.reset}`;
const thinLine   = `${c.dim}  ${'·'.repeat(60)}${c.reset}`;

// ── Parse .dev.vars ──────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.dev.vars');
let tursoUrl = '';
let tursoToken = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('TURSO_DATABASE_URL='))  tursoUrl   = line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '');
    if (line.startsWith('TURSO_AUTH_TOKEN='))     tursoToken = line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '');
  });
} else {
  console.error(`  ${c.red}${c.bold}✖ Could not find .dev.vars file!${c.reset}`);
  process.exit(1);
}

if (!tursoUrl || !tursoToken) {
  console.error(`  ${c.red}${c.bold}✖ Missing TURSO credentials in .dev.vars!${c.reset}`);
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────
function padRight(str, len) {
  return String(str).length >= len ? String(str).substring(0, len) : String(str) + ' '.repeat(len - String(str).length);
}

function padLeft(str, len) {
  return String(str).length >= len ? String(str) : ' '.repeat(len - String(str).length) + String(str);
}

function typeColor(type) {
  const t = (type || '').toUpperCase();
  if (t.includes('INT'))     return c.bCyan;
  if (t.includes('TEXT'))    return c.bGreen;
  if (t.includes('REAL') || t.includes('FLOAT') || t.includes('DOUBLE')) return c.bYellow;
  if (t.includes('BLOB'))    return c.magenta;
  if (t.includes('BOOL'))    return c.yellow;
  if (t.includes('DATE') || t.includes('TIME')) return c.bMagenta;
  return c.white;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();

  // Banner
  console.log();
  console.log(`  ${c.bMagenta}${c.bold}🗄️  UNI-MIND DATABASE INSPECTOR${c.reset}`);
  console.log(divider);
  console.log(`  ${c.dim}Endpoint:${c.reset}  ${c.cyan}${tursoUrl}${c.reset}`);
  console.log(`  ${c.dim}Time:${c.reset}      ${c.white}${new Date().toLocaleString()}${c.reset}`);
  console.log(divider);
  console.log();

  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  try {
    // ── 1. Fetch all tables ──────────────────────────────────
    const tablesRes = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' ORDER BY name"
    );
    const tableNames = tablesRes.rows.map(r => r.name);

    if (tableNames.length === 0) {
      console.log(`  ${c.yellow}⚠ No tables found in this database.${c.reset}`);
      process.exit(0);
    }

    console.log(`  ${c.bWhite}${c.bold}📋 TABLES (${tableNames.length})${c.reset}`);
    console.log(divider);
    console.log();

    let totalRows = 0;
    let totalColumns = 0;

    // ── 2. For each table, fetch columns and row count ───────
    for (const tableName of tableNames) {
      // Get columns
      const colsRes = await client.execute(`PRAGMA table_info(${tableName})`);
      const cols = colsRes.rows;
      totalColumns += cols.length;

      // Get row count
      const countRes = await client.execute(`SELECT COUNT(*) as cnt FROM ${tableName}`);
      const rowCount = countRes.rows[0]?.cnt ?? 0;
      totalRows += Number(rowCount);

      // Get index info
      const indexRes = await client.execute(`PRAGMA index_list(${tableName})`);
      const indexCount = indexRes.rows.length;

      // Table header
      const rowLabel = Number(rowCount) === 1 ? 'row' : 'rows';
      const idxLabel = indexCount === 1 ? 'index' : 'indexes';
      console.log(`  ${c.bCyan}${c.bold}┌─ ${tableName}${c.reset}  ${c.dim}(${rowCount} ${rowLabel}, ${indexCount} ${idxLabel})${c.reset}`);

      // Column header row
      console.log(`  ${c.dim}│  ${padRight('Column', 28)} ${padRight('Type', 18)} ${padRight('Nullable', 10)} ${padRight('PK', 4)}${c.reset}`);
      console.log(`  ${c.dim}│  ${'─'.repeat(28)} ${'─'.repeat(18)} ${'─'.repeat(10)} ${'─'.repeat(4)}${c.reset}`);

      // Each column
      for (const col of cols) {
        const colName  = padRight(col.name, 28);
        const colType  = padRight(col.type || 'ANY', 18);
        const nullable = padRight(col.notnull ? 'NOT NULL' : 'nullable', 10);
        const pk       = col.pk ? `${c.bYellow}★${c.reset}` : ' ';
        const tc       = typeColor(col.type);

        console.log(`  ${c.dim}│${c.reset}  ${c.white}${colName}${c.reset} ${tc}${colType}${c.reset} ${c.dim}${nullable}${c.reset} ${pk}`);
      }

      console.log(`  ${c.dim}└${'─'.repeat(63)}${c.reset}`);
      console.log();
    }

    // ── 3. Database Insights ─────────────────────────────────
    console.log(`  ${c.bWhite}${c.bold}📊 DATABASE INSIGHTS${c.reset}`);
    console.log(divider);
    console.log();

    // DB size (page_count * page_size)
    let dbSizeStr = 'N/A';
    try {
      const pageSizeRes  = await client.execute('PRAGMA page_size');
      const pageCountRes = await client.execute('PRAGMA page_count');
      const pageSize  = Number(pageSizeRes.rows[0]?.page_size ?? 0);
      const pageCount = Number(pageCountRes.rows[0]?.page_count ?? 0);
      if (pageSize && pageCount) {
        dbSizeStr = formatBytes(pageSize * pageCount);
      }
    } catch { /* ignore */ }

    // Top tables by row count
    const tableStats = [];
    for (const tableName of tableNames) {
      const countRes = await client.execute(`SELECT COUNT(*) as cnt FROM ${tableName}`);
      tableStats.push({ name: tableName, rows: Number(countRes.rows[0]?.cnt ?? 0) });
    }
    tableStats.sort((a, b) => b.rows - a.rows);

    const maxRowVal = Math.max(...tableStats.map(t => t.rows), 1);

    console.log(`  ${c.dim}  Metric               Value${c.reset}`);
    console.log(`  ${c.dim}  ${'─'.repeat(22)} ${'─'.repeat(30)}${c.reset}`);
    console.log(`  ${c.white}  Total Tables          ${c.bCyan}${c.bold}${tableNames.length}${c.reset}`);
    console.log(`  ${c.white}  Total Columns         ${c.bCyan}${c.bold}${totalColumns}${c.reset}`);
    console.log(`  ${c.white}  Total Rows            ${c.bCyan}${c.bold}${totalRows}${c.reset}`);
    console.log(`  ${c.white}  Database Size         ${c.bCyan}${c.bold}${dbSizeStr}${c.reset}`);
    console.log();

    // Bar chart of row distribution
    console.log(`  ${c.bWhite}${c.bold}📈 ROW DISTRIBUTION${c.reset}`);
    console.log(divider);
    console.log();

    const barMaxWidth = 30;
    for (const t of tableStats) {
      const barLen = maxRowVal > 0 ? Math.max(1, Math.round((t.rows / maxRowVal) * barMaxWidth)) : 1;
      const bar = '█'.repeat(barLen) + '░'.repeat(barMaxWidth - barLen);
      const label = padRight(t.name, 22);
      const count = padLeft(String(t.rows), 6);
      console.log(`  ${c.white}  ${label}${c.reset} ${c.bCyan}${bar}${c.reset} ${c.bold}${count}${c.reset}`);
    }

    console.log();

    // ── 4. Recent data samples ───────────────────────────────
    // Show a few recent rows from key tables if they exist
    const sampleTables = ['users', 'posts', 'communities'].filter(t => tableNames.includes(t));
    if (sampleTables.length > 0) {
      console.log(`  ${c.bWhite}${c.bold}🔍 RECENT DATA SAMPLES${c.reset}`);
      console.log(divider);
      console.log();

      for (const tbl of sampleTables) {
        try {
          const sampleRes = await client.execute(`SELECT * FROM ${tbl} ORDER BY ROWID DESC LIMIT 3`);
          const rows = sampleRes.rows;
          if (rows.length === 0) continue;

          console.log(`  ${c.bYellow}${c.bold}  ▸ ${tbl}${c.reset} ${c.dim}(latest ${rows.length})${c.reset}`);

          // Show column names
          const sampleCols = Object.keys(rows[0]);
          // Pick max 5 interesting columns
          const displayCols = sampleCols.slice(0, 5);

          for (const row of rows) {
            const parts = displayCols.map(col => {
              let val = row[col];
              if (val === null || val === undefined) val = 'NULL';
              val = String(val);
              if (val.length > 35) val = val.substring(0, 32) + '...';
              return `${c.dim}${col}:${c.reset} ${c.white}${val}${c.reset}`;
            });
            console.log(`    ${c.dim}│${c.reset} ${parts.join(`  ${c.dim}│${c.reset} `)}`);
          }
          console.log();
        } catch { /* skip */ }
      }
    }

    // ── 5. Footer ────────────────────────────────────────────
    const elapsed = Date.now() - startTime;
    console.log(divider);
    console.log(`  ${c.bGreen}${c.bold}✔ Inspection complete${c.reset}  ${c.dim}(${elapsed}ms)${c.reset}`);
    console.log(divider);
    console.log();

  } catch (err) {
    console.error(`  ${c.red}${c.bold}✖ Database error:${c.reset} ${err.message}`);
    process.exit(1);
  }
}

main();
