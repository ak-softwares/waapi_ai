import { api } from "@/src/lib/api/apiClient";
import { WalletTransaction, WalletTransactionType } from "@/src/types/WalletTransaction";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { useCallback, useEffect, useState } from "react";

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [type, setType] = useState<WalletTransactionType | "">("");

  const fetchTransactions = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.get("/wallet/transactions", {
          params: {
            page: pageToFetch,
            per_page: ITEMS_PER_PAGE,
            type,
          },
        });

        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          setTransactions((prev) =>
            pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );

          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
          setTotalTransactions(json.pagination?.total || 0);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("Failed to fetch transactions", error);
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [type]
  );

  useEffect(() => {
    fetchTransactions(page);
  }, [page, type, fetchTransactions]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const refreshTransactions = () => {
    setPage(1);
    setTransactions([]);
    setHasMore(true);
  };

  const filterByType = (newType: WalletTransactionType | "") => {
    setType(newType);
    setPage(1);
    setTransactions([]);
    setHasMore(true);
  };

  return {
    transactions,
    totalTransactions,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refreshTransactions,
    filterByType,
    type,
    setType,
    setTransactions,
  };
}