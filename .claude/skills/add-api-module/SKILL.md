---
name: add-api-module
description: Use when adding or changing a backend endpoint/feature in apps/api (Elysia) and calling it from the web app with the typed Eden client. Trigger on "add an endpoint", "new API route", "new backend module".
---

# Add an API module

Each feature is a folder in `apps/api/src/modules/<name>/` with **`routes.ts`** (HTTP only: validation, auth, status codes) and **`service.ts`** (business logic + DB; no Elysia imports). Keep that split — it keeps services testable and reusable.

## Steps

1. **Shared schema first** — if the browser submits the data, put the zod schema in `packages/shared/src/<name>.ts`, add it to the `exports` map in `packages/shared/package.json`, and use the same schema in the web form and the route `body`.
2. **Service** — `modules/<name>/service.ts`. Take the authenticated user as an argument (`AuthUser` from `plugins/auth`), never read tokens here. Throw `HttpError` helpers from `lib/errors.ts` (`badRequest`, `notFound`, …) instead of returning error shapes.
3. **Routes**
   ```ts
   import { Elysia } from "elysia";
   import { authPlugin } from "../../plugins/auth";

   export const thingRoutes = new Elysia({ prefix: "/things", tags: ["things"] })
     .use(authPlugin)
     .get("/", ({ user }) => listThings(user.id), { auth: true })
     .post("/", ({ user, body }) => createThing(user, body), { auth: true, body: CreateThingSchema });
   ```
   `{ auth: true }` verifies the Supabase bearer token and injects a typed `user`. Omit it only for genuinely public routes.
4. **Register** — `.use(thingRoutes)` in `apps/api/src/app.ts`. Errors are already mapped to `{ message, code }` by the global `onError`.
5. **Call from web** — `import { api } from "@/lib/api/client"` (types flow from `App`) and wrap with `unwrap` + react-query:
   ```ts
   const things = useQuery({ queryKey: ["things"], queryFn: async () => unwrap(await api.things.get()) });
   ```
6. **Test** — add cases to `apps/api/test/` (see `api.test.ts`: `call(path, { auth: true })`). Run `bun run test` (set `TEST_DATABASE_URL` for DB-backed tests).
7. **Typecheck** — `bun run typecheck` (the web app type-checks against the API's `App` type, so a broken route breaks the web build too).

## Rules
- Use **relative imports** inside `apps/api` (no `@/` alias) — the web app type-checks API files and an alias would resolve against the wrong tsconfig.
- Rate-limit anything expensive: ``await rateLimit(`name:${user.id}`, limit)`` from `plugins/rate-limit`.
- Cache with `lib/cache.ts` (Redis when configured, memory otherwise) and always set a TTL.
- Webhooks (third-party → API) are public; authenticate by signature, never by bearer token.
