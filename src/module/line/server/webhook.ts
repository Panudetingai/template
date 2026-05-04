import { validateSignature } from "@line/bot-sdk";
import { serverEnv } from "@/env/server";
import { tryHandleDesignToProductLineMessage } from "@/services/line/line-design-product-webhook.service";
import { handleLineMessageEvent } from "@/services/line/line-mock-webhook.service";

type MessageEvent = Parameters<typeof handleLineMessageEvent>[0];

export async function POST(request: Request) {
  const channelSecret = serverEnv.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    return new Response("LINE_CHANNEL_SECRET not configured", { status: 500 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";
  if (!validateSignature(raw, channelSecret, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const body = JSON.parse(raw) as { events?: unknown[] };
  const events = body.events ?? [];

  for (const e of events) {
    if (!e || typeof e !== "object") {
      continue;
    }
    const ev = e as { type?: string };
    if (ev.type === "message") {
      const msgEv = e as MessageEvent;
      if (!msgEv.replyToken || !msgEv.message || !msgEv.source) {
        continue;
      }
      try {
        const handled = await tryHandleDesignToProductLineMessage(msgEv);
        if (!handled) {
          await handleLineMessageEvent(msgEv);
        }
      } catch (err) {
        console.error("LINE message handler", err);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
