const token = Buffer.from(JSON.stringify({ userId: 'beb78b4e-b09b-4697-be6e-e89d2f3d2330', email: 'nisar.ruet@gmail.com' })).toString('base64');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

async function testFetch() {
  try {
    const ltgRes = await fetch('http://localhost:5173/api/dynamic/long_term_goals?eq_user_id=beb78b4e-b09b-4697-be6e-e89d2f3d2330', { headers });
    const ltgJson = await ltgRes.json();
    console.log("LTG Response:");
    console.log(ltgJson);

    const wgRes = await fetch('http://localhost:5173/api/dynamic/weekly_goals?eq_user_id=beb78b4e-b09b-4697-be6e-e89d2f3d2330', { headers });
    const wgJson = await wgRes.json();
    console.log("WG Response:");
    console.log(wgJson);

    const taskRes = await fetch('http://localhost:5173/api/tasks', { headers });
    const taskJson = await taskRes.json();
    console.log("Tasks Response:");
    console.log(taskJson);
  } catch (e) {
    console.error("Error fetching:", e);
  }
}
testFetch();
