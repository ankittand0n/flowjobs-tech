import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const atsKeywordsSchema = z.object({
  skills: z.array(
    z.object({
      keyword: z.string(),
      relevance: z.number(),
      count: z.number(),
    }),
  ),
  requirements: z.array(
    z.object({
      keyword: z.string(),
      type: z.enum(["must-have", "nice-to-have"]),
    }),
  ),
  experience: z.array(
    z.object({
      keyword: z.string(),
      yearsRequired: z.number().optional(),
    }),
  ),
  education: z.array(
    z.object({
      level: z.string(),
      field: z.string().optional(),
    }),
  ),
});

const updateJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  type: z.string().optional(),
  salary: z.string().optional(),
  url: z.string().url().optional(),
  status: z.string(),
  resumeId: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  atsKeywords: atsKeywordsSchema.optional(),
});

export class UpdateJobDto extends createZodDto(updateJobSchema) {}
