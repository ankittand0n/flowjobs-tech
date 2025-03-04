import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyRazorpayPaymentDto, PayuCallbackDto } from './dto/verify-payment.dto';
import { User } from '../../user/decorators/user.decorator';
import { User as UserType } from '@prisma/client';

@Controller('payment')
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('razorpay/create-order')
  async createRazorpayOrder(@Body() createOrderDto: CreateOrderDto, @User() user: UserType) {
    return this.paymentService.createRazorpayOrder(createOrderDto, user);
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(@Body() verifyDto: VerifyRazorpayPaymentDto) {
    return this.paymentService.verifyRazorpayPayment(verifyDto);
  }

  @Post('payu/create-transaction')
  async createPayuTransaction(@Body() createOrderDto: CreateOrderDto, @User() user: UserType) {
    return this.paymentService.createPayuTransaction(createOrderDto, user);
  }

  @Post('payu/callback')
  async handlePayuCallback(@Body() callbackDto: PayuCallbackDto) {
    return this.paymentService.handlePayuCallback(callbackDto);
  }
} 