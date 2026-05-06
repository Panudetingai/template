import { createHash, randomBytes } from "node:crypto";

import { publicEnv } from "@/env/public";
import { serverEnv } from "@/env/server";

/**
 * OAuth scope string for /v2/auth/authorize. TikTok rejects unknown or unassigned scopes.
 * @see https://developers.tiktok.com/doc/tiktok-api-scopes
 * Photo carousel (DIRECT_POST + PHOTO) ยังใช้ Content Posting → ต้องมี `video.publish`
 * การ query วิดีโอหลังโพสต์ → `video.list`
 */
const TIKTOK_DEFAULT_OAUTH_SCOPES =
  "user.info.basic,video.publish,video.list";

export function getTiktokOAuthScopesForRequest(): string {
  const raw = serverEnv.TIKTOK_OAUTH_SCOPES?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(",");
  }
  return TIKTOK_DEFAULT_OAUTH_SCOPES;
}

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_API = "https://open.tiktokapis.com";

export const TIKTOK_OAUTH_CALLBACK_PATH = "/api/tiktok/oauth/callback";

export function tiktokRedirectUri(requestOrigin?: string): string {
  const explicit = serverEnv.TIKTOK_REDIRECT_URI?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const base = requestOrigin ?? publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL.replace(/\/$/, "");
  return `${base}${TIKTOK_OAUTH_CALLBACK_PATH}`;
}

/**
 * TikTok requires authorize + token redirect_uri to match byte-for-byte.
 * State carries the exact URI from /oauth/start so /oauth/callback uses the same value
 * (start vs callback can differ on x-forwarded-* / ngrok vs localhost).
 */
export function assertValidTiktokOAuthRedirectUri(redirectUri: string): void {
  let u: URL;
  try {
    u = new URL(redirectUri);
  } catch {
    throw new Error("redirect_uri ไม่ถูกต้อง");
  }
  if (u.pathname.replace(/\/+$/, "") !== TIKTOK_OAUTH_CALLBACK_PATH) {
    throw new Error("redirect_uri ไม่ถูกต้อง");
  }
  const explicit = serverEnv.TIKTOK_REDIRECT_URI?.trim();
  if (explicit) {
    const norm = explicit.replace(/\/+$/, "");
    if (redirectUri.replace(/\/+$/, "") !== norm) {
      throw new Error("redirect_uri ไม่ตรง TIKTOK_REDIRECT_URI");
    }
  }
}

// ── PKCE helpers ──────────────────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

// ─────────────────────────────────────────────────────────────────────────────

export function assertTiktokAppConfigured(): void {
  const key = serverEnv.TIKTOK_CLIENT_KEY?.trim();
  const secret = serverEnv.TIKTOK_CLIENT_SECRET?.trim();
  if (!key || !secret) {
    throw new Error(
      "ตั้งค่า TIKTOK_CLIENT_KEY และ TIKTOK_CLIENT_SECRET (และ TIKTOK_REDIRECT_URI ให้ตรงคอนโซล TikTok)",
    );
  }
}

