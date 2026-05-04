import { eq } from "drizzle-orm";
import { mockProductGenerations } from "../../../../drizzle/schema";
import { db } from "@/lib/drizzle";
import { verifyDownloadToken } from "@/services/line/download-token";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteParams) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const expStr = url.searchParams.get("e");
  const token = url.searchParams.get("t");
  const expSec = expStr ? Number.parseInt(expStr, 10) : NaN;
  if (!token || Number.isNaN(expSec) || !verifyDownloadToken(id, expSec, token)) {
    return new Response("Forbidden", { status: 403 });
  }

  const rows = await db
    .select()
    .from(mockProductGenerations)
    .where(eq(mockProductGenerations.id, id))
    .limit(1);
  const row = rows[0];
  if (!row?.generatedImageDataUrl) {
    return new Response("Not found", { status: 404 });
  }

  const raw = row.generatedImageDataUrl;
  const dataMatch = /^data:image\/png;base64,(.+)$/s.exec(raw);
  if (dataMatch) {
    const bin = Buffer.from(dataMatch[1] ?? "", "base64");
    return new Response(bin, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (raw.startsWith("https://")) {
    return Response.redirect(raw, 302);
  }

  return new Response("Unsupported image format", { status: 500 });
}
