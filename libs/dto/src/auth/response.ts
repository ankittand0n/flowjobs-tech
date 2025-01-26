import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema, roleSchema, subscriptionStatusSchema } from "../user";
import { dateSchema } from "@reactive-resume/utils";

export const authResponseSchema = z.object({
  status: z.enum(["authenticated", "2fa_required"]),
  user: userSchema,
  role: roleSchema,
  subscriptionStatus: subscriptionStatusSchema.optional(),
  subscriptionEndDate: dateSchema.nullable().optional(),
});

export class AuthResponseDto extends createZodDto(authResponseSchema) {}
