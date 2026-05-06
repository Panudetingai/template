import { and, desc, eq, inArray } from "drizzle-orm";

import { serverEnv } from "@/env/server";
import { db } from "@/lib/drizzle";
import {
  designToProductGenerations,
  mockProductGenerations,
  productionGeneratedDesigns,
  tiktokCreatorTokens,
  tiktokPostMetrics,
  tiktokPosts,
} from "../../../drizzle/schema";
import type {
  TiktokPostListItem,
  TiktokProductSource,
  TiktokProductTableRow,
} from "@/module/tiktok/tiktok.types";
import {
  exchangeTiktokCode,
  fetchTiktokPublishStatus,
  initTiktokPhotoDirectPost,
  initTiktokVideoDirectPost,
  queryTiktokCreatorInfo,
  queryTiktokVideos,
  refreshTiktokAccessToken,
  resolvePrivacyLevel,
  type TiktokTokenBundle,
} from "./tiktok-api.client";

function expiresAtIso(bundle: TiktokTokenBundle): string {
  return new Date(Date.now() + bundle.expiresInSec * 1000).toISOString();
}

function scopeErrorHelpMessage(): string {
  return (
    "TikTok ต้องการสิทธิ์ video.publish — ตรวจใน TikTok Developer Portal ว่าเปิด product Content Posting + scope แล้ว " +
    "จากนั้นกดตัดการเชื่อม TikTok แล้วเชื่อมใหม่"
  );
}

export async function upsertTiktokTokensForUser(
  userId: string,
  bundle: TiktokTokenBundle,
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(tiktokCreatorTokens)
    .values({
      userId,
      tiktokOpenId: bundle.openId,
      accessToken: bundle.accessToken,
      refreshToken: bundle.refreshToken,
      expiresAt: expiresAtIso(bundle),
      scope: bundle.scope,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: tiktokCreatorTokens.userId,
      set: {
        tiktokOpenId: bundle.openId,
        accessToken: bundle.accessToken,
        refreshToken: bundle.refreshToken,
        expiresAt: expiresAtIso(bundle),
        scope: bundle.scope,
        updatedAt: now,
      },
    });
}

export async function saveTiktokOAuthCode(
  userId: string,
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<void> {
  const bundle = await exchangeTiktokCode(code, codeVerifier, redirectUri);
  await upsertTiktokTokensForUser(userId, bundle);
}

export async function getValidAccessTokenForUser(
  userId: string,
): Promise<string> {
  const [row] = await db
    .select()
    .from(tiktokCreatorTokens)
    .where(eq(tiktokCreatorTokens.userId, userId))
    .limit(1);
  if (!row) {
    throw new Error("ยังไม่ได้เชื่อมบัญชี TikTok");
  }
  const expMs = new Date(row.expiresAt).getTime();
  if (expMs > Date.now() + 60_000) {
    return row.accessToken;
  }
  const bundle = await refreshTiktokAccessToken(row.refreshToken);
  await upsertTiktokTokensForUser(userId, bundle);
  return bundle.accessToken;
}

export async function getTiktokConnection(
  userId: string,
): Promise<{ tiktokOpenId: string } | null> {
  const [row] = await db
    .select({
      tiktokOpenId: tiktokCreatorTokens.tiktokOpenId,
    })
    .from(tiktokCreatorTokens)
    .where(eq(tiktokCreatorTokens.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function disconnectTiktok(userId: string): Promise<void> {
  await db.delete(tiktokCreatorTokens).where(eq(tiktokCreatorTokens.userId, userId));
}

export type PublishTiktokMediaInput = {
  userId: string;
  caption: string;
  privacyLevel: string;
  allowComments: boolean;
  mediaType: "PHOTO" | "VIDEO";
  /** 0-based index ของรูปปก */
  coverIndex?: number;
  mediaUrls: string[];
  sourceProductRef?: string;
};

export type TiktokProductRef = {
  source: Exclude<TiktokProductSource, "tiktok">;
  id: string;
};

const TIKTOK_PRODUCT_REF_PREFIX = "tiktok-product";
const TIKTOK_PRODUCT_GROUP_REF_PREFIX = "tiktok-product-group";

function encodeTiktokProductRef(ref: TiktokProductRef): string {
  return `${TIKTOK_PRODUCT_REF_PREFIX}:${ref.source}:${ref.id}`;
}

export function encodeTiktokProductRefs(refs: TiktokProductRef[]): string {
  if (refs.length === 1 && refs[0]) {
    return encodeTiktokProductRef(refs[0]);
  }
  const body = Buffer.from(JSON.stringify(refs), "utf8").toString("base64url");
  return `${TIKTOK_PRODUCT_GROUP_REF_PREFIX}:${body}`;
}

function decodeTiktokProductRef(value: string | null): TiktokProductRef | null {
  const [prefix, source, id] = (value ?? "").split(":");
  if (
    prefix !== TIKTOK_PRODUCT_REF_PREFIX ||
    (source !== "production" && source !== "mock" && source !== "design") ||
    !id
  ) {
    return null;
  }
  return { source, id };
}

function decodeTiktokProductRefs(value: string | null): TiktokProductRef[] {
  const single = decodeTiktokProductRef(value);
  if (single) {
    return [single];
  }
  const [prefix, body] = (value ?? "").split(":");
  if (prefix !== TIKTOK_PRODUCT_GROUP_REF_PREFIX || !body) {
    return [];
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is TiktokProductRef => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const record = item as Record<string, unknown>;
      return (
        (record.source === "production" ||
          record.source === "mock" ||
          record.source === "design") &&
        typeof record.id === "string" &&
        record.id.length > 0
      );
    });
  } catch {
    return [];
  }
}

function isVideoUrl(url: string): boolean {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|mov|m4v|webm)$/i.test(path);
}

function extractProductName(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  const direct = record.name ?? record.productName ?? record.productPrompt;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }
  const nested = record.generateProduct;
  if (nested && typeof nested === "object") {
    const nestedName = (nested as Record<string, unknown>).name;
    if (typeof nestedName === "string" && nestedName.trim()) {
      return nestedName.trim();
    }
  }
  return null;
}

