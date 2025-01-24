import { z } from "zod";

export const createMockTestSchema = z.object({
  title: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  category: z.string(),
  difficulty: z.string(),
  duration: z.number(),
  answers: z.record(z.any()),
});

export type CreateMockTest = z.infer<typeof createMockTestSchema>; 