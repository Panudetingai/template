# ai-worker-api

API สร้างภาพบน [Cloudflare Workers](https://developers.cloudflare.com/workers/) กับ [Workers AI](https://developers.cloudflare.com/workers-ai/) (SDXL, img2img, โมเดล vision สำหรับคำบรรยายภาพ)

## เริ่มต้น

1. สมัคร [Cloudflare Workers](https://workers.dev) (Free tier ใช้ทดสอบได้)
2. `npm install`
3. `npx wrangler login`
4. ตั้งค่า secret สำหรับคีย์เรียก API: `npx wrangler secret put API_KEY`
5. พัฒนาโลคอล: คัดลอก `.dev.vars.example` เป็น `.dev.vars` แล้วใส่ `API_KEY`
6. `npx wrangler dev` — เปิด `http://localhost:8787` (พอร์ตตามที่ wrangler แจ้ง)
7. Deploy: `npx wrangler deploy`

## โครงสร้างโปรเจกต์

- Router หลัก: `src/index.ts`
- Handler ต่อเส้นทาง: `src/handlers/`
- โมเดลภาพหลัก (text-to-image): `@cf/stabilityai/stable-diffusion-xl-base-1.0` (`src/config.ts`)
- img2img (try-on / refine): ตาม `IMG2IMG_MODEL` ใน `wrangler.jsonc` (ค่าเริ่มต้น `@cf/runwayml/stable-diffusion-v1-5-img2img`)

หลังแก้ bindings ใน `wrangler.jsonc` ให้รัน `npx wrangler types` เพื่ออัปเดต type ของ `Env`

---

## คู่มือการใช้งาน AI API (ภาษาไทย)

### การยืนยันตัวตน (API Key)

เส้นทางที่ต้องป้องกันต้องส่งคีย์เดียวกับที่ตั้งใน `API_KEY`:

- **Header:** `Authorization: Bearer <คีย์>` **หรือ**
- **Header:** `X-API-Key: <คีย์>`

ไม่มีคีย์ → `401`  
คีย์ไม่ตรง → `401`

### Rate limit

มีการจำกัดจำนวนคำขอต่อ IP ต่อช่วงเวลา (ค่าเริ่มต้นจาก `RATE_LIMIT_MAX_PER_WINDOW` + `RATE_LIMIT_WINDOW_SECONDS` ใน `wrangler.jsonc`) ผ่าน KV `RATE_LIMIT_KV`

### CORS

ตั้ง `ALLOWED_CORS_ORIGIN` ใน `wrangler.jsonc` (เช่น `*` หรือ origin จริงของเว็บคุณ)

---

### `GET /api/health`

ตรวจสอบว่า Worker ทำงาน — **ไม่ต้องใส่ API key**

**ตัวอย่าง**

```bash
curl -sS "https://<โดเมน-worker>/api/health"
```

---

### `POST /api/generate`

สร้างภาพจาก **prompt ข้อความ** (SDXL)  
คืนค่าเป็น **รูป PNG** (`Content-Type: image/png`)

**Body:** JSON

| ฟิลด์    | ประเภท   | บังคับ | คำอธิบาย                          |
|---------|----------|--------|-----------------------------------|
| `prompt`| `string` | ใช่    | คำอธิบายภาพ ความยาวจำกัดตาม `MAX_PROMPT_LENGTH` |

**ตัวอย่าง**

```bash
curl -sS -X POST "https://<โดเมน-worker>/api/generate" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A red sports car on a mountain road, photorealistic"}' \
  --output out.png
```

---

### `POST /api/try-on`

ลองสวมเสื้อผ้าเสมือน: อัปโหลด **รูปคน** + **รูปเสื้อผ้า** (แนะนำ flat lay / product shot)  
กระบวนการ: (1) vision อธิบายเสื้อ หรือรับคำอธิบายจากผู้ใช้ (2) img2img จากรูปคน

**Content-Type:** `multipart/form-data`

| ฟิลด์             | ประเภท | บังคับ | คำอธิบาย |
|------------------|--------|--------|-----------|
| `person`         | ไฟล์รูป | ใช่    | รูปบุคคล |
| `garment`        | ไฟล์รูป | ใช่    | รูปเสื้อผ้า |
| `garment_prompt` | string | ไม่    | ถ้าใส่จะ**ข้าม**โมเดล vision และใช้ข้อความนี้แทน |
| `extra_prompt`   | string | ไม่    | ต่อท้าย prompt ที่ระบบสร้าง |
| `strength`       | string (ตัวเลข) | ไม่ | strength ของ img2img (มีช่วงที่อนุญาตในโค้ด) |
| `guidance`       | string | ไม่    | guidance (ค่าเริ่มต้น ~7.5) |
| `negative_prompt`| string | ไม่    | negative prompt |
| `num_steps`      | string | ไม่    | จำนวน step (ช่วงที่กำหนดในโค้ด) |

**ตัวอย่าง**

```bash
curl -sS -X POST "https://<โดเมน-worker>/api/try-on" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F person=@person.jpg \
  -F garment=@shirt.png \
  --output tryon.png
```

---

### `POST /api/design-to-product`

อัปโหลด **ภาพดีไซน์/โลโก้** แล้วได้ภาพสินค้าเสื้อแบบโปร (text-to-image หรือโหมด “faithful” ที่วางดีไซน์บน mockup)

**Content-Type:** `multipart/form-data`

| ฟิลด์ | ประเภท | บังคับ | คำอธิบาย |
|-------|--------|--------|-----------|
| `design` | ไฟล์รูป | ใช่ | PNG/JPEG งานศิลป์ |
| `faithful` | string (เช่น `1`, `true`) | ไม่ | เปิดโหมดวางดีไซน์บนเสื้อเปล่า / mockup |
| `garment` | ไฟล์รูป | ไม่ | เมื่อ `faithful=1`: อัปโหลด mockup เสื้อเปล่า จะ**ไม่**สร้างเสื้อด้วย AI |
| `product` | string | ไม่ | คำอธิบายสินค้า (ค่าเริ่มต้นเป็นประเภทเสื้อยืดในโค้ด) |
| `shot` | string | ไม่ | `flat_lay` \| `hanger` \| `folded` \| `on_model_bust` |
| `design_prompt` | string | ไม่ | คำอธิบายดีไซน์เอง — **ข้าม vision** (ไม่ใช้เมื่อ `faithful=1`) |
| `creative_variation` | string | ไม่ | `subtle` \| `bold` \| `reinterpret` — สร้างแนวดีไซน์ใหม่จากต้นฉบับ |
| `extra_prompt` | string | ไม่ | ต่อท้าย prompt |
| `negative_prompt` | string | ไม่ | override negative (บางโหมดมี default ในระบบ) |
| `num_steps` | string | ไม่ | จำนวน step SDXL |
| **โหมด faithful เพิ่มเติม** | | | |
| `remove_bg` | flag | ไม่ | ตัดพื้นหลังอ่อนก่อน overlay |
| `faithful_blend` | string | ไม่ | blend โลโก้ เช่น `multiply` / `flat` (ดูค่าในโค้ด) |
| `faithful_logo_resize` | string | ไม่ | `smooth` (default) หรือ `sharp` |
| `logo_width_pct`, `logo_y_pct`, `logo_x_offset_pct` | string | ไม่ | ตำแหน่ง/ขนาดโลโก้บนเสื้อ |
| `faithful_refine` | flag | ไม่ | เปิด img2img หลัง composite เพื่อผสมเนื้อผ้า ( strength สูงอาจทำลายเสื้อ — ใช้เมื่อจำเป็น) |
| `faithful_refine_strength`, `faithful_refine_guidance`, `faithful_refine_steps` | string | ไม่ | พารามิเตอร์ขั้น refine |

**ตัวอย่าง — สร้างภาพสินค้าจากดีไซน์ (creative)**

```bash
curl -sS -X POST "https://<โดเมน-worker>/api/design-to-product" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F design=@artwork.png \
  -F 'product=short-sleeve black cotton t-shirt' \
  -F shot=flat_lay \
  --output product.png
```

**ตัวอย่าง — โหมด faithful: วางดีไซน์บน mockup ที่อัปโหลด**

```bash
curl -sS -X POST "https://<โดเมน-worker>/api/design-to-product" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F design=@logo.png \
  -F faithful=1 \
  -F garment=@mockup-blank.png \
  --output mockup.png
```

---

### รหัสข้อผิดพลาดที่พบบ่อย

| HTTP | ความหมายโดยสังเขป |
|------|-------------------|
| `400` | JSON/ฟอร์มไม่ถูกต้อง, ฟิลด์ขาด, ไฟล์ใหญ่เกิน `MAX_UPLOAD_BYTES` |
| `401` | ไม่มีหรือ API key ไม่ถูกต้อง |
| `415` | ต้องเป็น `multipart/form-data` (เส้นทาง try-on / design-to-product) |
| `500` | ข้อผิดพลาดภายใน / ตั้งค่าเซิร์ฟเวอร์ (เช่น ยังไม่ตั้ง `API_KEY`) |
| `502` | Workers AI / vision ล้มเหลว — ลองใหม่หรือส่ง prompt คู่มือ (`*_prompt`) |

---

### อ้างอิง

- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [ขีดจำกัดแพลตฟอร์ม](https://developers.cloudflare.com/workers/platform/limits/)
- ค่า env เพิ่มเติม: ดูที่ `wrangler.jsonc` และคอมเมนต์ด้านบนไฟล์
