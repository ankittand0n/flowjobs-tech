import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { RAZORPAY_CONFIG } from '@/client/config/payment';

const razorpay = new Razorpay({
  key_id: RAZORPAY_CONFIG.key_id,
  key_secret: RAZORPAY_CONFIG.key_secret,
});

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    const options = {
      amount: plan.amount * 100, // amount in smallest currency unit (paise for INR)
      currency: plan.currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
} 