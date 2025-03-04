import { t } from "@lingui/macro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui";
import { motion } from "framer-motion";

import { PaymentButton } from "@/client/components/payment/PaymentButton";

export const PaymentSettings = () => {
  const handlePaymentSuccess = (response: any) => {
    // Handle successful payment
    console.log("Payment successful:", response);
  };

  const handlePaymentError = (error: any) => {
    // Handle payment error
    console.error("Payment failed:", error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t`Subscription & Billing`}</CardTitle>
          <CardDescription>
            {t`Manage your subscription and payment settings`}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>{t`Basic Plan`}</CardTitle>
                  <CardDescription>
                    ₹499/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>{t`Access to basic features`}</li>
                    <li>{t`Limited job applications`}</li>
                    <li>{t`Standard resume templates`}</li>
                  </ul>
                  <PaymentButton
                    plan="BASIC"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>{t`Pro Plan`}</CardTitle>
                  <CardDescription>
                    ₹999/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>{t`Access to all premium features`}</li>
                    <li>{t`Unlimited job applications`}</li>
                    <li>{t`All premium resume templates`}</li>
                    <li>{t`Priority support`}</li>
                  </ul>
                  <PaymentButton
                    plan="PRO"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t`Payment History`}</CardTitle>
                <CardDescription>
                  {t`View your payment and billing history`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t`No payment history available.`}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 