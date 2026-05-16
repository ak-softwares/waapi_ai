import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { BillingCycle, Currency, FormattedPlan, Plans, PlanTier } from "@/src/types/Plans";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UsePricingOptions {
  defaultCurrency?: Currency;
  defaultBillingCycle?: BillingCycle;
}

export function usePlans({
  defaultCurrency = "INR",
  defaultBillingCycle = "MONTHLY",
}: UsePricingOptions = {}) {
  const [rawPlans, setRawPlans] = useState<Plans | null>(null);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBillingCycle);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get<ApiResponse<Plans>>("/subscription/plans");

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to fetch plans");
      }

      setRawPlans(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const plans = useMemo<FormattedPlan[]>(() => {
    if (!rawPlans) return [];

    return Object.entries(rawPlans).map(([tier, plan]) => {
      const price =
        billingCycle === "MONTHLY"
          ? plan.monthlyPrice?.[currency]
          : plan.yearlyPrice?.[currency] != null
            ? Math.round(plan.yearlyPrice[currency] / 12)
            : undefined;

      return {
        tier: tier as PlanTier,
        ...plan,
        price,
        currency,
        billingCycle,
      };
    });
  }, [rawPlans, currency, billingCycle]);

  return {
    plans,
    rawPlans,
    currency,
    setCurrency,
    billingCycle,
    setBillingCycle,
    loading,
    error,
    refetch: fetchPlans,
  };
}