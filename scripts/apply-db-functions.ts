import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

config({ path: ".env.local" });

const SQL_DIR = join(import.meta.dir, "db");

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL or NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM in .env.local.",
    );
  }

  return connectionString;
}

async function main() {
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const files = readdirSync(SQL_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No .sql files found in scripts/db.");
      return;
    }

    for (const file of files) {
      const sql = readFileSync(join(SQL_DIR, file), "utf8");
      await pool.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    console.log(`\nDone — applied ${files.length} SQL file(s).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to apply DB functions:", message);
    console.error(
      "\nNote: creating a trigger on auth.users requires elevated privileges.",
    );
    console.error(
      "If this fails, paste scripts/db/handle-new-user.sql into the Supabase SQL editor.",
    );
    process.exit(1);
  } finally {
    await pool.end().catch(() => undefined);
  }
}

void main();
