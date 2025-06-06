import { idSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { secretsSchema } from "../secrets";

// Add new enums
export const roleSchema = z.enum(["USER", "ADMIN", "MODERATOR"]);
export const subscriptionStatusSchema = z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]);

export const usernameSchema = z
  .string()
  .min(3)
  .max(255)
  .regex(/^[\w.-]+$/, {
    message: "Usernames can only contain letters, numbers, periods, hyphens, and underscores.",
  })
  .transform((value) => value.toLowerCase());

export const userSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(255),
  picture: z.literal("").or(z.null()).or(z.string().url()),
  username: usernameSchema,
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  locale: z.string().default("en-US"),
  emailVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  provider: z.enum(["email", "github", "google", "openid"]).default("email"),
  role: roleSchema.default("USER"),
  subscriptionStatus: subscriptionStatusSchema.default("FREE"),
  subscriptionEndDate: dateSchema.nullable().optional(),
  stripeCustomerId: z.string().nullable().optional(),
  razorpayCustomerId: z.string().nullable().optional(),
  paypalCustomerId: z.string().nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export class UserDto extends createZodDto(userSchema) {}

export const userWithSecretsSchema = userSchema.merge(
  z.object({
    secrets: secretsSchema,
    role: roleSchema.default("USER"),
    subscriptionStatus: subscriptionStatusSchema.default("FREE"),
    subscriptionEndDate: z.union([z.date(), z.string()]).nullable().optional(),
  })
);

export class UserWithSecrets extends createZodDto(userWithSecretsSchema) {}
