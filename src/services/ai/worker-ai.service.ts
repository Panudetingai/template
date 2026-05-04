import { serverEnv } from "@/env/server";
import { uploadImageToCloudinary } from "../cloudinary/cloudinary-upload.service";
import { db } from "@/lib/drizzle";
import { productionGeneratedDesigns } from "../../../drizzle/schema";

const defaultWorkerBaseUrl = "https://ai-worker-api.codedroy3.workers.dev";
const defaultWorkerApiKey = "your-development-api-key";

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, "");
}

function getWorkerBaseUrl(): string {
  const fromEnv = serverEnv.AI_WORKER_BASE_URL?.trim();
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  const legacyDesignToProductUrl = serverEnv.DESIGN_TO_PRODUCT_API_URL?.trim();
  if (legacyDesignToProductUrl) {
    try {
      const parsed = new URL(legacyDesignToProductUrl);
      return `${parsed.origin}`;
    } catch {
      // fallback to default base url
    }
  }

  return defaultWorkerBaseUrl;
}

function getWorkerApiKey(): string {
  const fromEnv = serverEnv.AI_WORKER_API_KEY?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const legacyApiKey = serverEnv.DESIGN_TO_PRODUCT_API_KEY?.trim();
  if (legacyApiKey) {
    return legacyApiKey;
  }
  return defaultWorkerApiKey;
}

function buildEndpoint(pathname: string): string {
  return `${getWorkerBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

type WorkerRequestOptions = {
  method: "GET" | "POST";
  path: string;
  body?: BodyInit;
  contentType?: string;
};

async function requestWorker(input: WorkerRequestOptions): Promise<Response> {
  const headers = new Headers();
  headers.set("X-API-Key", getWorkerApiKey());
  if (input.contentType) {
    headers.set("Content-Type", input.contentType);
  }

  return fetch(buildEndpoint(input.path), {
    method: input.method,
    headers,
    body: input.body,
  });
}

async function throwWorkerError(prefix: string, response: Response): Promise<never> {
  const errText = await response.text().catch(() => "");
  throw new Error(`${prefix} ${response.status}: ${errText.slice(0, 500)}`);
}

export async function aiWorkerHealthCheck(): Promise<{
  ok: boolean;
  status: number;
  body: string;
}> {
  const res = await fetch(buildEndpoint("/api/health"), { method: "GET" });
  const body = await res.text().catch(() => "");
  return {
    ok: res.ok,
    status: res.status,
    body,
  };
}

export async function aiWorkerGenerateFromPrompt(prompt: string): Promise<string> {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) {
    throw new Error("Prompt is required");
  }

  const res = await requestWorker({
    method: "POST",
    path: "/api/design-shirt",
    contentType: "application/json",
    body: JSON.stringify({ prompt: normalizedPrompt, mode: "mockup" }),
  });

  if (!res.ok) {
    await throwWorkerError("AI worker /api/generate", res);
  }

  // Upload to Cloudinary
  const resultBuffer = await res.arrayBuffer();
  const cloudinaryUrl = await uploadImageToCloudinary({
    buffer: Buffer.from(new Uint8Array(resultBuffer)),
    mimeType: "image/png",
    kind: "product-ai",
    ownerKey: "user-id",
  });

  await db.insert(productionGeneratedDesigns).values({
    prompt: normalizedPrompt,
    generatedImageDataUrl: cloudinaryUrl,
  }).returning({ id: productionGeneratedDesigns.id });

  return cloudinaryUrl;
}

export type AiWorkerDesignToProductInput = {
  design: { buffer: Buffer; mimeType: string };
  garment?: { buffer: Buffer; mimeType: string };
  productDescription: string;
  defaultFields: Record<string, string>;
  garmentField: string | null;
};

export async function aiWorkerDesignToProduct(
  input: AiWorkerDesignToProductInput,
): Promise<Buffer> {
  const product = input.productDescription.trim();
  if (!product) {
    throw new Error("Product description is required");
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(input.defaultFields)) {
    form.append(key, value);
  }
  form.append("product", product);

  const d = input.design;
  const designName = `design.${extensionForMime(d.mimeType)}`;
  form.append(
    "design",
    new Blob([new Uint8Array(d.buffer)], { type: d.mimeType }),
    designName,
  );

  if (input.garmentField && input.garment) {
    const g = input.garment;
    const garmentName = `garment.${extensionForMime(g.mimeType)}`;
    form.append(
      input.garmentField,
      new Blob([new Uint8Array(g.buffer)], { type: g.mimeType }),
      garmentName,
    );
  }

  const res = await requestWorker({
    method: "POST",
    path: "/api/design-shirt",
    body: form,
  });

  if (!res.ok) {
    await throwWorkerError("AI worker /api/design-to-product", res);
  }

  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
