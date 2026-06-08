import { z } from "zod";

export const AuthWebhookQuerySchema = z.object({
  userId: z.string().uuid(),
});

export const AuthWebhookClientMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ping") }),
]);

export const AuthWebhookServerMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("pong") }),
  z.object({
    action: z.literal("redirect"),
    route: z.string().startsWith("/"),
  }),
]);

export const AuthWebhookPayloadSchema = z.object({
  userId: z.string().uuid(),
  status: z.literal("verified").optional(),
});

export type AuthWebhookQuery = z.infer<typeof AuthWebhookQuerySchema>;
export type AuthWebhookClientMessage = z.infer<
  typeof AuthWebhookClientMessageSchema
>;
export type AuthWebhookServerMessage = z.infer<
  typeof AuthWebhookServerMessageSchema
>;
export type AuthWebhookPayload = z.infer<typeof AuthWebhookPayloadSchema>;
