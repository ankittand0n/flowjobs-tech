import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VerifyRazorpayPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

const PayuCallbackSchema = z.object({
  txnid: z.string(),
  mihpayid: z.string().optional(),
  status: z.enum(['success', 'failure', 'pending']),
  hash: z.string(),
});

export class VerifyRazorpayPaymentDto extends createZodDto(VerifyRazorpayPaymentSchema) {}
export class PayuCallbackDto extends createZodDto(PayuCallbackSchema) {} 