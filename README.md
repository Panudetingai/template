# Template — Next.js + Elysia API (monorepo)

เทมเพลตสำหรับเริ่มโปรเจกต์ SaaS ใหม่ แยก **frontend** กับ **backend** ออกจากกันชัดเจน

| ส่วน | โฟลเดอร์ | ทำอะไร |
|------|----------|--------|
| Web | `apps/web` | Next.js 16 (UI, หน้า auth, onboarding, billing) |
| API | `apps/api` | Elysia บน Bun — verify token, profile, onboarding, **Stripe**, **AI (Groq)**, ฐานข้อมูล (Drizzle) |
| Shared | `packages/shared` | zod schemas ที่ใช้ร่วมกัน |

```
Browser ──(Supabase Auth: sign in/up, OAuth)──▶ Supabase
   │  access token (Bearer)
   ▼
apps/web ──Eden (type-safe)──▶ apps/api ──▶ Postgres (Supabase) / Redis / Stripe / Groq
                                  ▲
                    Stripe webhook ┘  POST /webhooks/stripe
```

- **Auth:** ผู้ใช้ login ผ่าน Supabase (อยู่ฝั่ง web) แล้ว API ตรวจ JWT ทุก request (`{ auth: true }`)
- **Secrets** (DB, Stripe, Groq, service role) อยู่ใน `apps/api/.env` เท่านั้น — web ไม่มี

## เริ่มต้นใช้งาน

ต้องมี [Bun](https://bun.sh) และโปรเจกต์ Supabase

```bash
bun install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# กรอกค่าในไฟล์ทั้งสอง แล้ว:
bun run db:migrate
bun run --filter @template/api db:functions
bun run db:seed
bun run dev
```

- Web: http://localhost:3000 · API: http://localhost:4000 · API docs: http://localhost:4000/docs
- Stripe / AI เป็น optional — route จะตอบ `503` จนกว่าจะใส่ key

ขั้นตอนละเอียดดูที่ skill `new-project-setup` (`.claude/skills/`)

## คำสั่ง (รันที่ root)

| คำสั่ง | ทำอะไร |
|--------|--------|
| `bun run dev` | รัน web + api พร้อมกัน |
| `bun run typecheck` | ตรวจ type ทุกแพ็กเกจ |
| `bun run test` | เทสต์ API (ใส่ `TEST_DATABASE_URL` เพื่อรันเทสต์ที่ใช้ DB) |
| `bun run db:generate` / `db:migrate` / `db:seed` | จัดการฐานข้อมูล |
| `bun run build` | build ทั้งหมด |

## Skills (สำหรับ Claude Code)

| Skill | ใช้เมื่อ |
|-------|---------|
| `new-project-setup` | เริ่มโปรเจกต์ใหม่จากเทมเพลต |
| `add-api-module` | เพิ่ม endpoint/feature ใน backend + เรียกจาก web |
| `stripe-billing` | ตั้งค่า/ทดสอบ Stripe, gate ฟีเจอร์ตาม plan |
| `ai-feature` | เพิ่ม AI provider/endpoint/streaming |
| `db-migration` | แก้ schema, migration, seed |

## Deploy

- **Web:** Vercel (root directory `apps/web`) — ตั้ง `NEXT_PUBLIC_*` ให้ครบ โดย `NEXT_PUBLIC_API_URL` ชี้ไป API
- **API:** ที่ไหนก็ได้ที่รัน Bun/Docker ได้ (Railway, Fly.io, Render) — `bun run --filter @template/api start`; ตั้ง `WEB_URL` ให้ตรงกับโดเมน web (ใช้กับ CORS และ Stripe redirect)
