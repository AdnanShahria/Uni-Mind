const { createClient } = require('@libsql/client');
const fs = require('fs');
let u='', t='';
fs.readFileSync('.dev.vars', 'utf8').split('\n').forEach(l=>{
  if(l.startsWith('TURSO_DATABASE_URL=')) u=l.split('=')[1].trim().replace(/^\"|\"$/g,'');
  if(l.startsWith('TURSO_AUTH_TOKEN=')) t=l.split('=')[1].trim().replace(/^\"|\"$/g,'');
});
const c = createClient({url:u, authToken:t});
c.execute({
  sql: "INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, ?)",
  args: ['cbb61d43-54f3-4420-9b13-e40dea20def1', 'beb78b4e-b09b-4697-be6e-e89d2f3d2330', 'owner']
}).then(r => console.log('success')).catch(console.error);
