const dns = require('dns');

const regions = [
  'ap-southeast-1', 'us-east-1', 'ap-south-1', 'eu-central-1',
  'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'me-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-2'
];

async function checkDNS(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        resolve(null);
      } else {
        resolve(address);
      }
    });
  });
}

async function main() {
  console.log("Checking DNS for regions...");
  for (const region of regions) {
    const ip = await checkDNS(region);
    if (ip) {
      console.log(`Region: ${region} resolved to IP: ${ip}`);
    }
  }
  console.log("DNS Check Done.");
}

main();
