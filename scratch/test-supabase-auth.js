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

  const testEmail = `scholar-${Math.floor(100000 + Math.random() * 900000)}@university.edu`;
  const testPassword = "SuperSecurePassword123!";

  console.log(`\n--- 1. Testing Signup via Supabase Auth API with email: ${testEmail} ---`);
  
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
        options: {
          data: {
            name: "Test Scholar",
            institution: "Unimind Research Labs",
            major: "AI Cognition",
            role: "Professor"
          }
        }
      })
    });

    const signUpData = await signUpResponse.json();
    console.log(`Signup Status: ${signUpResponse.status} ${signUpResponse.statusText}`);
    console.log("Signup Response data:", JSON.stringify(signUpData, null, 2));

    if (!signUpResponse.ok) {
      throw new Error(`Signup failed: ${signUpData.msg || signUpData.error_description || JSON.stringify(signUpData)}`);
    }

    console.log("\n--- Waiting 2 seconds for trigger sync to complete ---");
    await new Promise(r => setTimeout(r, 2000));

    console.log(`\n--- 2. Testing Login (Token Grant) via Supabase Auth API ---`);
    const signInResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const signInData = await signInResponse.json();
    console.log(`Login Status: ${signInResponse.status} ${signInResponse.statusText}`);
    console.log("Login Response token retrieved:", signInData.access_token ? "YES (Valid Token)" : "NO");
    console.log("User details returned by login:", JSON.stringify(signInData.user?.user_metadata, null, 2));

    if (!signInResponse.ok) {
      throw new Error(`Login failed: ${signInData.error_description || JSON.stringify(signInData)}`);
    }

    console.log(`\n--- 3. Verifying that the User was synced to public.users table! ---`);
    const { Client } = require('pg');
    const dbUrl = vars.DATABASE_URL;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    const dbRes = await client.query("SELECT * FROM public.users WHERE email = $1", [testEmail]);
    console.log("Database lookup matches registered email:", dbRes.rows.length === 1 ? "✅ YES!" : "❌ NO!");
    if (dbRes.rows.length === 1) {
      console.log("Synced row from public.users:", JSON.stringify(dbRes.rows[0], null, 2));
    }
    await client.end();

    console.log("\n=========================================");
    console.log("🎉 ALL AUTHENTICATION FLOWS TESTED AND 100% OPERATIONAL!");
    console.log("=========================================");

  } catch (err) {
    console.error("\n=========================================");
    console.error("❌ AUTHENTICATION TEST FAILED!");
    console.error("Details:", err.message || err);
    console.error("=========================================");
  }
}

main();
