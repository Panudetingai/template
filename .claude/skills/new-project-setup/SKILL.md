---
name: new-project-setup
description: Use when starting a new product from this template — renaming it, creating .env files, wiring Supabase, running the first migration/seed, and booting web + API. Trigger on "set up the template", "start a new project from this", "first run".
---

# New project setup

Monorepo: `apps/web` (Next.js), `apps/api` (Elysia, standalone), `packages/shared` (zod schemas shared by both). Bun workspaces.

## Steps

1. **Install** — `bun install` at the repo root (never inside an app).
2. **Rename the product**
   - root `package.json` `name`, and the `@template/*` scope if you want your own (search/replace `@template/` across `apps/` and `packages/`, then `bun install`).
   - `apps/web/.env.local`: `NEXT_PUBLIC_PRODUCT_NAME`, `NEXT_PUBLIC_APP_TITLE`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_COOKIE_PREFIX`.
   - `apps/web/public/manifest` + icons for the PWA.
3. **Env files** — `cp apps/web/.env.example apps/web/.env.local` and `cp apps/api/.env.example apps/api/.env`, then fill them. Rules:
   - Web gets browser-safe values only (Supabase URL + publishable key, `NEXT_PUBLIC_API_URL`).
   - Secrets (DB URL, service-role key, Stripe, Groq) live **only** in `apps/api/.env`.
4. **Supabase** — create a project; copy URL/publishable key/service-role key. Use the **Session pooler** URI (port 5432) as `DATABASE_URL`. In Auth settings set Site URL to `NEXT_PUBLIC_APP_URL` and add `<APP_URL>/auth/callback` to Redirect URLs. Enable the Google provider if you use it.
5. **Database** — from the root:
   ```bash
   bun run --filter @template/api db:check     # connectivity
   bun run db:migrate                          # applies apps/api/drizzle/*.sql
   bun run --filter @template/api db:functions # handle_new_user trigger on auth.users
   bun run db:seed                             # onboarding steps
   ```
6. **Run** — `bun run dev` (web :3000, api :4000, API docs at http://localhost:4000/docs).
7. **Verify** — `bun run typecheck && bun run test`. Sign up in the browser, finish onboarding, open `/billing`.

AI and Stripe are optional: their routes answer `503 not configured` until keys exist. See the `ai-feature` and `stripe-billing` skills.

## Gotchas
- Next.js here is v16 with breaking changes — read the relevant guide in `node_modules/.bun/next@*/node_modules/next/dist/docs/` before touching web routing/proxy code (see `AGENTS.md`).
- `NEXT_PUBLIC_APP_URL` must be HTTPS in production builds (set `NEXT_PUBLIC_CI=1` to bypass for local `next build`).
