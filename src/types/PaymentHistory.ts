import { BillingCycle, Currency, PlanTier } from "@/src/types/Plans";

export enum PaymentStatus {
  AUTHENTICATED = "authenticated",
  PENDING = "pending",
  ACTIVE = "active",
  HALTED = "halted",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  FAILED = "failed",
  PAID = "paid",
}

export type PaymentHistory = {
  _id?: string;
  userId: string;
  subscriptionId: string;
  planId: string;
  tier: PlanTier;
  billing: BillingCycle;
  currency: Currency;
  totalCount: number;
  quantity: number;
  price: number;
  status: PaymentStatus;
  shortUrl?: string;
  createdAt?: string;
};
