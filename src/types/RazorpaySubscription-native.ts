import { BillingCycle, Currency, PlanTier } from "./Plans";

export type CreatedSubscriptionResponse = {
  id: string;
  tier: PlanTier;
  billing: BillingCycle;
  currency: Currency;
  user: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export type RazorpaySubscriptionOptionsNative = {
  key: string;
  name: string;
  description: string;
  subscription_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};
