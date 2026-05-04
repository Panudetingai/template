import { LineBotClient } from "@line/bot-sdk";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import {
  designToProductGenerations,
  lineDesignToProductSessions,
  lineMockSessions,
} from "../../../drizzle/schema";
import { serverEnv } from "@/env/server";
import { db } from "@/lib/drizzle";
import {
  designToProductDefaultFormFields,
  designToProductProductText,
  fetchDesignToProductPng,
} from "@/services/line/design-to-product-api.service";
import {
  bufferFromImageRef,
  uploadImageToCloudinary,
} from "@/services/cloudinary/cloudinary-upload.service";

/** พิมพ์คำสั่งนี้แล้วส่งรูปดีไซน์ ตามด้วยรูปเสื้อ */
export const CMD_DESIGN_TO_PRODUCT = "/designproduct";

function lineClient() {
  const t = serverEnv.LINE_CHANNEL_ACCESS_TOKEN;
  if (!t) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }
  return LineBotClient.fromChannelAccessToken({ channelAccessToken: t });
}

const now = () => new Date().toISOString();

function mimeFromBuffer(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return "image/gif";
  }
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    return "image/webp";
  }
  return "image/jpeg";
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return buffer(stream);
}

export async function resetDesignToProductSession(lineUserId: string) {
  const t = now();
  await db
    .insert(lineDesignToProductSessions)
    .values({ lineUserId, designImageDataUrl: null, createdAt: t })
    .onConflictDoUpdate({
      target: [lineDesignToProductSessions.lineUserId],
      set: { designImageDataUrl: null, createdAt: t },
    });
}

export async function clearDesignToProductSession(lineUserId: string) {
  await db
    .delete(lineDesignToProductSessions)
    .where(eq(lineDesignToProductSessions.lineUserId, lineUserId));
}

async function setSessionDesignImage(
  lineUserId: string,
  designImageDataUrl: string,
) {
  await db
    .update(lineDesignToProductSessions)
    .set({ designImageDataUrl, createdAt: now() })
    .where(eq(lineDesignToProductSessions.lineUserId, lineUserId));
}

type SessionRow = {
  lineUserId: string;
  designImageDataUrl: string | null;
};

async function getSession(
  lineUserId: string,
): Promise<SessionRow | undefined> {
  const r = await db
    .select()
    .from(lineDesignToProductSessions)
    .where(eq(lineDesignToProductSessions.lineUserId, lineUserId))
    .limit(1);
  return r[0];
}

type MessageEvent = {
  type: "message";
  message: { type: string; id: string; text?: string; contentProvider?: object };
  source: { type: string; userId?: string; groupId?: string };
  replyToken: string;
};

function getLineUserId(source: MessageEvent["source"]): string | null {
  if (source.type === "user" && source.userId) {
    return source.userId;
  }
  return null;
}

function buildApiFormParamsRecord(productPrompt: string): Record<string, string> {
  return {
    ...designToProductDefaultFormFields,
    product: productPrompt,
  };
}

