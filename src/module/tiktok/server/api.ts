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
  getTiktokConnection,
  listTiktokPostsForUser,
  publishTiktokPhotoPost,
  saveTiktokOAuthCode,
  syncTiktokPost,
} from "@/services/tiktok/tiktok-posts.service";
import { uploadImageToCloudinary } from "@/services/cloudinary/cloudinary-upload.service";
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

      const urls: string[] = [];
      try {
        for (const file of body.images) {
          const buf = Buffer.from(await file.arrayBuffer());
          const url = await uploadImageToCloudinary({
            buffer: buf,
            mimeType: file.type || "image/jpeg",
            kind: "tiktok",
            ownerKey: user.id,
          });
          urls.push(url);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
        return { error: msg, status: 400 } as const;
      }

      try {
        const result = await publishTiktokPhotoPost({
          userId: user.id,
          caption,
          privacyLevel,
          coverIndex: Number.isFinite(coverIndex) ? coverIndex : 0,
          allowComments,
          imageUrls: urls,
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
        privacyLevel: t.Optional(t.String()),
        coverIndex: t.Optional(t.String()),
        allowComments: t.Optional(t.String()),
        images: t.Files({
          type: "image",
          maxSize: "25m",
          minItems: 1,
          maxItems: 9,
        }),
      }),
    },
  );

export default tiktokApi;
