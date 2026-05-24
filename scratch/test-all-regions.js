const { Client } = require('pg');

const regions = [
  'ap-southeast-1', 'us-east-1', 'ap-south-1', 'eu-central-1',
  'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'me-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-2',
  'us-east-2', 'ap-southeast-3', 'ap-southeast-4', 'eu-south-1', 'eu-south-2', 'me-south-1',
  'af-south-1', 'ca-west-1', 'il-central-1'
];
const password = "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";
const ref = "mbqiepxaqseltvkhaxoy";

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });
  
  try {
    await client.connect();
    console.log(`\n🎉 SUCCESS: Connected to region ${region}!`);
    await client.end();
    return true;
  } catch (err) {
    const errMsg = (err.message || String(err)).toLowerCase();
    if (!errMsg.includes('tenant/user') && !errMsg.includes('tenant') && !errMsg.includes('enotfound')) {
      console.log(`\n🔴 DIFFERENT ERROR in ${region}:`, err.message || err);
      return true; // We found the region, even if auth failed!
    } else {
      process.stdout.write('.');
    }
    return false;
  }
}

async function main() {
  console.log("Scanning all regional poolers...");
  for (const region of regions) {
    await testRegion(region);
  }
  console.log("\nScan complete.");
}

main();
