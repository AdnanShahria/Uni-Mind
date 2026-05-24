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

  console.log(`Pinging Supabase REST API at ${supabaseUrl} using key from .dev.vars...`);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log("=========================================");
    console.log(`HTTP Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("REST API successfully connected! Supported tables & endpoints:", Object.keys(data.definitions || {}));
      console.log("=========================================");
    } else {
      const txt = await response.text();
      console.log("REST API responded with an error:", txt);
      console.log("=========================================");
    }
  } catch (err) {
    console.error("=========================================");
    console.error("REST API CONNECTION FAILED!");
    console.error("Details:", err.message || err);
    console.error("=========================================");
  }
}

main();
