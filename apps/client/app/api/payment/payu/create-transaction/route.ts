import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PAYU_CONFIG } from '@/client/config/payment';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    
    const txnid = `TXN_${Date.now()}`;
    const amount = plan.amount.toString();
    const productinfo = plan.name;
    const firstname = ''; // Add user's name if available
    const email = ''; // Add user's email if available
    const phone = ''; // Add user's phone if available
    
    // Generate hash
    const hashString = `${PAYU_CONFIG.merchant_key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_CONFIG.merchant_salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const payuForm = {
      key: PAYU_CONFIG.merchant_key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: PAYU_CONFIG.surl,
      furl: PAYU_CONFIG.furl,
      hash,
      service_provider: 'payu_paisa',
    };

    const url = PAYU_CONFIG.mode === 'PROD'
      ? 'https://secure.payu.in/_payment'
      : 'https://sandboxsecure.payu.in/_payment';

    return NextResponse.json({ form: payuForm, url });
  } catch (error) {
    console.error('PayU transaction creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
} 