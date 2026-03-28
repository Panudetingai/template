import { GroqProvider } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import z from "zod";
import { OCRResponseSchema } from "../../lib/ocr.reponse";
import { ocrPromptSystemSlip, ocrPromptSystemSlipBatch } from "../../prompt/ocr";
import { OCRBatchSlipSchema, OCRResponseSlipSchema } from "../types/ocr.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 100;
/** จำกัดตาม Groq — ส่งได้ครั้งละไม่เกินนี้ แล้ววนจนอ่านครบทุกไฟล์ */
const IMAGES_PER_REQUEST = 5;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const OCRschema = z.object({
  image: z
    .file({
      error: "Image must be a valid image file",
    })
    .transform((file) => file.arrayBuffer()),
});

export type OCRParameters = z.infer<typeof OCRschema>;
export type OCRSlipResult = z.infer<typeof OCRResponseSlipSchema>;

class OCRService {
  private readonly groqModel: GroqProvider["languageModel"];

  constructor(groqModel: GroqProvider["languageModel"]) {
    this.groqModel = groqModel;
  }

  /** อ่านสลิป 1 ไฟล์ */
  public async generateOCR(file: File): Promise<OCRSlipResult> {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(
        `Image size must be at most ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(fileBuffer).toString("base64");

    const result = await generateText({
      model: this.groqModel("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: [
        {
          role: "system",
          content: ocrPromptSystemSlip(),
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
      ],
      output: Output.object({ schema: OCRResponseSchema("slip") }),
      temperature: 1,
      maxOutputTokens: 1000,
    });
    return result.output;
  }

  /**
   * อ่านหลายไฟล์ — ถ้าเกิน {@link IMAGES_PER_REQUEST} จะแบ่งชุดละไม่เกิน 5 แล้วรวมผลจนครบ
   */
  public async generateOCRManyImages(files: File[]): Promise<OCRSlipResult[]> {
    if (files.length === 0) {
      return [];
    }
    if (files.length > MAX_FILES) {
      throw new Error(`At most ${MAX_FILES} images allowed`);
    }
    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error(
          `Each image must be at most ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        );
      }
    }

    const allSlips: OCRSlipResult[] = [];

    for (const chunk of chunkArray(files, IMAGES_PER_REQUEST)) {
      const buffers = await Promise.all(chunk.map((f) => f.arrayBuffer()));
      const base64Images = buffers.map((buf) =>
        Buffer.from(buf).toString("base64"),
      );
      const n = chunk.length;

      try {
        const result = await generateText({
          model: this.groqModel("meta-llama/llama-4-scout-17b-16e-instruct"),
          messages: [
            {
              role: "system",
              content: ocrPromptSystemSlipBatch(n),
            },
            {
              role: "user",
              content: base64Images.map((image) => ({
                type: "image" as const,
                image,
              })),
            },
          ],
          output: Output.object({ schema: OCRBatchSlipSchema(n) }),
          temperature: 1,
          maxOutputTokens: 4000,
        });
        allSlips.push(...result.output.slips);
      } catch (error) {
        throw new Error(`Failed to generate OCR for chunk ${n}: ${error}`);
      }
    }

    return allSlips;
  }
}

export { OCRService };
