const { Client } = require('pg');

const prefixes = ['aws-0', 'aws-1', 'aws-2', 'aws-3'];
const regions = [
  'ap-southeast-1', 'us-east-1', 'eu-central-1', 'us-west-2',
  'us-west-1', 'eu-west-1', 'ap-northeast-1', 'ap-southeast-2', 'us-east-2'
];
const password = "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";
const ref = "mbqiepxaqseltvkhaxoy";

async function testHost(prefix, region) {
  const host = `${prefix}-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2000
  });
  
  try {
    await client.connect();
    console.log(`\n🎉 SUCCESS: Connected to host ${host}!`);
    await client.end();
    return host;
  } catch (err) {
    const errMsg = (err.message || String(err)).toLowerCase();
    if (!errMsg.includes('tenant/user') && !errMsg.includes('tenant') && !errMsg.includes('enotfound')) {
      console.log(`\n🔴 DIFFERENT ERROR on ${host}:`, err.message || err);
      return host; // Found it!
    } else {
      process.stdout.write('.');
    }
    return null;
  }
}

async function main() {
  console.log("Scanning all prefixes and regions...");
  const promises = [];
  for (const prefix of prefixes) {
    for (const region of regions) {
      promises.push(testHost(prefix, region));
    }
  }
  
  const results = await Promise.all(promises);
  const found = results.filter(Boolean);
  
  console.log("\nScan complete.");
  if (found.length > 0) {
    console.log("Found matching hosts:", found);
  } else {
    console.log("No matching hosts found.");
  }
}

main();
