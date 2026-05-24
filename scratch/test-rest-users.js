const fs = require('fs');
const path = require('path');

function getDevVars() {
  const devVarsPath = path.join(__dirname, '..', '.dev.vars');
  const vars = {};
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=["']?([^"'\r\n]+)["']?/);
      if (match) {
        vars[match[1]] = match[2];
      }
    }
  }
  return vars;
}

async function main() {
  const vars = getDevVars();
  const supabaseUrl = vars.SUPABASE_URL || "https://mbqiepxaqseltvkhaxoy.supabase.co";
  const supabaseAnonKey = vars.SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    console.error("Error: SUPABASE_ANON_KEY not found in .dev.vars");
    process.exit(1);
  }

  console.log(`GET from Supabase REST API: ${supabaseUrl}/rest/v1/users`);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log("=========================================");
    console.log(`HTTP Response Status: ${response.status} ${response.statusText}`);
    const txt = await response.text();
    console.log("Response text:", txt);
    console.log("=========================================");
  } catch (err) {
    console.error("=========================================");
    console.error("REST API CONNECTION FAILED!");
    console.error("Details:", err.message || err);
    console.error("=========================================");
  }
}

main();
