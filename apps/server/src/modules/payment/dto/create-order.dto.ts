import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  plan: z.enum(['BASIC', 'PRO']),
  amount: z.number().min(1),
  currency: z.string().length(3), // e.g., 'INR', 'USD'
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {} 