const dns = require('dns').promises;

async function main() {
  const host = 'db.mbqiepxaqseltvkhaxoy.supabase.co';
  console.log(`Resolving DNS for ${host}...`);

  try {
    const cnames = await dns.resolveCname(host);
    console.log("CNAME Records:", cnames);
  } catch (err) {
    console.log("CNAME Resolve failed:", err.message);
  }

  try {
    const resolved = await dns.resolve(host, 'ANY');
    console.log("ANY Records:", resolved);
  } catch (err) {
    console.log("ANY Resolve failed:", err.message);
  }

  try {
    const aaaa = await dns.resolve6(host);
    console.log("AAAA Records:", aaaa);
  } catch (err) {
    console.log("AAAA Resolve failed:", err.message);
  }

  try {
    const a = await dns.resolve4(host);
    console.log("A Records:", a);
  } catch (err) {
    console.log("A Resolve failed:", err.message);
  }
}

main();
