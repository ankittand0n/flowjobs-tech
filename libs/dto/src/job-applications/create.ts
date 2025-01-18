import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const createJobApplicationSchema = z.object({
  jobId: z.string(),
  status: z.string().default('draft'),
  notes: z.string(),
  resumeId: z.string().optional(),
});

export class CreateJobApplicationDto extends createZodDto(createJobApplicationSchema) {}
