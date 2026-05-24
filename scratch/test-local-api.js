const fs = require('fs');
const path = require('path');

async function main() {
  const testEmail = `scholar-${Math.floor(100000 + Math.random() * 900000)}@university.edu`;
  const testPassword = "SuperSecurePassword123!";

  console.log("Checking if local API dev server is active...");
  
  // Wait for server to be responsive
  let retries = 5;
  let statusOk = false;
  while (retries > 0) {
    try {
      const res = await fetch("http://localhost:8787/status");
      if (res.ok) {
        statusOk = true;
        console.log("✅ Local API is online!");
        break;
      }
    } catch (e) {
      console.log(`Waiting for local API dev server (attempts left: ${retries})...`);
    }
    retries--;
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!statusOk) {
    console.error("❌ Error: Local API dev server is not responsive on port 8787.");
    process.exit(1);
  }

  console.log(`\n--- 1. Testing End-to-End Register Flow (/auth/register) for ${testEmail} ---`);
  try {
    const regRes = await fetch("http://localhost:8787/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Galileo Galilei",
        email: testEmail,
        institution: "University of Pisa",
        major: "Observational Astronomy",
        role: "Professor",
        password: testPassword
      })
    });

    const regData = await regRes.json();
    console.log("Register Response Status:", regRes.status);
    console.log("Register Response Data:", JSON.stringify(regData, null, 2));

    if (!regRes.ok || !regData.success) {
      throw new Error(`Register failed: ${JSON.stringify(regData)}`);
    }

    console.log("\nWaiting 2 seconds for trigger sync...");
    await new Promise(r => setTimeout(r, 2000));

    console.log(`\n--- 2. Testing End-to-End Login Flow (/auth/login) ---`);
    const loginRes = await fetch("http://localhost:8787/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginRes.json();
    console.log("Login Response Status:", loginRes.status);
    console.log("Login Response Data:", JSON.stringify(loginData, null, 2));

    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log("\n=========================================");
    console.log("🎉 LOCAL WORKER LOGIN & REGISTER FLUSHED AND 100% OPERATIONAL!");
    console.log("=========================================");

  } catch (err) {
    console.error("\n=========================================");
    console.error("❌ LOCAL WORKER AUTH TEST FAILED!");
    console.error("Details:", err.message || err);
    console.error("=========================================");
  }
}

main();
