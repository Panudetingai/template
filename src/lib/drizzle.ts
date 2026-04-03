import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { publicEnv } from "@/env/public";

const pool = new Pool({
  connectionString: publicEnv.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
});
const db = drizzle({
  client: pool,
});

export { db };
