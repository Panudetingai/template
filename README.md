# template — เทมเพลตเว็บแอป (Next.js)

โปรเจกต์นี้เป็นเว็บแอปที่สร้างด้วย **Next.js** มีหน้าเข้าสู่ระบบ แถบเมนูด้านข้าง และเชื่อมต่อ **Supabase** (ฐานข้อมูล / auth) รวมถึงใช้ **Groq** สำหรับฟีเจอร์ AI

---

## สิ่งที่ต้องมีก่อนเริ่ม

- **Node.js** (เวอร์ชันที่รองรับ Next.js 16 — ดูที่ [เอกสาร Next.js](https://nextjs.org/docs) ได้)
- **npm** (หรือใช้ `pnpm` / `yarn` แทนได้ตามที่คุณถนัด)

---

## ติดตั้งและรันในเครื่อง

### 1. ติดตั้งแพ็กเกจ

```bash
npm install && bun install 
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม

คัดลอกไฟล์ตัวอย่างแล้วแก้ค่าให้ตรงกับโปรเจกต์ของคุณ:

```bash
cp .env.example .env.local
```

จากนั้นเปิด `.env.local` แล้วกรอกอย่างน้อย:

| หมวด | คำอธิบายสั้นๆ |
|------|----------------|
| **Supabase** | URL, key, และข้อมูลเชื่อมต่อฐานข้อมูล (ตามที่ได้จาก [Supabase Dashboard](https://supabase.com/dashboard)) |
| **GROQ_API_KEY** | ใช้กับฟีเจอร์ AI — สร้างได้ที่ [Groq Console](https://console.groq.com/) |
| **NEXT_PUBLIC_*** | ค่าที่เบราว์เซอร์ต้องรู้ (ชื่อแอป, URL ฐาน API ฯลฯ) |

รายละเอียดชื่อตัวแปรทั้งหมดดูได้ใน `.env.example`

### 3. รันโหมดพัฒนา

```bash
npm run dev && bun run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|--------|--------|
| `npm run dev` | รันเซิร์ฟเวอร์พัฒนา (hot reload) |
| `npm run build` | สร้าง production build |
| `npm run start` | รันแอปหลัง build แล้ว |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

---

## โครงสร้างโฟลเดอร์หลัก (สั้นๆ)

- `src/app/` — หน้าเว็บและ routing (App Router)
- `src/components/` — คอมโพเนนต์ UI และ layout
- `src/lib/` — ช่วยเชื่อม Supabase, Drizzle, Elysia client ฯลฯ
- `src/module/` — โมดูลเฉพาะ เช่น auth
- `src/services/` — บริการภายนอก (GitHub, LLM/Groq ฯลฯ)

---

## เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)

หมายเหตุ: เวอร์ชัน Next.js ในโปรเจกต์นี้อาจมี API หรือโครงสร้างไฟล์ต่างจากที่คุ้น — ถ้าจะแก้ routing หรือ server components ควรดูเอกสารใน `node_modules/next/dist/docs/` ตามที่โปรเจกต์แนะนำ
