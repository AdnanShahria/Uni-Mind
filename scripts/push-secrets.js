const fs = require('fs');
const { execSync } = require('child_process');

const secrets = JSON.parse(fs.readFileSync('.secrets.json', 'utf8'));

// List of secrets that failed or we need to push
const keysToPush = [
  'TURSO_AUTH_TOKEN',
  'R2_ACCOUNT_ID'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  for (const key of keysToPush) {
    const value = secrets[key];
    if (!value) {
      console.warn(`Warning: No value found for key ${key} in .secrets.json`);
      continue;
    }

    let success = false;
    const maxRetries = 5;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Pushing ${key} (Attempt ${attempt}/${maxRetries})...`);
      try {
        execSync(`npx wrangler pages secret put ${key} --project-name uni-mind`, {
          input: value,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`Successfully pushed ${key}.`);
        success = true;
        break;
      } catch (error) {
        console.error(`Failed to push ${key} on attempt ${attempt}:`, error.message);
        if (error.stdout) console.log(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
        
        if (attempt < maxRetries) {
          const delay = attempt * 3000;
          console.log(`Waiting ${delay / 1000}s before retrying...`);
          await sleep(delay);
        }
      }
    }

    if (!success) {
      console.error(`ERROR: Failed to push ${key} after ${maxRetries} attempts.`);
      process.exit(1);
    }
  }

  console.log("All missing secrets pushed successfully!");
}

main().catch(console.error);
