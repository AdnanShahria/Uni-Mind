#!/usr/bin/env node
/**
 * UniMind Dev Server — Pretty Startup Script
 * Runs `npm run dev` with beautiful terminal output, service status indicators,
 * and soothing API request logging.
 */

const { spawn } = require('child_process');
const readline = require('readline');

// ANSI color codes
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  // Colors
  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  // Bright
  bRed:    '\x1b[91m',
  bGreen:  '\x1b[92m',
  bYellow: '\x1b[93m',
  bBlue:   '\x1b[94m',
  bMagenta:'\x1b[95m',
  bCyan:   '\x1b[96m',
  bWhite:  '\x1b[97m',
  // BG
  bgGreen: '\x1b[42m',
  bgBlue:  '\x1b[44m',
  bgYellow:'\x1b[43m',
  bgRed:   '\x1b[41m',
  bgMagenta:'\x1b[45m',
  bgCyan:  '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const clear = '\x1Bc';
const logo = `
${c.bMagenta}${c.bold}  ██╗   ██╗███╗   ██╗██╗███╗   ███╗██╗███╗   ██╗██████╗ ${c.reset}
${c.bMagenta}${c.bold}  ██║   ██║████╗  ██║██║████╗ ████║██║████╗  ██║██╔══██╗${c.reset}
${c.bMagenta}${c.bold}  ██║   ██║██╔██╗ ██║██║██╔████╔██║██║██╔██╗ ██║██║  ██║${c.reset}
${c.magenta}${c.bold}  ██║   ██║██║╚██╗██║██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║${c.reset}
${c.magenta}${c.bold}  ╚██████╔╝██║ ╚████║██║██║ ╚═╝ ██║██║██║ ╚████║██████╔╝${c.reset}
${c.magenta}   ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ ${c.reset}
`;

const divider = `${c.dim}  ${'─'.repeat(56)}${c.reset}`;

function printBanner() {
  process.stdout.write(clear);
  console.log(logo);
  console.log(`  ${c.bMagenta}${c.bold}AI-Powered Academic Ecosystem${c.reset}  ${c.dim}v1.0.0${c.reset}`);
  console.log(divider);
  console.log();
}

const services = {
  frontend:  { label: 'Frontend  (Vite)',           icon: '⚡', url: 'http://localhost:8788',          status: 'starting', color: c.bCyan },
  worker:    { label: 'Worker    (Wrangler)',        icon: '🔧', url: 'http://127.0.0.1:8788',         status: 'starting', color: c.bBlue },
  turso:     { label: 'Turso DB  (Edge SQLite)',     icon: '🗄️ ', url: 'Cloudflare Turso Edge DB',       status: 'pending',  color: c.bGreen },
  api:       { label: 'API       (CF Pages Func)',   icon: '🌐', url: 'http://127.0.0.1:8788/api',     status: 'pending',  color: c.bYellow },
};

function statusBadge(status) {
  switch (status) {
    case 'starting': return `${c.yellow}${c.bold}  ● starting ${c.reset}`;
    case 'ready':    return `${c.bGreen}${c.bold}  ✔ ready    ${c.reset}`;
    case 'pending':  return `${c.dim}  ○ pending  ${c.reset}`;
    case 'error':    return `${c.bRed}${c.bold}  ✖ error    ${c.reset}`;
    default:         return `${c.dim}  ○ unknown  ${c.reset}`;
  }
}

function printServices() {
  // Move cursor up to overwrite previous service lines
  const lines = Object.keys(services).length + 4;
  process.stdout.write(`\x1b[${lines}A`);

  console.log(`  ${c.bold}${c.bWhite}Services${c.reset}`);
  console.log(divider);
  for (const [, svc] of Object.entries(services)) {
    const badge = statusBadge(svc.status);
    console.log(`  ${svc.icon} ${svc.color}${c.bold}${svc.label}${c.reset}  ${badge}  ${c.dim}${svc.url}${c.reset}`);
  }
  console.log(divider);
  console.log(`  ${c.dim}Press ${c.reset}${c.bold}Ctrl+C${c.reset}${c.dim} to stop all services${c.reset}`);
}

