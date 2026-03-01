import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { ToolCatalog } from "@/src/types/Tool";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useCallback, useEffect, useState } from "react";

export function useTools() {
  const [tools, setTools] = useState<ToolCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTools = useCallback(async (pageToFetch: number) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get<ApiResponse>("/ai/tools", {
        params: {
          page: pageToFetch,
          per_page: ITEMS_PER_PAGE,
        },
      });

      const json = res.data;

      if (!json.success) {
        showToast({ type: "error", message: json.message || "Failed to fetch tools" });
        if (pageToFetch === 1) setTools([]);
        return;
      }

      const nextTools = json.data?.tools || [];

      setTools((prev) =>
        pageToFetch === 1 ? nextTools : [...prev, ...nextTools]
      );

      const totalPages = json.data?.pagination?.total_pages || 1;
      setHasMore(pageToFetch < totalPages);
    } catch (err: any) {
      showToast({ type: "error", message: err?.message || "Something went wrong" });

      if (pageToFetch === 1) setTools([]);
    } finally {
      if (pageToFetch === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTools(page);
  }, [page, fetchTools]);

  const refresh = () => {
    if (page === 1) {
      fetchTools(1);
    } else {
      setPage(1);
    }
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setPage((prev) => prev + 1);
  };

  return {
    tools,
    setTools,
    loading,
    loadingMore,
    hasMore,
    page,
    loadMore,
    refresh,
  };
}