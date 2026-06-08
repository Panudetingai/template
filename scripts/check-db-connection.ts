import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

function getConnectionString() {
  return (
    process.env.DATABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL
  );
}

function getCredentials() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL or NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM in .env.local.",
    );
  }

  const url = new URL(connectionString.replace("postgresql://", "http://"));
  const isSupabasePooler = url.hostname.includes("pooler.supabase.com");

  return {
    host: url.hostname,
    port: isSupabasePooler ? 5432 : Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
  };
}

async function main() {
  const credentials = getCredentials();
  const client = new pg.Client({
    ...credentials,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log(
      `Database connection OK (${credentials.host}:${credentials.port}).`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("Database connection failed:", message);
    console.error("");
    console.error("For Supabase + drizzle-kit pull:");
    console.error(
      "1. Open Supabase Dashboard → Project Settings → Database → Connection string",
    );
    console.error(
      "2. Copy the Session pooler URI (port 5432), not Transaction pooler (6543)",
    );
    console.error(
      "3. Replace [YOUR-PASSWORD] with your database password, then update .env.local",
    );
    console.error(
      "4. Set DATABASE_URL to that Session pooler URI (recommended for drizzle-kit)",
    );

    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

void main();
