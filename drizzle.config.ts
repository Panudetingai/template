import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
});
