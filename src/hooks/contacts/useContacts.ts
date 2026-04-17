import { api } from "@/src/lib/api/apiClient";
import { Contact } from "@/src/types/Contact";
import { ITEMS_PER_PAGE } from "@/src/utils/constans/apiConstans";
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
        setHasMore(false);
        setTotalContacts(0);
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
    setLoadingMore(false);
    setHasMore(true);

    if (page === 1) {
      fetchContacts(1);
      return;
    }

    setPage(1);
  };

  const loadMore = () => {
    if (!contacts.length) return;

    if (!loadingMore && hasMore && !loading) {
      setPage(prev => prev + 1);
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
