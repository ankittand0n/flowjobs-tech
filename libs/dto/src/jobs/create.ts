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
  ).optional(),
  education: z.array(
    z.object({
      level: z.string(),
      field: z.string().optional(),
    }),
  ).optional(),
});

const createJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  type: z.string().optional(),
  salary: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  atsKeywords: atsKeywordsSchema.optional(),
  createdBy: z.string().optional(),
});

export class CreateJobDto extends createZodDto(createJobSchema) {}
