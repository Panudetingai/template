import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import {
  tiktokCreatorTokens,
  tiktokPostMetrics,
  tiktokPosts,
} from "../../../drizzle/schema";
import type { TiktokPostListItem } from "@/module/tiktok/tiktok.types";
import {
  exchangeTiktokCode,
  fetchTiktokPublishStatus,
  initTiktokPhotoDirectPost,
  queryTiktokCreatorInfo,
  queryTiktokVideos,
  refreshTiktokAccessToken,
  resolvePrivacyLevel,
  type TiktokTokenBundle,
} from "./tiktok-api.client";

function expiresAtIso(bundle: TiktokTokenBundle): string {
  return new Date(Date.now() + bundle.expiresInSec * 1000).toISOString();
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

export type PublishPhotoInput = {
  userId: string;
  caption: string;
  privacyLevel: string;
  /** 0-based index ของรูปปก */
  coverIndex: number;
  allowComments: boolean;
  imageUrls: string[];
};

export async function publishTiktokPhotoPost(
  input: PublishPhotoInput,
): Promise<{ postId: string; publishId: string }> {
  const access = await getValidAccessTokenForUser(input.userId);
  const creator = await queryTiktokCreatorInfo(access);
  const privacy = resolvePrivacyLevel(
    input.privacyLevel,
    creator.privacy_level_options,
  );
  const cover1based = Math.min(
    Math.max(1, input.coverIndex + 1),
    input.imageUrls.length,
  );
  const { publish_id } = await initTiktokPhotoDirectPost({
    accessToken: access,
    caption: input.caption,
    privacyLevel: privacy,
    photoImageUrls: input.imageUrls,
    photoCoverIndex: cover1based,
    disableComment: !input.allowComments,
  });
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
      description: null,
      photoImageUrls: input.imageUrls,
      privacyLevel: privacy,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: tiktokPosts.id });
  if (!inserted) {
    throw new Error("บันทึกโพสต์ไม่สำเร็จ");
  }
  return { postId: inserted.id, publishId: publish_id };
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
