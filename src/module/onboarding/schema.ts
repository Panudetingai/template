import { z } from "zod";

export const SetupProfileSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Please enter your username" })
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  avatarUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .max(255, { message: "Avatar URL must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
});

export type SetupProfileSchemaType = z.infer<typeof SetupProfileSchema>;
