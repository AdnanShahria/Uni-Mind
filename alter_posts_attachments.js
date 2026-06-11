import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const DB_URL = "libsql://unimind-adnanshahria2006.aws-ap-south-1.turso.io";
const DB_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzk4MTIwNDAsImlkIjoiMDE5ZTY1MTAtNWMwMS03N2Q3LWE5MDEtMjRmNDJmOTEyNTE5IiwicmlkIjoiMGQ3Yjc4OGQtZWUxNy00M2Q5LWIxNjQtNDUwNWJiMGQ5MjVlIn0.fsSzdDyIlKc1EsW1TMnDxuUnVdd1y2Xarc2paHV_jcvcETaY5TvmN4DSnhd9Sf7xUCTuax0OJhKmDMxHs8XqDQ";

async function main() {
  const turso = createClient({
    url: DB_URL,
    authToken: DB_AUTH_TOKEN,
  });

  try {
    console.log("Adding linked_event_id to posts...");
    await turso.execute(`
      ALTER TABLE posts ADD COLUMN linked_event_id TEXT REFERENCES events(id) ON DELETE SET NULL;
    `);
    console.log("Successfully added linked_event_id!");
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("Column linked_event_id already exists, skipping...");
    } else {
      console.error("Error adding linked_event_id:", error);
    }
  }

  try {
    console.log("Adding linked_resource_id to posts...");
    await turso.execute(`
      ALTER TABLE posts ADD COLUMN linked_resource_id TEXT REFERENCES notes(id) ON DELETE SET NULL;
    `);
    console.log("Successfully added linked_resource_id!");
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("Column linked_resource_id already exists, skipping...");
    } else {
      console.error("Error adding linked_resource_id:", error);
    }
  }

  console.log("Alterations complete.");
  process.exit(0);
}

main();
