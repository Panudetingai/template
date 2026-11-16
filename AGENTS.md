# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/.bun/next@*/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Repo layout (Bun workspaces monorepo)

- `apps/web` — Next.js 16 frontend. Talks to the backend **only** through the typed Eden client (`@/lib/api/client`). No DB, Redis, Stripe or AI keys here.
- `apps/api` — standalone Elysia backend (auth verification, profile, onboarding, Stripe billing, AI). Owns the database (Drizzle). Use relative imports only.
- `packages/shared` — zod schemas/constants used by both apps (`@template/shared/*`).

Project skills in `.claude/skills/`: `new-project-setup`, `add-api-module`, `stripe-billing`, `ai-feature`, `db-migration` — use them for those tasks.

Common commands (repo root): `bun run dev`, `bun run typecheck`, `bun run test`, `bun run db:generate`, `bun run db:migrate`.
