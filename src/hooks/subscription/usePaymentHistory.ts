import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { PaymentHistory, PaymentStatus } from "@/src/types/PaymentHistory";
import { ITEMS_PER_PAGE } from "@/src/utils/constans/apiConstans";
import { useCallback, useEffect, useState } from "react";

export function usePaymentHistory() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<PaymentStatus | "">("");

  const fetchPaymentHistory = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await api.get<ApiResponse<PaymentHistory[]>>(
          "/subscription/payment-history",
          {
            params: {
              page: pageToFetch,
              per_page: ITEMS_PER_PAGE,
              status: status || undefined,
            },
          }
        );

        if (data.success && Array.isArray(data.data)) {
          setPaymentHistory((prev) =>
            pageToFetch === 1 ? data.data! : [...prev, ...data.data!]
          );
          setHasMore(pageToFetch < (data.pagination?.totalPages || 1));
          setTotalRecords(data.pagination?.total || 0);
        } else {
          setPaymentHistory([]);
          setHasMore(false);
          setTotalRecords(0);
        }
      } catch {
        if (pageToFetch === 1) setPaymentHistory([]);
        setHasMore(false);
      } finally {
        if (pageToFetch === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [status]
  );

  useEffect(() => {
    fetchPaymentHistory(page);
  }, [page, status, fetchPaymentHistory]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const refreshPaymentHistory = () => {
    setPaymentHistory([]);
    setHasMore(true);
    setPage(1);
    fetchPaymentHistory(1);
  };

  const filterByStatus = (nextStatus: PaymentStatus | "") => {
    setStatus(nextStatus);
    setPaymentHistory([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    paymentHistory,
    loading,
    loadingMore,
    hasMore,
    totalRecords,
    status,
    loadMore,
    refreshPaymentHistory,
    filterByStatus,
  };
}