export async function publishTiktokMediaPost(
  input: PublishTiktokMediaInput,
): Promise<{ postId: string; publishId: string }> {
  if (input.mediaType === "PHOTO" && input.mediaUrls.length < 1) {
    throw new Error("โพสต์รูปต้องมีรูปอย่างน้อย 1 รูป");
  }
  if (input.mediaType === "VIDEO" && input.mediaUrls.length !== 1) {
    throw new Error("โพสต์วิดีโอต้องมีไฟล์วิดีโอ 1 ไฟล์");
  }
  const access = await getValidAccessTokenForUser(input.userId);

  let creator: Awaited<ReturnType<typeof queryTiktokCreatorInfo>>;
  try {
    creator = await queryTiktokCreatorInfo(access);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/did not authorize the scope|scope required/i.test(msg)) {
      throw new Error(scopeErrorHelpMessage());
    }
    throw e;
  }

  // แอปที่ยังไม่ผ่าน audit ต้องใช้ SELF_ONLY เสมอ — บังคับก่อน resolvePrivacyLevel
  // เพราะ privacy_level_options อาจไม่มี SELF_ONLY แต่ TikTok ยังต้องการอยู่
  let privacy: string;
  if (serverEnv.TIKTOK_UNAUDITED_SELF_ONLY) {
    privacy = "SELF_ONLY";
  } else {
    privacy = resolvePrivacyLevel(input.privacyLevel, creator.privacy_level_options);
  }
  const n = input.mediaUrls.length;
  const coverIndex = Math.min(Math.max(0, input.coverIndex ?? 0), Math.max(0, n - 1));
  const isUnauditedPrivacyError = (message: string): boolean =>
    /unaudited_client_can_only_post_to_private_accounts|unaudited|can only post to private accounts|SELF_ONLY/i.test(
      message,
    );
  const initWithPrivacy = (privacyLevel: string) =>
    input.mediaType === "PHOTO"
      ? initTiktokPhotoDirectPost({
          accessToken: access,
          caption: input.caption,
          privacyLevel,
          photoImageUrls: input.mediaUrls,
          photoCoverIndex: coverIndex,
          disableComment: !input.allowComments,
        })
      : initTiktokVideoDirectPost({
          accessToken: access,
          caption: input.caption,
          privacyLevel,
          videoUrl: input.mediaUrls[0] ?? "",
          disableComment: !input.allowComments,
        });

  let publish_id: string;
  let effectivePrivacy = privacy;
  try {
    try {
      const init = await initWithPrivacy(effectivePrivacy);
      publish_id = init.publish_id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (effectivePrivacy !== "SELF_ONLY" && isUnauditedPrivacyError(msg)) {
        effectivePrivacy = "SELF_ONLY";
        const init = await initWithPrivacy(effectivePrivacy);
        publish_id = init.publish_id;
      } else {
        throw e;
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/did not authorize the scope|scope required/i.test(msg)) {
      throw new Error(scopeErrorHelpMessage());
    }
    if (/source info is empty or incorrect|source_info|invalid_params/i.test(msg)) {
      throw new Error(
        `${msg} — ตรวจสอบ: (1) เพิ่ม URL prefix ของแอปใน TikTok Developer Portal → Content Posting → URL Allowlist ` +
          `(2) verify domain ด้วยไฟล์ที่ public/ แล้ว`,
      );
    }
    throw e;
  }
  const now = new Date().toISOString();
  const [inserted] = await db
    .insert(tiktokPosts)
    .values({
      userId: input.userId,
      publishId: publish_id,
      tiktokItemId: null,
      status: "processing",
      failReason: null,
      title: input.caption,
      description: input.sourceProductRef ?? null,
      photoImageUrls: input.mediaUrls,
      privacyLevel: effectivePrivacy,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: tiktokPosts.id });
  if (!inserted) {
    throw new Error("บันทึกโพสต์ไม่สำเร็จ");
  }
  return { postId: inserted.id, publishId: publish_id };
}

