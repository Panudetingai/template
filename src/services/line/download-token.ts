import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/env/server";

function secret() {
  return (
    serverEnv.LINE_DOWNLOAD_SECRET ??
    serverEnv.LINE_CHANNEL_SECRET ??
    "mock-product-download-dev"
  );
}

export function createDownloadToken(rowId: string, expSec: number): string {
  const payload = `${rowId}:${expSec}`;
  return createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
}

export function verifyDownloadToken(
  rowId: string,
  expSec: number,
  token: string,
): boolean {
  if (Date.now() / 1000 > expSec) {
    return false;
  }
  const expected = createDownloadToken(rowId, expSec);
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(token, "utf8"),
    );
  } catch {
    return false;
  }
}
