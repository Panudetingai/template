import { publicEnv } from "@/env/public";
import { serverEnv } from "@/env/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function requireKey() {
  const key = serverEnv.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return key;
}

const defaultVisionModel = "openai/gpt-4o-mini";

export type MockProductPayload = {
  generateProduct: Record<string, unknown>;
};

/**
 * Vision + JSON: วิเคราะห์รูปสินค้า แล้วคืน object ที่มีคีย์ generateProduct
 */
export async function analyzeProductImageToJson(input: {
  imageBase64: string;
  mimeType: string;
}): Promise<MockProductPayload> {
  const model = serverEnv.OPENROUTER_VISION_MODEL ?? defaultVisionModel;
  const key = requireKey();

  const system = `You are a product marketing assistant. Return ONLY valid JSON (no markdown) with this exact shape:
{"generateProduct":{"name":"string","description":"string","targetAudience":"string","suggestedPrice":"string","materials":"string","colorPalette":["string"],"marketingAngles":["string"],"tags":["string"],"summaryForImagePrompt":"string (short English prompt for a product photo mockup)"}}
The field "summaryForImagePrompt" must be a concise English description for generating a single photorealistic e-commerce product shot.`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": publicEnv.NEXT_PUBLIC_APP_URL,
      "X-Title": publicEnv.NEXT_PUBLIC_APP_TITLE,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this product image and fill generateProduct accordingly.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${input.mimeType};base64,${input.imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter vision failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("OpenRouter: empty vision content");
  }

  const parsed = JSON.parse(raw) as unknown;
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("generateProduct" in parsed) ||
    typeof (parsed as MockProductPayload).generateProduct !== "object" ||
    (parsed as MockProductPayload).generateProduct === null
  ) {
    throw new Error("OpenRouter: missing generateProduct in JSON");
  }
  return parsed as MockProductPayload;
}

/**
 * สร้างรูป mockup ผ่าน modalities (ถ้า model รองรับ)
 */
export async function generateProductMockupImage(input: {
  /** ข้อความสร้างรูป — ใช้ summaryForImagePrompt + บริบทจาก generateProduct */
  prompt: string;
}): Promise<string | null> {
  const model = serverEnv.OPENROUTER_IMAGE_MODEL;
  if (!model) {
    return null;
  }
  const key = requireKey();

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": publicEnv.NEXT_PUBLIC_APP_URL,
      "X-Title": publicEnv.NEXT_PUBLIC_APP_TITLE,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: `Photorealistic e-commerce product mockup on neutral studio background, soft lighting, high detail. ${input.prompt}`,
        },
      ],
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: "1:1",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenRouter image gen failed:", res.status, err);
    return null;
  }

  const data = (await res.json()) as {
    choices?: {
      message?: {
        images?: { image_url?: { url?: string }; type?: string }[];
        content?: string | null;
      };
    }[];
  };

  const images = data.choices?.[0]?.message?.images;
  const first = images?.[0];
  const url = first?.image_url?.url;
  if (url && typeof url === "string") {
    return url;
  }

  return null;
}