function printServicesInitial() {
  console.log(`  ${c.bold}${c.bWhite}Services${c.reset}`);
  console.log(divider);
  for (const [, svc] of Object.entries(services)) {
    const badge = statusBadge(svc.status);
    console.log(`  ${svc.icon} ${svc.color}${c.bold}${svc.label}${c.reset}  ${badge}  ${c.dim}${svc.url}${c.reset}`);
  }
  console.log(divider);
  console.log(`  ${c.dim}Press ${c.reset}${c.bold}Ctrl+C${c.reset}${c.dim} to stop all services${c.reset}`);
  console.log();
  console.log(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
  console.log(`  ${c.dim}${c.bold}Logs:${c.reset}`);
}

// ── API Request Logger ─────────────────────────────────────────
// Parses wrangler output to detect incoming HTTP requests and formats them nicely

function methodBadge(method) {
  const m = (method || '').toUpperCase();
  switch (m) {
    case 'GET':     return `${c.bgGreen}${c.black}${c.bold} GET    ${c.reset}`;
    case 'POST':    return `${c.bgBlue}${c.white}${c.bold} POST   ${c.reset}`;
    case 'PUT':     return `${c.bgYellow}${c.black}${c.bold} PUT    ${c.reset}`;
    case 'PATCH':   return `${c.bgCyan}${c.black}${c.bold} PATCH  ${c.reset}`;
    case 'DELETE':  return `${c.bgRed}${c.white}${c.bold} DELETE ${c.reset}`;
    case 'OPTIONS': return `${c.dim}${c.bgWhite}${c.black} OPTS   ${c.reset}`;
    default:        return `${c.dim} ${m.padEnd(6)} ${c.reset}`;
  }
}

function statusColor(code) {
  const n = Number(code);
  if (n >= 200 && n < 300) return c.bGreen;
  if (n >= 300 && n < 400) return c.bCyan;
  if (n >= 400 && n < 500) return c.bYellow;
  if (n >= 500)            return c.bRed;
  return c.white;
}

function routeCategory(path) {
  if (path.startsWith('/auth/'))          return { icon: '🔐', label: 'Auth',    color: c.bYellow };
  if (path.startsWith('/api/dynamic/'))   return { icon: '⚡', label: 'Dynamic', color: c.bCyan };
  if (path.startsWith('/api/'))           return { icon: '🌐', label: 'API',     color: c.bBlue };
  if (path.startsWith('/compress'))       return { icon: '📦', label: 'Compress',color: c.magenta };
  if (path === '/status')                 return { icon: '💚', label: 'Health',  color: c.bGreen };
  return null;
}

function formatTimestamp() {
  const now = new Date();
  return `${c.dim}${now.toLocaleTimeString()}${c.reset}`;
}

// Regex patterns for wrangler request/response lines
// Wrangler logs requests like: "GET /api/dynamic/users 200 OK (12ms)"  or "[wrangler] GET /path..."
// or sometimes: "GET http://localhost:8788/api/... 200 OK"
const requestPattern = /\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(\/\S+|https?:\/\/\S+)/i;
const statusPattern  = /\b(\d{3})\b/;

function tryFormatAsApiLog(line) {
  const reqMatch = line.match(requestPattern);
  if (!reqMatch) return null;

  const method = reqMatch[1].toUpperCase();
  let reqPath = reqMatch[2];

  // Extract path from full URL if needed
  try {
    if (reqPath.startsWith('http')) {
      reqPath = new URL(reqPath).pathname;
    }
  } catch { /* use as-is */ }

  // Only show API/auth routes, skip static assets
  const cat = routeCategory(reqPath);
  if (!cat) return null;

  // Skip OPTIONS preflight from cluttering
  if (method === 'OPTIONS') return null;

  // Extract status code if present
  const statusMatch = line.match(statusPattern);
  const status = statusMatch ? statusMatch[1] : '';

  // Extract timing if present
  const timeMatch = line.match(/\((\d+(?:\.\d+)?)\s*ms\)/);
  const timing = timeMatch ? `${timeMatch[1]}ms` : '';

  // Build the pretty log line
  const badge = methodBadge(method);
  const time  = formatTimestamp();

  let statusStr = '';
  if (status) {
    const sc = statusColor(status);
    statusStr = `  ${sc}${c.bold}${status}${c.reset}`;
  }

  let timingStr = '';
  if (timing) {
    timingStr = `  ${c.dim}${timing}${c.reset}`;
  }

  // Highlight the table name in dynamic routes
  let displayPath = reqPath;
  const dynamicMatch = reqPath.match(/^\/api\/dynamic\/(\w+)/);
  if (dynamicMatch) {
    displayPath = `/api/dynamic/${c.bCyan}${c.bold}${dynamicMatch[1]}${c.reset}`;
  }

  return `  ${c.dim}│${c.reset} ${time}  ${badge}  ${cat.icon} ${cat.color}${displayPath}${c.reset}${statusStr}${timingStr}`;
}

// ── Start ──────────────────────────────────────────────────────

printBanner();
printServicesInitial();

// Start the actual dev process
const devProc = spawn('npm run dev', {
  cwd: process.cwd(),
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let allOutput = '';
let apiRequestCount = 0;

function processLine(line) {
  allOutput += line + '\n';

  // Detect service readiness from output
  if (line.includes('VITE') && line.includes('ready')) {
    services.frontend.status = 'ready';
    printServices();
  }
  if (line.includes('Ready on http://127.0.0.1:8788') || line.includes('Starting local server')) {
    services.worker.status = 'ready';
    services.api.status = 'ready';
    printServices();
  }
  if (line.includes('TURSO_DATABASE_URL') || line.includes('tursoUrlPresent')) {
    services.turso.status = 'ready';
    printServices();
  }
  if (line.includes('Compiled Worker successfully')) {
    services.worker.status = 'ready';
    printServices();
  }
  // Detect env variable injection (turso is available)
  if (line.includes('injected env') || line.includes('.dev.vars')) {
    services.turso.status = 'ready';
    printServices();
  }

  // ── Try to format as a soothing API log ────────────────────
  const apiLog = tryFormatAsApiLog(line);
  if (apiLog) {
    apiRequestCount++;
    // Print a separator header the first time
    if (apiRequestCount === 1) {
      console.log();
      console.log(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
      console.log(`  ${c.bWhite}${c.bold}🌐 API Requests${c.reset}`);
      console.log(`  ${c.dim}${'─'.repeat(56)}${c.reset}`);
    }
    console.log(apiLog);
    return;
  }

  // ── Default log formatting ─────────────────────────────────
  let prefix = `  ${c.dim}│${c.reset} `;
  let colored = line;

  // Skip noisy wrangler internal lines for cleaner output
  if (line.includes('[mf:') || line.includes('Debugger listening') || line.includes('Debugger attached')) {
    return; // suppress
  }

  if (line.includes('[proxy]:') || line.includes('VITE')) {
    prefix = `  ${c.bCyan}│${c.reset} `;
    colored = line.replace('[proxy]:', `${c.bCyan}[vite]${c.reset}`);
  } else if (line.includes('wrangler') || line.includes('[wrangler')) {
    prefix = `  ${c.bBlue}│${c.reset} `;
  } else if (line.includes('error') || line.includes('Error') || line.includes('ERROR')) {
    prefix = `  ${c.bRed}│${c.reset} `;
    colored = `${c.bRed}${line}${c.reset}`;
  } else if (line.includes('WARNING') || line.includes('⚠') || line.includes('▲')) {
    prefix = `  ${c.yellow}│${c.reset} `;
    colored = `${c.yellow}${line}${c.reset}`;
  } else if (line.includes('✨') || line.includes('Ready') || line.includes('ready')) {
    prefix = `  ${c.bGreen}│${c.reset} `;
    colored = `${c.bGreen}${line}${c.reset}`;
  }

  console.log(`${prefix}${colored}`);
}

// Read stdout line by line
const rlOut = readline.createInterface({ input: devProc.stdout });
rlOut.on('line', processLine);

const rlErr = readline.createInterface({ input: devProc.stderr });
rlErr.on('line', (line) => {
  processLine(line);
});

devProc.on('exit', (code) => {
  console.log();
  console.log(divider);
  if (apiRequestCount > 0) {
    console.log(`  ${c.dim}Total API requests logged: ${c.bold}${apiRequestCount}${c.reset}`);
  }
  if (code === 0) {
    console.log(`  ${c.bGreen}${c.bold}✔ Dev server stopped cleanly.${c.reset}`);
  } else {
    console.log(`  ${c.bRed}${c.bold}✖ Dev server exited with code ${code}.${c.reset}`);
  }
  console.log(divider);
  process.exit(code ?? 0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log();
  console.log(`  ${c.yellow}${c.bold}⏹ Stopping UniMind dev server...${c.reset}`);
  devProc.kill('SIGINT');
});
