import { getUser } from "@/lib/supabase/server";
import {
  buildTiktokAuthorizeUrl,
  assertTiktokAppConfigured,
  generateCodeVerifier,
  generateCodeChallenge,
  tiktokRedirectUri,
} from "@/services/tiktok/tiktok-api.client";
import {
  decodeTiktokOAuthState,
  encodeTiktokOAuthState,
} from "@/services/tiktok/tiktok-state";
import {
  disconnectTiktok,
  encodeTiktokProductRefs,
  getTiktokProductsByRefs,
  getTiktokConnection,
  listTiktokProductRowsForUser,
  listTiktokPostsForUser,
  publishTiktokMediaPost,
  saveTiktokOAuthCode,
  syncTiktokPost,
  type TiktokProductRef,
} from "@/services/tiktok/tiktok-posts.service";
import { uploadTiktokMediaToCloudinary } from "@/services/cloudinary/cloudinary-upload.service";
import { toTiktokPullProxyUrls } from "@/lib/tiktok/media-pull";
import { publicEnv } from "@/env/public";
import Elysia, { t } from "elysia";
import z from "zod";

function requestOrigin(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwarded) {
    const host = forwarded.split(",")[0]?.trim() ?? forwarded;
    return `${proto.split(",")[0]?.trim() || "https"}://${host}`;
  }
  return new URL(request.url).origin;
}

const PKCE_COOKIE = "tiktok_pkce_cv";
const PKCE_MAX_AGE = 10 * 60; // 10 นาที

