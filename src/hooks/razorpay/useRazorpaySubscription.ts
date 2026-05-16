import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { BillingCycle, Currency, PlanTier } from "@/src/types/Plans";
import {
  CreatedSubscriptionResponse,
  RazorpaySubscriptionOptionsNative,
} from "@/src/types/RazorpaySubscription-native";
import { useState } from "react";
import RazorpayCheckout from "react-native-razorpay";

interface UseRazorpaySubscriptionParams {
  tier: PlanTier;
  billing: BillingCycle;
  currency: Currency;
  onSuccess?: (data: CreatedSubscriptionResponse) => void;
  onFailure?: (error: string) => void;
}

export function useRazorpaySubscription() {
  const [loading, setLoading] = useState(false);

  const initiateSubscription = async ({
    tier,
    billing,
    currency,
    onSuccess,
    onFailure,
  }: UseRazorpaySubscriptionParams) => {
    setLoading(true);

    try {
      const { data } = await api.post<ApiResponse<CreatedSubscriptionResponse>>(
        "/razorpay/create-subscription",
        { tier, billing, currency }
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Unable to create subscription");
      }

      const subscriptionData = data.data;

      if (tier === "FREE") {
        onSuccess?.(subscriptionData);
        return;
      }

      const options: RazorpaySubscriptionOptionsNative = {
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
        name: "WA API",
        description: `${subscriptionData.tier} ${subscriptionData.billing} subscription`,
        subscription_id: subscriptionData.id,
        prefill: {
          name: subscriptionData.user?.name ?? "User",
          email: subscriptionData.user?.email ?? "customer@example.com",
          contact: subscriptionData.user?.phone ?? "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      await RazorpayCheckout.open(options as any);
      onSuccess?.(subscriptionData);
    } catch (err: any) {
      onFailure?.(err?.description || err?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return { initiateSubscription, loading };
}
