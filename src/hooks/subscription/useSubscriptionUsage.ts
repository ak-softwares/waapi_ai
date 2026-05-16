import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { SubscriptionUsageResponse } from "@/src/types/SubscriptionUsage";
import { useCallback, useEffect, useState } from "react";

export function useSubscriptionUsage() {
  const [data, setData] = useState<SubscriptionUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionUsage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiResponse<SubscriptionUsageResponse>>("/subscription/usage");
      const body = res.data;

      if (!body.success || !body.data) {
        throw new Error(body.message || "Failed to fetch subscription usage");
      }

      setData(body.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch subscription usage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionUsage();
  }, [fetchSubscriptionUsage]);

  return {
    data,
    loading,
    error,
    refetch: fetchSubscriptionUsage,
  };
}