function pkceSetCookieHeader(verifier: string, secure: boolean): string {
  const flags = [
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${PKCE_MAX_AGE}`,
    `SameSite=Lax`,
    ...(secure ? ["Secure"] : []),
  ].join("; ");
  return `${PKCE_COOKIE}=${encodeURIComponent(verifier)}; ${flags}`;
}

function clearPkceCookieHeader(): string {
  return `${PKCE_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

function readPkceVerifierFromRequest(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name?.trim() === PKCE_COOKIE) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }
  return null;
}

const tiktokApi = new Elysia({ prefix: "/tiktok" })
  .get("/oauth/start", async ({ request }) => {
    assertTiktokAppConfigured();
    const origin = requestOrigin(request);
    const user = await getUser();
    if (!user?.id) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/auth/sign-in?next=/dashboard/tiktok` },
      });
    }
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const redirectUri = tiktokRedirectUri(origin);
    const state = encodeTiktokOAuthState(user.id, redirectUri);
    const url = buildTiktokAuthorizeUrl(state, challenge, redirectUri);
    const isSecure = new URL(request.url).protocol === "https:";
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        "Set-Cookie": pkceSetCookieHeader(verifier, isSecure),
      },
    });
  })
  .get("/oauth/callback", async ({ request }) => {
    const origin = requestOrigin(request);
    const { searchParams } = new URL(request.url);
    const err = searchParams.get("error");
    const errDesc = searchParams.get("error_description") ?? "";
    const clearCookie = clearPkceCookieHeader();

    if (err) {
      const q = new URLSearchParams({
        tiktok_error: err,
        tiktok_error_detail: errDesc.slice(0, 500),
      });
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/dashboard/tiktok?${q.toString()}`, "Set-Cookie": clearCookie },
      });
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/dashboard/tiktok?tiktok_error=missing_code`,
          "Set-Cookie": clearCookie,
        },
      });
    }

    const verifier = readPkceVerifierFromRequest(request);
    if (!verifier) {
      const q = new URLSearchParams({
        tiktok_error: "oauth_failed",
        tiktok_error_detail: "code_verifier หายไป กรุณาลองใหม่",
      });
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/dashboard/tiktok?${q.toString()}`, "Set-Cookie": clearCookie },
      });
    }

    try {
      const { userId, redirectUri } = decodeTiktokOAuthState(state);
      await saveTiktokOAuthCode(userId, code, verifier, redirectUri);
    } catch (e) {
      const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
      const q = new URLSearchParams({ tiktok_error: "oauth_failed", tiktok_error_detail: msg });
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/dashboard/tiktok?${q.toString()}`, "Set-Cookie": clearCookie },
      });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/dashboard/tiktok?tiktok_connected=1`,
        "Set-Cookie": clearCookie,
      },
    });
  })
  .get("/connection", async () => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "Unauthorized", status: 401 } as const;
    }
    const row = await getTiktokConnection(user.id);
    return {
      connected: row != null,
      tiktokOpenId: row?.tiktokOpenId ?? null,
    };
  })
  .delete("/connection", async () => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "Unauthorized", status: 401 } as const;
    }
    await disconnectTiktok(user.id);
    return { ok: true as const };
  })
  .get("/posts", async () => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "Unauthorized", status: 401 } as const;
    }
    const posts = await listTiktokPostsForUser(user.id);
    return { posts };
  })
  .get("/products", async () => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "Unauthorized", status: 401 } as const;
    }
    const products = await listTiktokProductRowsForUser(user.id);
    return { products };
  })
  .post(
    "/posts/:postId/sync",
    async ({ params }) => {
      const user = await getUser();
      if (!user?.id) {
        return { error: "Unauthorized", status: 401 } as const;
      }
      const parsed = z.string().uuid().safeParse(params.postId);
      if (!parsed.success) {
        return { error: "Invalid post id", status: 400 } as const;
      }
      try {
        await syncTiktokPost(parsed.data, user.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { error: msg, status: 400 } as const;
      }
      const posts = await listTiktokPostsForUser(user.id);
      return { posts };
    },
    {
      params: z.object({ postId: z.string() }),
    },
  )
  .post(
    "/products/publish",
    async ({ body }) => {
      const user = await getUser();
      if (!user?.id) {
        return { error: "Unauthorized", status: 401 } as const;
      }
      const refs: TiktokProductRef[] = body.products
        .map((item) => ({
          source: item.source as TiktokProductRef["source"],
          id: item.id,
        }))
        .filter(
          (item): item is TiktokProductRef =>
            (item.source === "production" ||
              item.source === "mock" ||
              item.source === "design") &&
            z.string().uuid().safeParse(item.id).success,
        );
      if (refs.length === 0) {
        return { error: "เลือกสินค้าอย่างน้อย 1 รายการ", status: 400 } as const;
      }

      const products = await getTiktokProductsByRefs(refs);
      if (products.length === 0) {
        return { error: "ไม่พบสินค้าที่เลือก", status: 400 } as const;
      }
      const fileTypes = new Set(products.map((product) => product.fileType));
      if (fileTypes.size !== 1) {
        return { error: "เลือกโพสต์รูปและวิดีโอปนกันไม่ได้", status: 400 } as const;
      }
      const mediaType = products[0]?.fileType ?? "PHOTO";
      if (mediaType === "VIDEO" && products.length !== 1) {
        return { error: "โพสต์วิดีโอเลือกได้ครั้งละ 1 รายการ", status: 400 } as const;
      }

      try {
        const proxyBase = publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL.replace(/\/+$/, "");
        const caption =
          body.caption?.trim().slice(0, 2200) ||
          products.map((product) => product.productName).join("\n").slice(0, 2200);

        // แปลง data URL → Cloudinary URL ก่อน proxy (TikTok ดึงรูปผ่าน HTTPS เท่านั้น)
        const cloudinaryUrls: string[] = [];
        for (const raw of products.flatMap((p) => p.mediaUrls)) {
          if (raw.startsWith("data:")) {
            const m = raw.match(/^data:([^;,]+)[^,]*,([\s\S]+)$/);
            if (!m) throw new Error("data URL ไม่ถูกต้อง");
            const buf = Buffer.from(m[2] ?? "", "base64");
            const uploaded = await uploadTiktokMediaToCloudinary({
              buffer: buf,
              mimeType: m[1] ?? "image/jpeg",
              ownerKey: user.id,
            });
            cloudinaryUrls.push(uploaded);
          } else {
            // Cloudinary URL อยู่แล้ว — ใส่ transform f_jpg เผื่อเป็น PNG
            const withJpeg = raw.replace(
              /\/image\/upload\/(v\d+\/)/,
              "/image/upload/f_jpg,q_auto,w_1080,c_scale/$1",
            );
            cloudinaryUrls.push(withJpeg !== raw ? withJpeg : raw);
          }
        }

        const result = await publishTiktokMediaPost({
          userId: user.id,
          caption,
          privacyLevel: body.privacyLevel?.trim() || "SELF_ONLY",
          allowComments: body.allowComments !== "false",
          mediaType,
          coverIndex: body.coverIndex ? Number.parseInt(body.coverIndex, 10) : 0,
          mediaUrls: toTiktokPullProxyUrls(proxyBase, cloudinaryUrls),
          sourceProductRef: encodeTiktokProductRefs(refs),
        });
        const [posts, rows] = await Promise.all([
          listTiktokPostsForUser(user.id),
          listTiktokProductRowsForUser(user.id),
        ]);
        return { publish: result, posts, products: rows };
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 500) : String(e);
        return { error: msg, status: 400 } as const;
      }
    },
    {
      body: t.Object({
        products: t.Array(
          t.Object({
            source: t.String(),
            id: t.String(),
          }),
          { minItems: 1, maxItems: 35 },
        ),
        caption: t.Optional(t.String()),
        privacyLevel: t.Optional(t.String()),
        coverIndex: t.Optional(t.String()),
        allowComments: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/posts/publish",
    async ({ body }) => {
      const user = await getUser();
      if (!user?.id) {
        return { error: "Unauthorized", status: 401 } as const;
      }
      const caption = (body.caption ?? "").trim().slice(0, 2200);
      if (!caption) {
        return { error: "caption (คำบรรยาย) จำเป็น", status: 400 } as const;
      }
      const privacyLevel = (body.privacyLevel ?? "PUBLIC_TO_EVERYONE").trim();
      const coverIndex = body.coverIndex ? Number.parseInt(body.coverIndex, 10) : 0;
      const allowComments = body.allowComments !== "false";
      const mediaType = (body.mediaType ?? "PHOTO").trim().toUpperCase();
      if (mediaType !== "PHOTO" && mediaType !== "VIDEO") {
        return { error: "mediaType ต้องเป็น PHOTO หรือ VIDEO", status: 400 } as const;
      }
      if (mediaType === "PHOTO" && body.mediaFiles.length > 35) {
        return { error: "โพสต์รูปส่งได้สูงสุด 35 รูป", status: 400 } as const;
      }
      if (mediaType === "VIDEO" && body.mediaFiles.length !== 1) {
        return { error: "โพสต์วิดีโอต้องมีไฟล์เดียว", status: 400 } as const;
      }

      const urls: string[] = [];
      try {
        for (const file of body.mediaFiles) {
          const type = (file.type || "").toLowerCase();
          if (mediaType === "PHOTO" && !type.startsWith("image/")) {
            return { error: "โหมด PHOTO ต้องอัปโหลดไฟล์รูปภาพเท่านั้น", status: 400 } as const;
          }
          if (mediaType === "VIDEO" && !type.startsWith("video/")) {
            return { error: "โหมด VIDEO ต้องอัปโหลดไฟล์วิดีโอเท่านั้น", status: 400 } as const;
          }
          const buf = Buffer.from(await file.arrayBuffer());
          const url = await uploadTiktokMediaToCloudinary({
            buffer: buf,
            mimeType: file.type || (mediaType === "VIDEO" ? "video/mp4" : "image/jpeg"),
            ownerKey: user.id,
          });
          urls.push(url);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
        return { error: msg, status: 400 } as const;
      }

      try {
        const proxyBase = publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL.replace(/\/+$/, "");
        const result = await publishTiktokMediaPost({
          userId: user.id,
          caption,
          privacyLevel,
          allowComments,
          mediaType,
          coverIndex: Number.isFinite(coverIndex) ? coverIndex : 0,
          mediaUrls: toTiktokPullProxyUrls(proxyBase, urls),
        });
        const posts = await listTiktokPostsForUser(user.id);
        return { publish: result, posts };
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 500) : String(e);
        return { error: msg, status: 400 } as const;
      }
    },
    {
      parse: "multipart/form-data",
      body: t.Object({
        caption: t.String({ minLength: 1 }),
        mediaType: t.Optional(t.String()),
        privacyLevel: t.Optional(t.String()),
        coverIndex: t.Optional(t.String()),
        allowComments: t.Optional(t.String()),
        mediaFiles: t.Files({
          maxSize: "25m",
          minItems: 1,
          maxItems: 35,
        }),
      }),
    },
  );

export default tiktokApi;
