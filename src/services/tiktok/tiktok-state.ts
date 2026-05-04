import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/env/server";
import {
  assertValidTiktokOAuthRedirectUri,
  tiktokRedirectUri,
} from "@/services/tiktok/tiktok-api.client";

const STATE_TTL_MS = 10 * 60 * 1000;

export function encodeTiktokOAuthState(userId: string, redirectUri: string): string {
  const secret = serverEnv.TIKTOK_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error("ตั้งค่า TIKTOK_CLIENT_SECRET ก่อน");
  }
  const normalized = redirectUri.replace(/\/+$/, "");
  assertValidTiktokOAuthRedirectUri(normalized);
  const payload = Buffer.from(
    JSON.stringify({
      u: userId,
      r: normalized,
      exp: Date.now() + STATE_TTL_MS,
    }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export type DecodedTiktokOAuthState = { userId: string; redirectUri: string };

export function decodeTiktokOAuthState(state: string): DecodedTiktokOAuthState {
  const secret = serverEnv.TIKTOK_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error("ตั้งค่า TIKTOK_CLIENT_SECRET ก่อน");
  }
  const [payload, sig] = state.split(".");
  if (!payload || !sig) {
    throw new Error("state ไม่ถูกต้อง");
  }
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("state ไม่ถูกต้อง");
  }
  const raw = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    u?: string;
    r?: string;
    exp?: number;
  };
  if (typeof raw.u !== "string" || typeof raw.exp !== "number") {
    throw new Error("state ไม่สมบูรณ์");
  }
  if (Date.now() > raw.exp) {
    throw new Error("หมดเวลาเชื่อมต่อ กรุณาเริ่มใหม่");
  }
  if (typeof raw.r === "string" && raw.r.length > 0) {
    const redirectUri = raw.r.replace(/\/+$/, "");
    assertValidTiktokOAuthRedirectUri(redirectUri);
    return { userId: raw.u, redirectUri };
  }
  const redirectUri = tiktokRedirectUri();
  assertValidTiktokOAuthRedirectUri(redirectUri);
  return { userId: raw.u, redirectUri };
}
