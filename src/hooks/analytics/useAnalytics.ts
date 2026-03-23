import { api } from "@/src/lib/api/apiClient";
import { AnalyticsData } from "@/src/types/Analytics";
import { DateRangeEnum } from "@/src/utiles/enums/dateRangeEnum";
import { dateRanges } from "@/src/utiles/helper/dateRangePresetsHelper";
import { useCallback, useEffect, useState } from "react";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (range: { start: Date; end: Date }) => {
    setLoading(true);

    try {
      const res = await api.post("/wa-accounts/analytics", range);

      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.log("Failed to load analytics", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { start, end } = dateRanges[DateRangeEnum.THIS_MONTH]();
    fetchAnalytics({ start, end });
  }, [fetchAnalytics]);

  return { data, loading, fetchAnalytics };
}
