import { api } from "@/src/lib/api/apiClient";
import { Template } from "@/src/types/Template";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { useCallback, useEffect, useState } from "react";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [query, setQuery] = useState("");

  // -----------------------------
  // FETCH
  // -----------------------------
  const fetchTemplates = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.get("/wa-accounts/templates", {
          params: {
            q: query,
            page: pageToFetch,
            per_page: ITEMS_PER_PAGE,
          },
        });

        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          setTemplates((prev) =>
            pageToFetch === 1
              ? json.data
              : [...prev, ...json.data]
          );

          setHasMore(
            pageToFetch < (json.pagination?.totalPages || 1)
          );

          setTotalTemplates(
            json.pagination?.total || 0
          );
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("Failed to fetch templates", error);
      } finally {
        pageToFetch === 1
          ? setLoading(false)
          : setLoadingMore(false);
      }
    },
    [query]
  );

  // -----------------------------
  // EFFECT
  // -----------------------------
  useEffect(() => {
    fetchTemplates(page);
  }, [page, query]);

  // -----------------------------
  // LOAD MORE
  // -----------------------------
  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  // -----------------------------
  // REFRESH
  // -----------------------------
  const refreshTemplates = () => {
    setTemplates([]);
    setHasMore(true);

    if (page === 1) {
      fetchTemplates(1);
      return;
    }

    setPage(1);
  };

  // -----------------------------
  // SEARCH
  // -----------------------------
  const searchTemplates = (text: string) => {
    setQuery(text);
    setPage(1);
    setTemplates([]);
  };

  return {
    templates,
    totalTemplates,

    loading,
    loadingMore,
    hasMore,

    loadMore,
    refreshTemplates,
    searchTemplates,

    setTemplates, // optional (like chats)
  };
}