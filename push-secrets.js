const fs = require('fs');
const { execSync } = require('child_process');

const secrets = JSON.parse(fs.readFileSync('.secrets.json', 'utf8'));

for (const [key, value] of Object.entries(secrets)) {
  console.log(`Pushing ${key}...`);
  try {
    execSync(`npx wrangler pages secret put ${key} --project-name uni-mind`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`Successfully pushed ${key}.`);
  } catch (error) {
    console.error(`Failed to push ${key}:`, error.message);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}
