import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";

/**
 * Integration tests. Supabase is mocked with a tiny local server; the DB tests
 * need a Postgres with the migrations applied:
 *
 *   TEST_DATABASE_URL=postgres://... bun test
 *
 * Without TEST_DATABASE_URL only the DB-free tests run.
 */
const TEST_DB = process.env.TEST_DATABASE_URL;
const USER_ID = "11111111-1111-4111-8111-111111111111";
const WEBHOOK_SECRET = "whsec_test_secret";

const supabaseMock = Bun.serve({
  port: 0,
  fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === "/auth/v1/user") {
      return Response.json({ id: USER_ID, aud: "authenticated" });
    }
    if (pathname.startsWith("/auth/v1/admin/users/")) {
      return Response.json({ id: USER_ID });
    }
    return new Response("not found", { status: 404 });
  },
});

Object.assign(process.env, {
  NODE_ENV: "test",
  WEB_URL: "http://localhost:3000",
  DATABASE_URL: TEST_DB ?? "postgres://unused:unused@127.0.0.1:1/unused",
  SUPABASE_URL: `http://localhost:${supabaseMock.port}`,
  SUPABASE_PUBLISHABLE_KEY: "pub",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
  AI_RATE_LIMIT_PER_MINUTE: "2",
});
delete process.env.GROQ_API_KEY;
delete process.env.STRIPE_SECRET_KEY;

const { app } = await import("../src/app");
const { db } = await import("../src/lib/db");
const { stripeEvents } = await import("../drizzle/schema");

/** Same scheme Stripe uses: HMAC-SHA256 over `${timestamp}.${payload}`. */
const sign = (payload: string) => {
  const t = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", WEBHOOK_SECRET).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${v1}`;
};

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
  sub: USER_ID,
  email: "test@example.com",
  user_metadata: { username: "tester" },
  exp: Math.floor(Date.now() / 1000) + 3600,
})}.sig`;

const call = (path: string, init: RequestInit & { auth?: boolean } = {}) => {
  const { auth, ...rest } = init;
  return app.handle(
    new Request(`http://localhost${path}`, {
      ...rest,
      headers: {
        "content-type": "application/json",
        ...(auth ? { authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    }),
  );
};

afterAll(() => supabaseMock.stop());

describe("public + auth guard", () => {
  test("health", async () => {
    const res = await call("/health");
    expect(res.status).toBe(200);
  });

  test("protected routes reject missing/invalid tokens", async () => {
    expect((await call("/auth/me")).status).toBe(401);
    expect((await call("/billing/subscription")).status).toBe(401);
    expect((await call("/ai/generate", { method: "POST", body: JSON.stringify({ prompt: "hi" }) })).status).toBe(401);
    const bad = await call("/auth/me", { headers: { authorization: "Bearer nope" } });
    expect(bad.status).toBe(401);
    expect(await bad.json()).toMatchObject({ code: "unauthorized" });
  });

  test("validation errors are 422", async () => {
    const res = await call("/profile/update", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ username: "x" }),
    });
    expect(res.status).toBe(422);
  });
});

describe("billing without Stripe configured", () => {
  test("webhook rejects a bad signature", async () => {
    const res = await call("/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "t=1,v1=bad" },
    });
    expect(res.status).toBe(400);
  });
});

describe("ai", () => {
  test("is rate limited per user and 503s without a key", async () => {
    const body = JSON.stringify({ prompt: "hi" });
    const codes: number[] = [];
    for (let i = 0; i < 3; i++) {
      codes.push((await call("/ai/generate", { method: "POST", auth: true, body })).status);
    }
    expect(codes).toEqual([503, 503, 429]);
  });
});

describe.skipIf(!TEST_DB)("database-backed", () => {
  beforeAll(async () => {
    await db.execute("truncate table stripe_events, subscriptions, onboarding, users cascade");
  });

  test("auth/me creates the user on first call", async () => {
    const res = await call("/auth/me", { auth: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      id: USER_ID,
      email: "test@example.com",
      username: "tester",
      plan: "free",
    });
  });

  test("onboarding completes and is idempotent", async () => {
    const payload = JSON.stringify({
      username: "tester",
      role: "developer",
      goal: "work",
      teamSize: "solo",
    });
    for (let i = 0; i < 2; i++) {
      const res = await call("/onboarding/setup-profile", {
        method: "POST",
        auth: true,
        body: payload,
      });
      expect(res.status).toBe(200);
    }
    const status = await call("/onboarding/status", { auth: true });
    expect(await status.json()).toEqual({ completed: true });
  });

  test("billing subscription defaults to free", async () => {
    const res = await call("/billing/subscription", { auth: true });
    expect(await res.json()).toMatchObject({ plan: "free", status: null });
  });

  test("checkout is 503 until Stripe is configured", async () => {
    const res = await call("/billing/checkout", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ interval: "month" }),
    });
    expect(res.status).toBe(503);
  });

  test("webhook verifies signature and de-duplicates events", async () => {
    const payload = JSON.stringify({
      id: "evt_test_1",
      object: "event",
      type: "ping.test",
      data: { object: {} },
    });
    const send = () =>
      call("/webhooks/stripe", {
        method: "POST",
        body: payload,
        headers: {
          "stripe-signature": sign(payload),
        },
      });

    expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(200);
    const rows = await db.select().from(stripeEvents);
    expect(rows).toHaveLength(1);
  });
});
