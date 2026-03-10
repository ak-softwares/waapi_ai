import { api } from "@/src/lib/api/apiClient";
import { Chat, ChatFilterType } from "@/src/types/Chat";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { useCallback, useEffect, useState } from "react";

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [totalChats, setTotalChats] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChatFilterType>("all");


  const fetchChats = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
         const res = await api.get("/wa-accounts/chats", {
          params: {
            q: query,
            page: pageToFetch,
            per_page: ITEMS_PER_PAGE,
            filter,
          },
        });

        const json = res.data;

        if (json.success && Array.isArray(json.data)) {
          setChats(prev =>
            pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );

          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
          setTotalChats(json.pagination?.total || 0);

        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("Failed to fetch chats", error);
      } finally {
        if (pageToFetch === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [query, filter]
  );

  useEffect(() => {
    fetchChats(page);
  }, [fetchChats, page]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refreshChats = () => {
    setPage(1);
    setChats([]);
    setHasMore(true);
  };

  const searchChats = (text: string) => {
    setQuery(text);
    setPage(1);
    setChats([]);
  };

  const applyFilter = (nextFilter: ChatFilterType) => {
    setFilter(nextFilter);
    setPage(1);
    setChats([]);
  };

  return {
    chats,
    totalChats,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refreshChats,
    searchChats,
    filter,
    setFilter: applyFilter,
    setChats,
  };
}