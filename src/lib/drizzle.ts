import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL!,
});
const db = drizzle({
  client: pool,
});

export { db };
