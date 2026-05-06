import { randomBytes } from "node:crypto";

import { v2 as cloudinary } from "cloudinary";

import { serverEnv } from "@/env/server";

const DEFAULT_FOLDER_ORIGIN = "origin";
const DEFAULT_FOLDER_PRODUCT_AI = "product-ai-generate";
const DEFAULT_FOLDER_TIKTOK = "tiktok-posts";

function configureOnce() {
  const cloudName = serverEnv.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = serverEnv.CLOUDINARY_API_KEY?.trim();
  const apiSecret = serverEnv.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY และ CLOUDINARY_API_SECRET จำเป็น",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function cloudinaryFolderOrigin(): string {
  return (
    serverEnv.CLOUDINARY_FOLDER_ORIGIN?.trim() || DEFAULT_FOLDER_ORIGIN
  );
}

export function cloudinaryFolderProductAi(): string {
  return (
    serverEnv.CLOUDINARY_FOLDER_PRODUCT_AI?.trim() ||
    DEFAULT_FOLDER_PRODUCT_AI
  );
}

export function cloudinaryFolderTiktok(): string {
  return serverEnv.CLOUDINARY_FOLDER_TIKTOK?.trim() || DEFAULT_FOLDER_TIKTOK;
}

function sanitizePathSegment(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 120) || "anon";
}

/** รับ URL หรือ data URL — ใช้ก่อนส่ง Worker */
export async function bufferFromImageRef(ref: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const trimmed = ref.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const res = await fetch(trimmed);
    if (!res.ok) {
      throw new Error(`ดึงรูปจาก URL ไม่สำเร็จ: ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType =
      res.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";
    return { buffer, mimeType };
  }
  const m = /^data:([^;]+);base64,(.+)$/.exec(trimmed);
  if (!m?.[1] || !m?.[2]) {
    throw new Error("รูปอ้างอิงไม่ถูกต้อง (ต้องเป็น https URL หรือ data URL)");
  }
  return {
    buffer: Buffer.from(m[2], "base64"),
    mimeType: m[1],
  };
}

export type CloudinaryUploadKind = "origin" | "product-ai" | "tiktok";

/**
 * อัปโหลดรูปไป Cloudinary — โฟลเดอร์ origin หรือ product-ai-generate
 */
export async function uploadImageToCloudinary(input: {
  buffer: Buffer;
  mimeType: string;
  kind: CloudinaryUploadKind;
  ownerKey: string;
}): Promise<string> {
  configureOnce();
  const folder =
    input.kind === "origin"
      ? cloudinaryFolderOrigin()
      : input.kind === "tiktok"
        ? cloudinaryFolderTiktok()
        : cloudinaryFolderProductAi();
  const safeOwner = sanitizePathSegment(input.ownerKey);
  const suffix = `${Date.now()}_${randomBytes(4).toString("hex")}`;
  const dataUri = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;

  // TikTok PULL_FROM_URL requires a URL with explicit extension — force jpg so the URL always ends in .jpg
  const isTiktok = input.kind === "tiktok";

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: `${safeOwner}/${suffix}`,
    resource_type: "image",
    overwrite: false,
    ...(isTiktok ? { format: "jpg", quality: "auto" } : {}),
  });

  const url = result.secure_url;
  if (!url || typeof url !== "string") {
    throw new Error("Cloudinary ไม่คืน secure_url");
  }
  return url;
}

export async function uploadTiktokMediaToCloudinary(input: {
  buffer: Buffer;
  mimeType: string;
  ownerKey: string;
}): Promise<string> {
  configureOnce();
  const folder = cloudinaryFolderTiktok();
  const safeOwner = sanitizePathSegment(input.ownerKey);
  const suffix = `${Date.now()}_${randomBytes(4).toString("hex")}`;
  const trimmedMime = input.mimeType.trim().toLowerCase();
  const isVideo = trimmedMime.startsWith("video/");
  const dataUri = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: `${safeOwner}/${suffix}`,
    resource_type: isVideo ? "video" : "image",
    overwrite: false,
    format: isVideo ? undefined : "jpg",
    quality: "auto",
    // สร้าง derived image 1080px JPEG สำหรับ TikTok (eager_async: false = รอให้เสร็จก่อน)
    ...(isVideo
      ? {}
      : {
          eager: [{ width: 1080, crop: "scale", format: "jpg", quality: "auto" }],
          eager_async: false,
        }),
  });

  // ใช้ eager URL (1080px JPEG) ถ้ามี มิฉะนั้นใช้ original
  const url = (!isVideo && result.eager?.[0]?.secure_url) || result.secure_url;
  if (!url || typeof url !== "string") {
    throw new Error("Cloudinary ไม่คืน secure_url");
  }
  return url;
}
