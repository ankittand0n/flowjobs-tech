import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const updateJobApplicationSchema = z.object({
  status: z.string(),
  notes: z.string(),
  resumeId: z.string().optional(),
});

export class UpdateJobApplicationDto extends createZodDto(updateJobApplicationSchema) {}
