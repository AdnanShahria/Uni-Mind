const https = require('https');

https.get('https://mbqiepxaqseltvkhaxoy.supabase.co/rest/v1/', (res) => {
  console.log("Status Code:", res.statusCode);
  console.log("Headers:");
  console.log(res.headers);
}).on('error', (e) => {
  console.error("Error:", e);
});
