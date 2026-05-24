const dns = require('dns');

dns.lookup('db.mbqiepxaqseltvkhaxoy.supabase.co', (err, address) => {
  if (err) {
    console.error("DNS lookup failed for db host:", err);
  } else {
    console.log("IP Address for db host:", address);
  }
});