export function buildTiktokAuthorizeUrl(
  state: string,
  codeChallenge: string,
  redirectUri: string,
): string {
  assertTiktokAppConfigured();
  const clientKey = serverEnv.TIKTOK_CLIENT_KEY!.trim();
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: getTiktokOAuthScopesForRequest(),
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export type TiktokTokenBundle = {
  accessToken: string;
  refreshToken: string;
  openId: string;
  expiresInSec: number;
  scope: string;
};

type TokenJson = {
  access_token?: string;
  refresh_token?: string;
  open_id?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
  message?: string;
};

function throwTokenError(json: TokenJson): never {
  const msg =
    json.error_description ??
    json.message ??
    json.error ??
    "TikTok OAuth token error";
  throw new Error(msg);
}

export async function exchangeTiktokCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<TiktokTokenBundle> {
  assertTiktokAppConfigured();
  const body = new URLSearchParams({
    client_key: serverEnv.TIKTOK_CLIENT_KEY!.trim(),
    client_secret: serverEnv.TIKTOK_CLIENT_SECRET!.trim(),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TokenJson;
  if (!res.ok || json.error || !json.access_token || !json.refresh_token || !json.open_id) {
    throwTokenError(json);
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    openId: json.open_id,
    expiresInSec: json.expires_in ?? 3600,
    scope: json.scope ?? getTiktokOAuthScopesForRequest(),
  };
}

export async function refreshTiktokAccessToken(
  refreshToken: string,
): Promise<TiktokTokenBundle> {
  assertTiktokAppConfigured();
  const body = new URLSearchParams({
    client_key: serverEnv.TIKTOK_CLIENT_KEY!.trim(),
    client_secret: serverEnv.TIKTOK_CLIENT_SECRET!.trim(),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TokenJson;
  if (!res.ok || json.error || !json.access_token || !json.refresh_token || !json.open_id) {
    throwTokenError(json);
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    openId: json.open_id,
    expiresInSec: json.expires_in ?? 3600,
    scope: json.scope ?? getTiktokOAuthScopesForRequest(),
  };
}

type TiktokEnvelope<T> = {
  data?: T;
  error?: { code?: string; message?: string; log_id?: string };
};

function throwTikTokEnvelopeHttpError(
  json: TiktokEnvelope<unknown>,
  res: Response,
): never {
  const code = json.error?.code;
  const message = (json.error?.message ?? "").trim();
  const logId = json.error?.log_id;
  const parts = [
    message || res.statusText || `HTTP ${res.status}`,
    code && code !== "ok" ? `[code: ${code}]` : null,
    logId ? `[log_id: ${logId}]` : null,
  ].filter(Boolean);
  let extra = "";
  if (
    code === "unaudited_client_can_only_post_to_private_accounts" ||
    /unaudited|SELF_ONLY|private account/i.test(message)
  ) {
    extra =
      " — แอปที่ยังไม่ผ่าน audit โพสต์ได้แค่ SELF_ONLY: ตั้ง TIKTOK_UNAUDITED_SELF_ONLY=1 ใน .env หรือเลือกความเป็นส่วนตัว «ส่วนตัว» ในฟอร์ม (ดู content-sharing-guidelines)";
  }
  if (/integration guidelines|get-started/i.test(message)) {
    extra +=
      " — ตรวจบัญชี unaudited + privacy SELF_ONLY และฟิลด์ disclosure ใน post (ดู doc Get Started / Content Sharing Guidelines)";
  }
  throw new Error(parts.join(" ") + extra);
}

function assertOk<T>(json: TiktokEnvelope<T>): T {
  const code = json.error?.code;
  if (code && code !== "ok") {
    const message = json.error?.message || code;
    const logId = json.error?.log_id;
    throw new Error(
      [
        message,
        `[code: ${code}]`,
        logId ? `[log_id: ${logId}]` : null,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  if (json.data === undefined) {
    throw new Error(json.error?.message || "TikTok API ไม่คืนข้อมูล");
  }
  return json.data;
}

export async function tiktokPostJson<T>(
  accessToken: string,
  path: string,
  body: unknown,
  searchParams?: Record<string, string>,
): Promise<T> {
  const url = new URL(path, TIKTOK_API);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = (await res.json()) as TiktokEnvelope<T>;
  if (!res.ok) {
    throwTikTokEnvelopeHttpError(json, res);
  }
  return assertOk(json);
}

/** UX guideline: เรียกก่อน direct post */
export type TiktokCreatorInfo = {
  creator_avatar_url?: string;
  creator_username?: string;
  creator_nickname?: string;
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  max_video_post_duration_sec?: number;
};

export async function queryTiktokCreatorInfo(
  accessToken: string,
): Promise<TiktokCreatorInfo> {
  return tiktokPostJson<TiktokCreatorInfo>(
    accessToken,
    "/v2/post/publish/creator_info/query/",
    {},
  );
}

export function resolvePrivacyLevel(
  requested: string,
  options: string[] | undefined,
): string {
  const list = options?.length ? options : ["PUBLIC_TO_EVERYONE"];
  if (list.includes(requested)) {
    return requested;
  }
  if (list.includes("PUBLIC_TO_EVERYONE")) {
    return "PUBLIC_TO_EVERYONE";
  }
  return list[0] ?? "PUBLIC_TO_EVERYONE";
}

export type TiktokPhotoPostInitResult = {
  publish_id: string;
};

export async function initTiktokPhotoDirectPost(input: {
  accessToken: string;
  caption: string;
  privacyLevel: string;
  photoImageUrls: string[];
  /** 0-based — TikTok photo API ใช้ 0-based index (รูปแรก = 0) */
  photoCoverIndex: number;
  disableComment: boolean;
}): Promise<TiktokPhotoPostInitResult> {
  const photo_images = input.photoImageUrls
    .map((u) => u.trim())
    .filter((u) => u.length > 0);
  if (photo_images.length < 1 || photo_images.length > 35) {
    throw new Error("ต้องมีรูป 1–35 รูปตามข้อจำกัด TikTok");
  }
  if (input.photoCoverIndex < 0 || input.photoCoverIndex >= photo_images.length) {
    throw new Error("photo_cover_index ไม่อยู่ในช่วงรูปที่ส่ง");
  }
  const caption = input.caption.trim();
  const title = caption.slice(0, 90);
  const description = caption.slice(90, 4000) || undefined;
  return tiktokPostJson<TiktokPhotoPostInitResult>(
    input.accessToken,
    "/v2/post/publish/content/init/",
    {
      post_info: {
        title,
        ...(description ? { description } : {}),
        disable_comment: input.disableComment,
        privacy_level: input.privacyLevel,
        auto_add_music: true,
        brand_content_toggle: false,
        brand_organic_toggle: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_cover_index: input.photoCoverIndex,
        photo_images,
      },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    },
  );
}

export type TiktokVideoPostInitResult = {
  publish_id: string;
};

export async function initTiktokVideoDirectPost(input: {
  accessToken: string;
  caption: string;
  privacyLevel: string;
  videoUrl: string;
  disableComment: boolean;
}): Promise<TiktokVideoPostInitResult> {
  const videoUrl = input.videoUrl.trim();
  if (!videoUrl) {
    throw new Error("video_url จำเป็น");
  }
  const caption = input.caption.trim();
  const title = caption.slice(0, 2200);
  return tiktokPostJson<TiktokVideoPostInitResult>(
    input.accessToken,
    "/v2/post/publish/video/init/",
    {
      post_info: {
        title,
        privacy_level: input.privacyLevel,
        disable_comment: input.disableComment,
        disable_duet: false,
        disable_stitch: false,
        brand_content_toggle: false,
        brand_organic_toggle: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    },
  );
}

export type TiktokPublishStatus = {
  status: string;
  fail_reason?: string;
  /** TikTok สะกดว่า publicaly */
  publicaly_available_post_id?: string[];
};

export async function fetchTiktokPublishStatus(
  accessToken: string,
  publishId: string,
): Promise<TiktokPublishStatus> {
  return tiktokPostJson<TiktokPublishStatus>(
    accessToken,
    "/v2/post/publish/status/fetch/",
    { publish_id: publishId },
  );
}

export type TiktokVideoMetrics = {
  id?: string;
  title?: string;
  view_count?: number;
  comment_count?: number;
  like_count?: number;
  share_count?: number;
};

export async function queryTiktokVideos(
  accessToken: string,
  videoIds: string[],
): Promise<TiktokVideoMetrics[]> {
  if (videoIds.length < 1 || videoIds.length > 20) {
    throw new Error("query ได้ทีละอย่างน้อย 1 และไม่เกิน 20 video id");
  }
  const fields = [
    "id",
    "title",
    "view_count",
    "comment_count",
    "like_count",
    "share_count",
  ].join(",");
  const data = await tiktokPostJson<{ videos?: TiktokVideoMetrics[] }>(
    accessToken,
    "/v2/video/query/",
    {
      filters: { video_ids: videoIds },
    },
    { fields },
  );
  return data.videos ?? [];
}
