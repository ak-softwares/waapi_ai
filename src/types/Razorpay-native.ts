export interface CreatedOrderResponse {
  id: string;
  currency: string;
  amount: number;
  user?: {
    name: string;
    email: string;
    phone: string;
  }
};

export interface RazorpayInstance {
  open(): void;
  on(
    event: 'payment.failed',
    handler: (response: {
      error: {
        description: string;
      };
    }) => void
  ): void;
}

export interface RazorpayOptionsNative {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  theme?: {
    color?: string;
  };

  notes?: Record<string, string>;
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: number;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: any;
}