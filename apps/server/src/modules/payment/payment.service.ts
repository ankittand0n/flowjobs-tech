import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyRazorpayPaymentDto, PayuCallbackDto } from './dto/verify-payment.dto';
import { PaymentProvider, User, SubscriptionStatus } from '@prisma/client';
import * as crypto from 'crypto';
import Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private readonly razorpayKeySecret: string;
  private readonly payuMerchantKey: string;
  private readonly payuMerchantSalt: string;
  private readonly payuMode: 'PROD' | 'TEST';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.razorpayKeySecret = this.configService.getOrThrow('RAZORPAY_KEY_SECRET');
    this.payuMerchantKey = this.configService.getOrThrow('PAYU_MERCHANT_KEY');
    this.payuMerchantSalt = this.configService.getOrThrow('PAYU_MERCHANT_SALT');
    this.payuMode = this.configService.get('NODE_ENV') === 'production' ? 'PROD' : 'TEST';
  }

  async createRazorpayOrder(createOrderDto: CreateOrderDto, user: User) {
    const razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });

    const order = await razorpay.orders.create({
      amount: createOrderDto.amount * 100, // Convert to paise
      currency: createOrderDto.currency,
      receipt: `order_${Date.now()}`,
    });

    // Store payment record
    await this.prisma.payment.create({
      data: {
        providerId: order.id,
        userId: user.id,
        amount: createOrderDto.amount,
        currency: createOrderDto.currency,
        provider: PaymentProvider.RAZORPAY,
        status: 'PENDING',
        metadata: {
          plan: createOrderDto.plan,
        },
      },
    });

    return {
      orderId: order.id,
      currency: order.currency,
      amount: Number(order.amount) / 100,
      keyId: this.configService.get('RAZORPAY_KEY_ID'),
    };
  }

  async verifyRazorpayPayment(verifyDto: VerifyRazorpayPaymentDto) {
    const secret = this.configService.get('RAZORPAY_KEY_SECRET');
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${verifyDto.razorpay_order_id}|${verifyDto.razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === verifyDto.razorpay_signature;

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerId: verifyDto.razorpay_order_id },
      include: { user: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        providerId: verifyDto.razorpay_payment_id,
      },
    });

    // Update user subscription
    await this.prisma.user.update({
      where: { id: payment.userId },
      data: {
        subscription: {
          upsert: {
            create: {
              planId: (payment.metadata as any).plan,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              status: SubscriptionStatus.PRO,
              provider: PaymentProvider.RAZORPAY,
            },
            update: {
              planId: (payment.metadata as any).plan,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: SubscriptionStatus.PRO,
              provider: PaymentProvider.RAZORPAY,
            },
          },
        },
      },
    });

    return { success: true };
  }

  async createPayuTransaction(createOrderDto: CreateOrderDto, user: User) {
    const txnid = crypto.randomUUID();
    const amount = createOrderDto.amount.toString();
    const productinfo = `${createOrderDto.plan} Plan`;
    
    // Generate hash
    const hashString = `${this.payuMerchantKey}|${txnid}|${amount}|${productinfo}|${user.name}|${user.email}|||||||||||${this.payuMerchantSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Store transaction details in database
    await this.prisma.payment.create({
      data: {
        providerId: txnid,
        amount: createOrderDto.amount,
        currency: createOrderDto.currency,
        metadata: { plan: createOrderDto.plan },
        provider: PaymentProvider.RAZORPAY,
        status: 'PENDING',
        userId: user.id,
      },
    });

    // Return PayU form data
    return {
      key: this.payuMerchantKey,
      txnid,
      amount,
      productinfo,
      firstname: user.name,
      email: user.email,
      phone: '',
      surl: `${this.configService.get('API_URL')}/payment/payu/callback`,
      furl: `${this.configService.get('API_URL')}/payment/payu/callback`,
      hash,
    };
  }

  async handlePayuCallback(callbackDto: PayuCallbackDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerId: callbackDto.txnid },
      include: { user: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify hash
    const salt = this.configService.get('PAYU_SALT');
    const hashString = `${salt}|${callbackDto.status}|||||||||||||${payment.providerId}|${this.configService.get('PAYU_KEY')}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (generatedHash !== callbackDto.hash) {
      throw new Error('Invalid hash');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: callbackDto.status === 'success' ? 'SUCCESS' : callbackDto.status.toUpperCase(),
        providerId: callbackDto.mihpayid,
      },
    });

    if (callbackDto.status === 'success') {
      // Update user subscription
      await this.prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscription: {
            upsert: {
              create: {
                planId: (payment.metadata as any).plan,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: SubscriptionStatus.PRO,
                provider: PaymentProvider.RAZORPAY,
              },
              update: {
                planId: (payment.metadata as any).plan,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: SubscriptionStatus.PRO,
                provider: PaymentProvider.RAZORPAY,
              },
            },
          },
        },
      });
    }

    return { success: callbackDto.status === 'success' };
  }

  private calculateSubscriptionEndDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
} 