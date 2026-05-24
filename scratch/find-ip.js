const dns = require('dns');

dns.lookup('mbqiepxaqseltvkhaxoy.supabase.co', (err, address) => {
  if (err) {
    console.error("DNS lookup failed:", err);
  } else {
    console.log("IP Address for mbqiepxaqseltvkhaxoy.supabase.co:", address);
  }
});
