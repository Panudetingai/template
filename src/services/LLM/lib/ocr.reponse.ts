import { OCRResponseOtherSchema, OCRResponseSlipSchema } from "../groq/types/ocr.type";

export type OCRResponseTypeENUM = "slip" | "other";

export function OCRResponseSchema(type: "slip"): typeof OCRResponseSlipSchema;
export function OCRResponseSchema(type: "other"): typeof OCRResponseOtherSchema;
export function OCRResponseSchema(type: OCRResponseTypeENUM) {
    switch (type) {
        case "slip":
            return OCRResponseSlipSchema;
        default:
            return OCRResponseOtherSchema;
    }
}