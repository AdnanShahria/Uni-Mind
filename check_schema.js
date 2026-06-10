const { createClient } = require('@libsql/client');
const fs = require('fs');
let u='', t='';
fs.readFileSync('.dev.vars', 'utf8').split('\n').forEach(l=>{
  if(l.startsWith('TURSO_DATABASE_URL=')) u=l.split('=')[1].trim().replace(/^\"|\"$/g,'');
  if(l.startsWith('TURSO_AUTH_TOKEN=')) t=l.split('=')[1].trim().replace(/^\"|\"$/g,'');
});
const c = createClient({url:u, authToken:t});
c.execute("SELECT sql FROM sqlite_schema WHERE name = 'community_members';").then(r => console.log(r.rows[0].sql)).catch(console.error);
