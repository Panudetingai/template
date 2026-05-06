import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/env/server";

export const TIKTOK_MEDIA_PULL_PATH = "/api/tiktok/media-pull";

type Payload = {
  /** Cloudinary secure_url — โหลดกลับโดยเซิร์ฟเวอร์แล้วสตรีมให้ TikTok */
  u: string;
  exp: number;
};

function mediaPullHmacSecret(): string {
  const explicit = serverEnv.TIKTOK_MEDIA_PULL_SECRET?.trim();
  if (explicit) {
    return explicit;
  }
  const cs = serverEnv.TIKTOK_CLIENT_SECRET?.trim();
  if (cs) {
    return `tiktok-media-pull:${cs}`;
  }
  throw new Error(
    "ตั้ง TIKTOK_MEDIA_PULL_SECRET หรือ TIKTOK_CLIENT_SECRET สำหรับลงนาม URL โพรกซีรูป",
  );
}

/**
 * โทเกนรูปแบบ base64url(payload).hmac — ใช้ใน path /api/tiktok/media-pull/[token]
 */
export function signTiktokMediaPullToken(
  cloudinaryHttpsUrl: string,
  expiresAtMs: number,
): string {
  const u = cloudinaryHttpsUrl.trim();
  if (!u.startsWith("https://")) {
    throw new Error("URL รูปต้องเป็น https");
  }
  if (!/^https:\/\/res\.cloudinary\.com\/.+/i.test(u)) {
    throw new Error("URL รูปต้องเป็น Cloudinary (res.cloudinary.com)");
  }
  const cloudName = serverEnv.CLOUDINARY_CLOUD_NAME?.trim();
  if (cloudName && !u.includes(`/${cloudName}/`)) {
    throw new Error("URL รูปต้องอยู่ใน Cloudinary cloud ของแอปนี้");
  }
  const payload: Payload = { u, exp: expiresAtMs };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", mediaPullHmacSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyTiktokMediaPullToken(
  token: string,
): { url: string; exp: number } | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot <= 0) {
      return null;
    }
    const body = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expected = createHmac("sha256", mediaPullHmacSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
    const json = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Payload;
    if (
      typeof json.u !== "string" ||
      typeof json.exp !== "number" ||
      !/^https:\/\/res\.cloudinary\.com\/.+/i.test(json.u)
    ) {
      return null;
    }
    if (Date.now() > json.exp) {
      return null;
    }
    const cloudName = serverEnv.CLOUDINARY_CLOUD_NAME?.trim();
    if (cloudName && !json.u.includes(`/${cloudName}/`)) {
      return null;
    }
    return { url: json.u, exp: json.exp };
  } catch {
    return null;
  }
}

function tiktokMediaExtension(url: string): string {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.split("?")[0]?.toLowerCase() ?? "";
    }
  })();
  const match = /\.(jpe?g|png|webp|mp4|mov|m4v|webm)$/i.exec(pathname);
  if (match?.[1]) {
    const ext = match[1].toLowerCase();
    return ext === "jpeg" ? "jpg" : ext;
  }
  if (/\/video\/upload\//i.test(pathname)) {
    return "mp4";
  }
  return "jpg";
}

/** URL ที่ให้ TikTok ใช้ใน PULL_FROM_URL — โดเมนเดียวกับแอป เพื่อ verify ที่ TikTok แค่ path นี้ */
export function toTiktokPullProxyUrls(
  requestOrigin: string,
  cloudinaryUrls: string[],
  ttlMs = 55 * 60 * 1000,
): string[] {
  const origin = requestOrigin.replace(/\/+$/, "");
  const exp = Date.now() + ttlMs;
  return cloudinaryUrls.map((raw) => {
    const sourceUrl = raw.trim();
    const token = signTiktokMediaPullToken(sourceUrl, exp);
    const enc = encodeURIComponent(token);
    return `${origin}${TIKTOK_MEDIA_PULL_PATH}/${enc}.${tiktokMediaExtension(sourceUrl)}`;
  });
}

export function tiktokMediaPullPrefixForDocs(appOrigin: string): string {
  const o = appOrigin.replace(/\/+$/, "");
  return `${o}${TIKTOK_MEDIA_PULL_PATH}/`;
}
