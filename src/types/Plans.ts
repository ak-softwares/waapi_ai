export type Currency = "INR" | "USD";

export type BillingCycle = "MONTHLY" | "YEARLY";

export type PlanTier = "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE";

export type PlanPrice = Record<Currency, number>;

export type PlanConfig = {
  name: string;
  messagesPerMonth: number;
  monthlyPrice: PlanPrice | null;
  yearlyPrice: PlanPrice | null;
  features: string[];
  description: string;
  cta: string;
  highlighted: boolean;
  badge: string | null;
};

export type Plans = Record<PlanTier, PlanConfig>;

export type FormattedPlan = PlanConfig & {
  tier: PlanTier;
  price?: number;
  currency: Currency;
  billingCycle: BillingCycle;
};
