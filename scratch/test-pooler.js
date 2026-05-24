const { Client } = require('pg');

const regions = [
  'ap-southeast-1', 'us-east-1', 'ap-south-1', 'eu-central-1',
  'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'me-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-2'
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
    console.log(`✅ SUCCESS: Connected to region ${region}!`);
    await client.end();
    return true;
  } catch (err) {
    if (!err.message.includes('Tenant or user not found') && !err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
      console.log(`⚠️ INTERESTING for region ${region}:`, err.message);
    }
    return false;
  }
}

async function main() {
  console.log("Scanning all Supabase regional poolers...");
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\n🎉 Found active region: ${region}`);
      break;
    }
  }
  console.log("Done scanning.");
}

main();
