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

  const testEmail = `scholar-${Math.floor(100000 + Math.random() * 900000)}@university.edu`;
  const testPassword = "SuperSecurePassword123!";

  console.log(`Testing GoTrue /signup with root-level 'data' field...`);
  
  try {
    const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        data: {
          name: "Sir Isaac Newton",
          institution: "University of Cambridge",
          major: "Gravitational Mechanics",
          role: "Professor"
        }
      })
    });

    const signUpData = await signUpResponse.json();
    console.log(`Signup Status: ${signUpResponse.status}`);
    console.log("Returned User Metadata:", JSON.stringify(signUpData.user?.user_metadata, null, 2));

    console.log("\nWaiting 2 seconds for trigger sync...");
    await new Promise(r => setTimeout(r, 2000));

    const { Client } = require('pg');
    const dbUrl = vars.DATABASE_URL;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const dbRes = await client.query("SELECT * FROM public.users WHERE email = $1", [testEmail]);
    console.log("\nDatabase Row in public.users:");
    console.log(JSON.stringify(dbRes.rows[0], null, 2));
    await client.end();

  } catch (err) {
    console.error("Test failed:", err);
  }
}

main();
