import { verifyTiktokMediaPullToken } from "@/lib/tiktok/media-pull";
import { type NextRequest, NextResponse } from "next/server";

/**
 * TikTok PULL_FROM_URL จะ GET URL นี้ — ต้องไม่ต้องล็อกอิน (middleware ยกเว้น /api อยู่แล้ว)
 * สตรีมรูปจาก Cloudinary หลังตรวจสอบโทเกน
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token: rawToken } = await context.params;
  const token = decodeURIComponent(rawToken).replace(
    /\.(jpe?g|png|webp|mp4|mov|m4v|webm)$/i,
    "",
  );
  const v = verifyTiktokMediaPullToken(token);
  if (!v) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const upstream = await fetch(v.url, {
    redirect: "follow",
    headers: { Accept: "image/*,video/*,*/*" },
  });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Bad Gateway", { status: 502 });
  }

  const contentType =
    upstream.headers.get("content-type")?.split(";")[0]?.trim() ??
    "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      ...(contentLength ? { "Content-Length": contentLength } : {}),
    },
  });
}
