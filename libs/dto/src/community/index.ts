import { z } from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

export enum PostType {
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
  DISCUSSION = "DISCUSSION",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

const CreatePostSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(1000),
  type: z.nativeEnum(PostType),
});

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
