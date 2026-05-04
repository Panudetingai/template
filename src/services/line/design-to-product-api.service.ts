import { serverEnv } from "@/env/server";
import { aiWorkerDesignToProduct } from "@/services/ai/worker-ai.service";

/** ค่า default ตาม curl design-to-product (ฟิลด์ product ใส่แยก) */
export const designToProductDefaultFormFields: Record<string, string> = {
  faithful: "0.4",
  remove_bg: "1",
  remove_bg_threshold: "180",
  faithful_blend: "multiply",
  faithful_refine: "1",
  faithful_refine_strength: "0.28",
  shot: "flat_lay",
};

const defaultProductDescription = "white crew neck cotton t-shirt";
/** ข้อความฟิลด์ product ที่ส่งไป Worker — override ด้วย DESIGN_TO_PRODUCT_PRODUCT */
export function designToProductProductText(): string {
  const fromEnv = serverEnv.DESIGN_TO_PRODUCT_PRODUCT?.trim();
  if (fromEnv) {
    return fromEnv.slice(0, 2000);
  }
  return defaultProductDescription;
}

function garmentFormField(): string | null {
  const raw = serverEnv.DESIGN_TO_PRODUCT_GARMENT_FORM_FIELD;
  if (raw === undefined) {
    return "garment";
  }
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

export type DesignToProductApiInput = {
  design: { buffer: Buffer; mimeType: string };
  garment?: { buffer: Buffer; mimeType: string };
  /** ฟิลด์ product ในฟอร์ม */
  productDescription: string;
};

/**
 * ส่ง multipart ไปยัง /api/design-to-product คืนเป็น PNG buffer
 */
export async function fetchDesignToProductPng(
  input: DesignToProductApiInput,
): Promise<Buffer> {
  const product =
    input.productDescription.trim() || designToProductProductText();
  return aiWorkerDesignToProduct({
    design: input.design,
    garment: input.garment,
    productDescription: product,
    defaultFields: designToProductDefaultFormFields,
    garmentField: garmentFormField(),
  });
}

export function defaultProductDescriptionText(): string {
  return designToProductProductText();
}
