import { api } from "@/src/lib/api/apiClient";
import { Contact } from "@/src/types/Contact";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useCallback, useEffect, useState } from "react";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");

  const fetchContacts = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await api.get("/wa-accounts/contacts", {
          params: {
            q: query,
            page: pageToFetch,
            per_page: ITEMS_PER_PAGE,
          },
        });

        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          setContacts((prev) =>
            pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
          setTotalContacts(json.pagination?.total || 0);
        } else {
          setContacts([]);
          setHasMore(false);
        }
      } catch {
        showToast({ type: "error", message: "Failed to load contacts." });
      } finally {
        if (pageToFetch === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [query]
  );

  useEffect(() => {
    fetchContacts(page);
  }, [fetchContacts, page]);

  const refreshContacts = () => {
    setPage(1);
    setHasMore(true);
    setContacts([]);
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const searchContacts = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
    setHasMore(true);
    setContacts([]);
  };

  return {
    contacts,
    setContacts,
    totalContacts,
    loading,
    loadingMore,
    hasMore,
    refreshContacts,
    loadMore,
    searchContacts,
  };
}
