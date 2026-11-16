---
name: db-migration
description: Use when changing the database schema, adding tables, writing SQL functions/triggers, or seeding data in this template (Drizzle + Supabase Postgres). Trigger on "migration", "add a table", "add a column", "schema", "seed".
---

# Database changes

Schema source of truth: `apps/api/drizzle/schema.ts`. Migrations: `apps/api/drizzle/*.sql` (committed). Only the API talks to the DB.

## Workflow
1. Edit `drizzle/schema.ts`.
2. `bun run db:generate` — creates the next `NNNN_*.sql` + snapshot. **Read the SQL** before applying; make sure it only contains what you intended.
3. `bun run db:migrate` — applies it to `DATABASE_URL`.
4. Update services/zod schemas; `bun run typecheck && bun run test`.
Never hand-edit an applied migration; add a new one. Never use `drizzle-kit push` on shared databases.

## Rules for this stack
- **Every table ends with `.enableRLS()` and has no public policies.** The API connects as the DB owner (bypasses RLS); RLS-with-no-policies blocks the Supabase REST API, so the anon key can't read or write your tables. Only add policies if you deliberately query a table from the browser with supabase-js.
- User-owned tables: `userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" })`, and always filter by the authenticated user's id in the service.
- Unique index/constraint on anything used in `onConflictDoUpdate`.
- Timestamps: `timestamp({ mode: "string" }).defaultNow()` like the existing tables.

## SQL functions / triggers
Put idempotent SQL (`create or replace …`) in `apps/api/scripts/db/*.sql`; `bun run --filter @template/api db:functions` applies them in filename order. (`handle_new_user` mirrors `auth.users` → `public.users`; creating triggers on `auth.users` may need the Supabase SQL editor.)

## Seed data
Static content shared with the UI lives in `packages/shared` (e.g. onboarding steps) and is upserted by `scripts/seed-onboarding-steps.ts` — copy that pattern, upsert on a unique key so re-runs are safe.

## Local Postgres for tests
Any Postgres works; create a stub `auth` schema first (`create schema auth; create function auth.uid() returns uuid language sql as 'select gen_random_uuid()';`), apply the SQL, then `TEST_DATABASE_URL=postgres://… bun run test`.
