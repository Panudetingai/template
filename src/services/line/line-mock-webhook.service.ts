import { LineBotClient } from "@line/bot-sdk";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import { serverEnv } from "@/env/server";
import { db } from "@/lib/drizzle";
import {
  designToProductDefaultFormFields,
  designToProductProductText,
  fetchDesignToProductPng,
} from "@/services/line/design-to-product-api.service";
import { uploadImageToCloudinary } from "@/services/cloudinary/cloudinary-upload.service";
import {
  lineDesignToProductSessions,
  lineMockSessions,
  mockProductGenerations,
} from "../../../drizzle/schema";

const CMD = "/mockproduct";

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

export async function setAwaitingImage(lineUserId: string) {
  const t = now();
  await db
    .delete(lineDesignToProductSessions)
    .where(eq(lineDesignToProductSessions.lineUserId, lineUserId));
  await db
    .insert(lineMockSessions)
    .values({ lineUserId, createdAt: t })
    .onConflictDoUpdate({
      target: [lineMockSessions.lineUserId],
      set: { createdAt: t },
    });
}

export async function isAwaitingImage(lineUserId: string): Promise<boolean> {
  const r = await db
    .select()
    .from(lineMockSessions)
    .where(eq(lineMockSessions.lineUserId, lineUserId))
    .limit(1);
  return r.length > 0;
}

export async function clearSession(lineUserId: string) {
  await db.delete(lineMockSessions).where(eq(lineMockSessions.lineUserId, lineUserId));
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

async function processImagePipeline(input: { lineUserId: string; messageId: string }) {
  const { lineUserId, messageId } = input;
  const client = lineClient();
  let displayName: string | null = null;
  const profile = await client.getProfile(lineUserId).catch(() => null);
  displayName = profile?.displayName ?? null;

  const body = await client.getMessageContent(messageId);
  const imageBuf = await streamToBuffer(body as unknown as Readable);
  const mime = mimeFromBuffer(imageBuf);

  let sourceImageUrl: string;
  try {
    sourceImageUrl = await uploadImageToCloudinary({
      buffer: imageBuf,
      mimeType: mime,
      kind: "origin",
      ownerKey: lineUserId,
    });
  } catch (e) {
    await clearSession(lineUserId);
    const msg = e instanceof Error ? e.message.slice(0, 400) : String(e);
    await client.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: `อัปโหลดรูปต้นทางไป Cloudinary ไม่สำเร็จ: ${msg}`,
        },
      ],
    });
    return;
  }

  const productPrompt = designToProductProductText();
  const generateProduct: Record<string, unknown> = {
    pipeline: "design-to-product",
    productPrompt,
    apiFormParams: {
      ...designToProductDefaultFormFields,
      product: productPrompt,
    },
    cloudinary: {
      sourceUrl: sourceImageUrl,
    },
  };

  let generatedImageUrl: string | null = null;
  try {
    const png = await fetchDesignToProductPng({
      design: { buffer: imageBuf, mimeType: mime },
      productDescription: productPrompt,
    });
    generatedImageUrl = await uploadImageToCloudinary({
      buffer: png,
      mimeType: "image/png",
      kind: "product-ai",
      ownerKey: lineUserId,
    });
    (generateProduct.cloudinary as Record<string, string>).resultUrl =
      generatedImageUrl;
  } catch (e) {
    await clearSession(lineUserId);
    const msg =
      e instanceof Error ? e.message.slice(0, 800) : String(e).slice(0, 800);
    await client.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text: `เรียก design-to-product ไม่สำเร็จ: ${msg}`,
        },
      ],
    });
    return;
  }

  const t0 = now();
  const row = await db
    .insert(mockProductGenerations)
    .values({
      lineUserId,
      lineDisplayName: displayName,
      sourceImageDataUrl: sourceImageUrl,
      generatedImageDataUrl: generatedImageUrl,
      generateProduct,
      createdAt: t0,
      updatedAt: t0,
    })
    .returning({ id: mockProductGenerations.id });
  const rowId = row[0]?.id;
  await clearSession(lineUserId);

  if (!rowId) {
    await client.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text: "บันทึกผลลัพธ์ล้มเหลว" }],
    });
    return;
  }

  if (!generatedImageUrl) {
    return;
  }

  await client.pushMessage({
    to: lineUserId,
    messages: [
      {
        type: "image",
        originalContentUrl: generatedImageUrl,
        previewImageUrl: generatedImageUrl,
      },
    ],
  });
}

/**
 * จัด handling LINE message (ใช้ใน route webhook)
 */
export async function handleLineMessageEvent(event: MessageEvent) {
  const lineUserId = getLineUserId(event.source);
  if (!lineUserId) {
    return;
  }

  const client = lineClient();
  const msg = event.message;

  if (msg.type === "text" && (msg as { text?: string }).text?.trim() === CMD) {
    await setAwaitingImage(lineUserId);
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "ส่งรูปดีไซน์/ลาย 1 รูป — ระบบจะเรียก Worker design-to-product (รูปเดียว + ฟิลด์ product จาก env)",
        },
      ],
    });
    return;
  }

  if (msg.type === "image") {
    if (!(await isAwaitingImage(lineUserId))) {
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: `กรุณาพิมพ์ ${CMD} ก่อน แล้วค่อยส่งรูป`,
          },
        ],
      });
      return;
    }

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        { type: "text", text: "ฉันกำลังทำงานอย่างหนักอยู่ กรุณารอสักครั้ง" },
      ],
    });

    const messageId = (msg as { id: string }).id;
    after(() => {
      void processImagePipeline({ lineUserId, messageId }).catch((e) => {
        console.error("line mock product pipeline", e);
        void client.pushMessage({
          to: lineUserId,
          messages: [
            {
              type: "text",
              text: "เกิดข้อผิดพลาดระหว่างสร้าง mock — ลองอีกครั้ง",
            },
          ],
        });
      });
    });
  }
}
