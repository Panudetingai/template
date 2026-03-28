import z from "zod";

// Note: Groq structured output requires every `properties` key to appear in `required`.
// Zod `.default()` makes fields optional in JSON Schema and breaks that rule.

export const OCRResponseOtherSchema = z.object({
    type: z.enum(["other"]),
    description: z.string(),
});

export const OCRResponseSlipSchema = z.object({
    type: z.enum(["transfer", "receive"]),
    amount: z.number(),
    fee: z.number(),
    sender: z.string(),
    receiver: z.string(),
    bank_name: z.string(),
    transaction_id: z.string(),
    transaction_date: z.string(),
});

/** Groq รับได้ครั้งละหลายภาพ — ใช้ object นี้เพื่อบังคับจำนวน slip ให้เท่ากับจำนวนภาพในแต่ละ request */
export function OCRBatchSlipSchema(count: number) {
    if (count < 1) {
        throw new Error("OCRBatchSlipSchema: count must be >= 1");
    }
    return z.object({
        slips: z.array(OCRResponseSlipSchema).length(count),
    });
}