async function getTiktokPostMetricMap(postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, (typeof tiktokPostMetrics.$inferSelect)>();
  }
  const metricRows = await db
    .select()
    .from(tiktokPostMetrics)
    .where(inArray(tiktokPostMetrics.postId, postIds))
    .orderBy(desc(tiktokPostMetrics.capturedAt));

  const latest = new Map<string, (typeof metricRows)[0]>();
  for (const m of metricRows) {
    if (!latest.has(m.postId)) {
      latest.set(m.postId, m);
    }
  }
  return latest;
}

function toLatestMetric(metric: (typeof tiktokPostMetrics.$inferSelect) | undefined) {
  return metric
    ? {
        viewCount: metric.viewCount,
        likeCount: metric.likeCount,
        commentCount: metric.commentCount,
        shareCount: metric.shareCount,
        capturedAt: metric.capturedAt,
      }
    : null;
}

export async function listTiktokProductRowsForUser(
  userId: string,
): Promise<TiktokProductTableRow[]> {
  const [posts, productionRows, mockRows, designRows] = await Promise.all([
    db
      .select()
      .from(tiktokPosts)
      .where(eq(tiktokPosts.userId, userId))
      .orderBy(desc(tiktokPosts.createdAt)),
    db
      .select()
      .from(productionGeneratedDesigns)
      .orderBy(desc(productionGeneratedDesigns.createdAt))
      .limit(100),
    db
      .select()
      .from(mockProductGenerations)
      .orderBy(desc(mockProductGenerations.createdAt))
      .limit(100),
    db
      .select()
      .from(designToProductGenerations)
      .orderBy(desc(designToProductGenerations.createdAt))
      .limit(100),
  ]);

  const latestMetrics = await getTiktokPostMetricMap(posts.map((p) => p.id));
  const postByProductRef = new Map<string, (typeof posts)[0]>();
  const tiktokOnlyPosts: typeof posts = [];
  for (const post of posts) {
    const refs = decodeTiktokProductRefs(post.description);
    if (refs.length > 0) {
      for (const ref of refs) {
        postByProductRef.set(encodeTiktokProductRef(ref), post);
      }
    } else {
      tiktokOnlyPosts.push(post);
    }
  }

  const rows: TiktokProductTableRow[] = [];
  for (const row of productionRows) {
    const mediaUrl = row.generatedImageDataUrl;
    if (!mediaUrl) continue;
    const ref = encodeTiktokProductRef({ source: "production", id: row.id });
    const post = postByProductRef.get(ref);
    rows.push({
      id: ref,
      source: "production",
      sourceId: row.id,
      productName: row.prompt || "Production product",
      productStatus: "uploaded",
      tiktokPost: post
        ? { id: post.id, status: post.status, failReason: post.failReason }
        : null,
      fileType: isVideoUrl(mediaUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [mediaUrl],
      latestMetric: toLatestMetric(post ? latestMetrics.get(post.id) : undefined),
    });
  }

  for (const row of mockRows) {
    const mediaUrl = row.generatedImageDataUrl ?? row.sourceImageDataUrl;
    if (!mediaUrl) continue;
    const ref = encodeTiktokProductRef({ source: "mock", id: row.id });
    const post = postByProductRef.get(ref);
    rows.push({
      id: ref,
      source: "mock",
      sourceId: row.id,
      productName: extractProductName(row.generateProduct) ?? "Mock product",
      productStatus: row.generatedImageDataUrl ? "generated" : "uploaded",
      tiktokPost: post
        ? { id: post.id, status: post.status, failReason: post.failReason }
        : null,
      fileType: isVideoUrl(mediaUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [mediaUrl],
      latestMetric: toLatestMetric(post ? latestMetrics.get(post.id) : undefined),
    });
  }

  for (const row of designRows) {
    const mediaUrl = row.resultImageDataUrl ?? row.productImageDataUrl;
    if (!mediaUrl) continue;
    const ref = encodeTiktokProductRef({ source: "design", id: row.id });
    const post = postByProductRef.get(ref);
    rows.push({
      id: ref,
      source: "design",
      sourceId: row.id,
      productName: row.productPrompt,
      productStatus: row.errorMessage ? "failed" : "generated",
      tiktokPost: post
        ? { id: post.id, status: post.status, failReason: post.failReason }
        : null,
      fileType: isVideoUrl(mediaUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [mediaUrl],
      latestMetric: toLatestMetric(post ? latestMetrics.get(post.id) : undefined),
    });
  }

  for (const post of tiktokOnlyPosts) {
    rows.push({
      id: `tiktok:${post.id}`,
      source: "tiktok",
      sourceId: post.id,
      productName: post.title ?? "TikTok post",
      productStatus: "posted",
      tiktokPost: { id: post.id, status: post.status, failReason: post.failReason },
      fileType: post.photoImageUrls.some(isVideoUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: post.photoImageUrls,
      latestMetric: toLatestMetric(latestMetrics.get(post.id)),
    });
  }

  return rows.sort((a, b) => {
    const aPosted = a.tiktokPost ? 1 : 0;
    const bPosted = b.tiktokPost ? 1 : 0;
    return aPosted - bPosted || a.productName.localeCompare(b.productName);
  });
}

export async function getTiktokProductsByRefs(
  refs: TiktokProductRef[],
): Promise<TiktokProductTableRow[]> {
  const byKey = new Map(refs.map((ref) => [encodeTiktokProductRef(ref), ref]));
  const productionIds = refs.filter((r) => r.source === "production").map((r) => r.id);
  const mockIds = refs.filter((r) => r.source === "mock").map((r) => r.id);
  const designIds = refs.filter((r) => r.source === "design").map((r) => r.id);
  const [productionRows, mockRows, designRows] = await Promise.all([
    productionIds.length > 0
      ? db
          .select()
          .from(productionGeneratedDesigns)
          .where(inArray(productionGeneratedDesigns.id, productionIds))
      : Promise.resolve([]),
    mockIds.length > 0
      ? db
          .select()
          .from(mockProductGenerations)
          .where(inArray(mockProductGenerations.id, mockIds))
      : Promise.resolve([]),
    designIds.length > 0
      ? db
          .select()
          .from(designToProductGenerations)
          .where(inArray(designToProductGenerations.id, designIds))
      : Promise.resolve([]),
  ]);

  const rows: TiktokProductTableRow[] = [];
  for (const row of productionRows) {
    if (!byKey.has(encodeTiktokProductRef({ source: "production", id: row.id }))) continue;
    rows.push({
      id: encodeTiktokProductRef({ source: "production", id: row.id }),
      source: "production",
      sourceId: row.id,
      productName: row.prompt || "Production product",
      productStatus: "uploaded",
      tiktokPost: null,
      fileType: isVideoUrl(row.generatedImageDataUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [row.generatedImageDataUrl],
      latestMetric: null,
    });
  }
  for (const row of mockRows) {
    const mediaUrl = row.generatedImageDataUrl ?? row.sourceImageDataUrl;
    if (!mediaUrl) continue;
    rows.push({
      id: encodeTiktokProductRef({ source: "mock", id: row.id }),
      source: "mock",
      sourceId: row.id,
      productName: extractProductName(row.generateProduct) ?? "Mock product",
      productStatus: row.generatedImageDataUrl ? "generated" : "uploaded",
      tiktokPost: null,
      fileType: isVideoUrl(mediaUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [mediaUrl],
      latestMetric: null,
    });
  }
  for (const row of designRows) {
    const mediaUrl = row.resultImageDataUrl ?? row.productImageDataUrl;
    if (!mediaUrl) continue;
    rows.push({
      id: encodeTiktokProductRef({ source: "design", id: row.id }),
      source: "design",
      sourceId: row.id,
      productName: row.productPrompt,
      productStatus: row.errorMessage ? "failed" : "generated",
      tiktokPost: null,
      fileType: isVideoUrl(mediaUrl) ? "VIDEO" : "PHOTO",
      mediaUrls: [mediaUrl],
      latestMetric: null,
    });
  }
  return rows;
}

export async function syncTiktokPost(
  postId: string,
  userId: string,
): Promise<void> {
  const access = await getValidAccessTokenForUser(userId);
  const [row] = await db
    .select()
    .from(tiktokPosts)
    .where(and(eq(tiktokPosts.id, postId), eq(tiktokPosts.userId, userId)))
    .limit(1);
  if (!row) {
    throw new Error("ไม่พบโพสต์");
  }

  const now = new Date().toISOString();
  let itemId = row.tiktokItemId;

  if (!itemId) {
    const st = await fetchTiktokPublishStatus(access, row.publishId);
    if (st.status === "FAILED") {
      await db
        .update(tiktokPosts)
        .set({
          status: "failed",
          failReason: st.fail_reason ?? "FAILED",
          updatedAt: now,
        })
        .where(eq(tiktokPosts.id, postId));
      return;
    }
    const ids = st.publicaly_available_post_id ?? [];
    if (st.status === "PUBLISH_COMPLETE" && ids[0]) {
      itemId = ids[0];
      await db
        .update(tiktokPosts)
        .set({
          tiktokItemId: itemId,
          status: "published",
          updatedAt: now,
        })
        .where(eq(tiktokPosts.id, postId));
    } else {
      await db
        .update(tiktokPosts)
        .set({ status: "processing", updatedAt: now })
        .where(eq(tiktokPosts.id, postId));
      return;
    }
  }

  if (!itemId) {
    return;
  }

  const videos = await queryTiktokVideos(access, [itemId]);
  const v = videos[0];
  if (!v?.id) {
    return;
  }
  await db.insert(tiktokPostMetrics).values({
    postId: row.id,
    viewCount: Number(v.view_count ?? 0),
    likeCount: Number(v.like_count ?? 0),
    commentCount: Number(v.comment_count ?? 0),
    shareCount: Number(v.share_count ?? 0),
    capturedAt: now,
  });
}

export async function listTiktokPostsForUser(
  userId: string,
): Promise<TiktokPostListItem[]> {
  const posts = await db
    .select()
    .from(tiktokPosts)
    .where(eq(tiktokPosts.userId, userId))
    .orderBy(desc(tiktokPosts.createdAt));

  if (posts.length === 0) {
    return [];
  }

  const ids = posts.map((p) => p.id);
  const metricRows = await db
    .select()
    .from(tiktokPostMetrics)
    .where(inArray(tiktokPostMetrics.postId, ids))
    .orderBy(desc(tiktokPostMetrics.capturedAt));

  const latest = new Map<string, (typeof metricRows)[0]>();
  for (const m of metricRows) {
    if (!latest.has(m.postId)) {
      latest.set(m.postId, m);
    }
  }

  return posts.map((p) => {
    const m = latest.get(p.id);
    return {
      id: p.id,
      publishId: p.publishId,
      tiktokItemId: p.tiktokItemId,
      status: p.status,
      failReason: p.failReason,
      title: p.title,
      description: p.description,
      photoImageUrls: p.photoImageUrls,
      privacyLevel: p.privacyLevel,
      createdAt: p.createdAt,
      latestMetric: m
        ? {
            viewCount: m.viewCount,
            likeCount: m.likeCount,
            commentCount: m.commentCount,
            shareCount: m.shareCount,
            capturedAt: m.capturedAt,
          }
        : null,
    };
  });
}