async function processDesignToProductPipeline(input: {
  lineUserId: string;
  designRef: string;
  garmentMessageId: string;
}) {
  const { lineUserId, designRef, garmentMessageId } = input;
  const client = lineClient();
  let displayName: string | null = null;
  const profile = await client.getProfile(lineUserId).catch(() => null);
  displayName = profile?.displayName ?? null;

  let designImageUrl: string;
  let designBuf: Buffer;
  let designMime: string;
  try {
    const parsed = await bufferFromImageRef(designRef);
    designBuf = parsed.buffer;
    designMime = parsed.mimeType;
    designImageUrl = /^https?:\/\//i.test(designRef.trim())
      ? designRef.trim()
      : await uploadImageToCloudinary({
          buffer: designBuf,
          mimeType: designMime,
          kind: "origin",
          ownerKey: lineUserId,
        });
  } catch {
    await clearDesignToProductSession(lineUserId);
    await client.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: "อ่านรูปดีไซน์หรืออัปโหลด Cloudinary ไม่สำเร็จ — เริ่มใหม่ด้วย /designproduct",
        },
      ],
    });
    return;
  }

  const garmentBody = await client.getMessageContent(garmentMessageId);
  const garmentBuf = await streamToBuffer(garmentBody as unknown as Readable);
  const garmentMime = mimeFromBuffer(garmentBuf);

  let garmentImageUrl: string;
  try {
    garmentImageUrl = await uploadImageToCloudinary({
      buffer: garmentBuf,
      mimeType: garmentMime,
      kind: "origin",
      ownerKey: lineUserId,
    });
  } catch (e) {
    await clearDesignToProductSession(lineUserId);
    const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
    void client.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: `อัปโหลดรูปเสื้อไป Cloudinary ไม่สำเร็จ: ${msg}`,
        },
      ],
    });
    return;
  }

  const productPrompt = designToProductProductText();
  const t0 = now();
  let resultImageUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const png = await fetchDesignToProductPng({
      design: { buffer: designBuf, mimeType: designMime },
      garment: { buffer: garmentBuf, mimeType: garmentMime },
      productDescription: productPrompt,
    });
    resultImageUrl = await uploadImageToCloudinary({
      buffer: png,
      mimeType: "image/png",
      kind: "product-ai",
      ownerKey: lineUserId,
    });
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e);
    console.error("design-to-product API", e);
  }

  const paramsRecord = buildApiFormParamsRecord(productPrompt);
  const row = await db
    .insert(designToProductGenerations)
    .values({
      lineUserId,
      lineDisplayName: displayName,
      designImageDataUrl: designImageUrl,
      productImageDataUrl: garmentImageUrl,
      resultImageDataUrl: resultImageUrl,
      productPrompt,
      apiFormParams: paramsRecord,
      errorMessage,
      createdAt: t0,
      updatedAt: t0,
    })
    .returning({ id: designToProductGenerations.id });
  const rowId = row[0]?.id;
  await clearDesignToProductSession(lineUserId);

  if (!rowId) {
    await client.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text: "บันทึกผลลัพธ์ล้มเหลว" }],
    });
    return;
  }

  if (!resultImageUrl) {
    await client.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: `เรียก design-to-product หรืออัปโหลดผลลัพธ์ไม่สำเร็จ: ${(errorMessage ?? "unknown").slice(0, 800)}`,
        },
      ],
    });
    return;
  }

  await client.pushMessage({
    to: lineUserId,
    messages: [
      { type: "text", text: "เสร็จแล้ว — รูปที่ AI สร้างจากดีไซน์และเสื้อของคุณ" },
      {
        type: "image",
        originalContentUrl: resultImageUrl,
        previewImageUrl: resultImageUrl,
      },
      {
        type: "text",
        text: `ฟิลด์ product ที่ใช้: ${productPrompt.slice(0, 400)}${productPrompt.length > 400 ? "…" : ""}`,
      },
    ],
  });
}

/**
 * คืน true ถ้าจัดการอีเวนต์แล้ว (ไม่ให้โฟลว์ /mockproduct ทับ)
 */
export async function tryHandleDesignToProductLineMessage(
  event: MessageEvent,
): Promise<boolean> {
  const lineUserId = getLineUserId(event.source);
  if (!lineUserId) {
    return false;
  }

  const client = lineClient();
  const msg = event.message;

  if (msg.type === "text" && msg.text?.trim() === CMD_DESIGN_TO_PRODUCT) {
    await db
      .delete(lineMockSessions)
      .where(eq(lineMockSessions.lineUserId, lineUserId));
    await resetDesignToProductSession(lineUserId);
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "ส่งรูปดีไซน์ก่อน 1 รูป แล้วตามด้วยรูปเสื้อ (หรือแบบเสื้อ) อีก 1 รูป — ระบบจะเรียก API design-to-product ด้วยค่า default (faithful, remove_bg, flat_lay ฯลฯ)",
        },
      ],
    });
    return true;
  }

  if (msg.type === "image") {
    const session = await getSession(lineUserId);
    if (!session) {
      return false;
    }

    const messageId = msg.id;

    if (session.designImageDataUrl == null) {
      const body = await client.getMessageContent(messageId);
      const imageBuf = await streamToBuffer(body as unknown as Readable);
      const mime = mimeFromBuffer(imageBuf);
      let designUrl: string;
      try {
        designUrl = await uploadImageToCloudinary({
          buffer: imageBuf,
          mimeType: mime,
          kind: "origin",
          ownerKey: lineUserId,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: `อัปโหลดรูปดีไซน์ไป Cloudinary ไม่สำเร็จ: ${msg}`,
            },
          ],
        });
        return true;
      }
      await setSessionDesignImage(lineUserId, designUrl);
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          { type: "text", text: "ได้รูปดีไซน์แล้ว — ส่งรูปเสื้อต่ออีก 1 รูป" },
        ],
      });
      return true;
    }

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "กำลังส่งไป design-to-product และบันทึกผล…",
        },
      ],
    });

    const designRef = session.designImageDataUrl;
    after(() => {
      void processDesignToProductPipeline({
        lineUserId,
        designRef,
        garmentMessageId: messageId,
      }).catch((e) => {
        console.error("line design-to-product pipeline", e);
        void client.pushMessage({
          to: lineUserId,
          messages: [
            {
              type: "text",
              text: "เกิดข้อผิดพลาดระหว่างสร้างรูป — ลองใหม่หรือเริ่มด้วย /designproduct",
            },
          ],
        });
      });
    });
    return true;
  }

  return false;
}
