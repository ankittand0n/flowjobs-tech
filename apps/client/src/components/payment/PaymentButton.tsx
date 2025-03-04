import { useState } from 'react';
import { Button } from '@reactive-resume/ui';
import { axios } from '@/client/libs/axios';

type Plan = 'BASIC' | 'PRO';

interface PaymentButtonProps {
  plan: Plan;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const PaymentButton = ({
  plan,
  onSuccess = () => {},
  onError = () => {},
}: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.body.appendChild(script);
      });

      // Create order
      const response = await axios.post('/payment/razorpay/create-order', {
        plan,
        amount: plan === 'BASIC' ? 499 : 999,
        currency: 'INR'
      });

      const { orderId, amount, currency, keyId } = response.data;

      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Flow Jobs',
        description: `${plan} Plan Subscription`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post('/payment/razorpay/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              onSuccess(response);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError(error);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: {
          color: '#0066FF',
        },
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </Button>
  );
}; 