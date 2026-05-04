import { z } from "zod";

import { publicEnv } from "./public";

const serverEnvSchema = z.object({
  GROQ_API_KEY: z.string().optional(),
  /** LINE Messaging API – Official Account (webhook, push) */
  LINE_CHANNEL_ACCESS_TOKEN: z.string().optional(),
  LINE_CHANNEL_SECRET: z.string().optional(),
  /** OpenRouter: https://openrouter.ai/keys */
  OPENROUTER_API_KEY: z.string().optional(),
  /** Vision / JSON: e.g. openai/gpt-4o or google/gemini-2.0-flash-001 */
  OPENROUTER_VISION_MODEL: z.string().optional(),
  /** Image output: ใช้ modalities ตามเอกสาร OpenRouter; เช่น google/gemini-2.0-flash-exp:free */
  OPENROUTER_IMAGE_MODEL: z.string().optional(),
  /** ลงนาม download link สำหรับไฟล์ generateProduct */
  LINE_DOWNLOAD_SECRET: z.string().optional(),
  /** Worker / API design-to-product (multipart) — default http://127.0.0.1:8787/api/design-to-product */
  DESIGN_TO_PRODUCT_API_URL: z.string().optional(),
  /** Header X-API-Key สำหรับ design-to-product */
  DESIGN_TO_PRODUCT_API_KEY: z.string().optional(),
  /** Worker base URL เช่น https://<name>.workers.dev */
  AI_WORKER_BASE_URL: z.string().optional(),
  /** Header X-API-Key สำหรับ AI Worker (ทุก endpoint) */
  AI_WORKER_API_KEY: z.string().optional(),
  /**
   * ชื่อฟิลด์ multipart สำหรับแนบรูปเสื้อเป็นต้นที่สอง (เช่น garment)
   * ตั้งเป็นค่าว่างเพื่อส่งแค่รูป design + ข้อความ product
   */
  DESIGN_TO_PRODUCT_GARMENT_FORM_FIELD: z.string().optional(),
  /** ฟิลด์ product ใน multipart (เช่น white crew neck cotton t-shirt) — รายละเอียดเสื้อจากรูปส่งผ่าน garment */
  DESIGN_TO_PRODUCT_PRODUCT: z.string().optional(),
  /** Cloudinary — เก็บรูป origin / product-ai-generate แทน base64 ใน DB */
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  /** default: origin */
  CLOUDINARY_FOLDER_ORIGIN: z.string().optional(),
  /** default: product-ai-generate */
  CLOUDINARY_FOLDER_PRODUCT_AI: z.string().optional(),
  /** default: tiktok-posts — ใช้ URL จากโฟลเดอร์นี้ verify กับ TikTok (PULL_FROM URL) */
  CLOUDINARY_FOLDER_TIKTOK: z.string().optional(),
  /** TikTok Login Kit + Content Posting — https://developers.tiktok.com/ */
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  /**
   * Comma-separated OAuth scopes; must be enabled for your app in TikTok portal.
   * Default in code: user.info.basic only. For Content Posting after approval: e.g. user.info.basic,video.publish,video.list
   */
  TIKTOK_OAUTH_SCOPES: z.string().optional(),
  /**
   * ต้องตรงกับที่ลงทะเบียนใน TikTok Developer console
   * default: {NEXT_PUBLIC_APP_URL}/api/tiktok/oauth/callback
   */
  TIKTOK_REDIRECT_URI: z.string().url().optional(),
  COOKIE_PREFIX: z
    .string()
    .min(1, "Set COOKIE_PREFIX or NEXT_PUBLIC_COOKIE_PREFIX in your environment file."),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_VISION_MODEL: process.env.OPENROUTER_VISION_MODEL,
  OPENROUTER_IMAGE_MODEL: process.env.OPENROUTER_IMAGE_MODEL,
  LINE_DOWNLOAD_SECRET: process.env.LINE_DOWNLOAD_SECRET,
  DESIGN_TO_PRODUCT_API_URL: process.env.DESIGN_TO_PRODUCT_API_URL,
  DESIGN_TO_PRODUCT_API_KEY: process.env.DESIGN_TO_PRODUCT_API_KEY,
  AI_WORKER_BASE_URL: process.env.AI_WORKER_BASE_URL,
  AI_WORKER_API_KEY: process.env.AI_WORKER_API_KEY,
  DESIGN_TO_PRODUCT_GARMENT_FORM_FIELD:
    process.env.DESIGN_TO_PRODUCT_GARMENT_FORM_FIELD,
  DESIGN_TO_PRODUCT_PRODUCT: process.env.DESIGN_TO_PRODUCT_PRODUCT,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_ORIGIN: process.env.CLOUDINARY_FOLDER_ORIGIN,
  CLOUDINARY_FOLDER_PRODUCT_AI: process.env.CLOUDINARY_FOLDER_PRODUCT_AI,
  CLOUDINARY_FOLDER_TIKTOK: process.env.CLOUDINARY_FOLDER_TIKTOK,
  TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
  TIKTOK_OAUTH_SCOPES: process.env.TIKTOK_OAUTH_SCOPES,
  TIKTOK_REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI,
  COOKIE_PREFIX: process.env.COOKIE_PREFIX ?? publicEnv.NEXT_PUBLIC_COOKIE_PREFIX,
  SUPABASE_PROJECT_REF: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF ?? publicEnv.NEXT_PUBLIC_SUPABASE_PROJECT_REF,
});
