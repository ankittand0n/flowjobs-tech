import { z } from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

export enum PostType {
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
  DISCUSSION = "DISCUSSION",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.nativeEnum(PostType),
});

const CreateCommentSchema = z.object({
  content: z.string().min(1),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
