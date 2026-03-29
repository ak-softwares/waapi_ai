import { api } from "@/src/lib/api/apiClient";
import { subscribeChatUpdates } from "@/src/lib/events/chatEvents";
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

  useEffect(() => {
    const unsubscribe = subscribeChatUpdates((incomingChat) => {
      setChats((prev) => {
        const existing = prev.find((c) => c._id === incomingChat._id);

        const updatedChat = existing
          ? { ...existing, ...incomingChat }
          : incomingChat;
        const existingIndex = prev.findIndex((c) => c._id === incomingChat._id);
        const existingLastMessageAt = existing?.lastMessageAt
          ? new Date(existing.lastMessageAt).getTime()
          : 0;
        const incomingLastMessageAt = incomingChat.lastMessageAt
          ? new Date(incomingChat.lastMessageAt).getTime()
          : 0;
        const shouldMoveToTop =
          existingIndex === -1 || incomingLastMessageAt > existingLastMessageAt;

        if (shouldMoveToTop) {
          const filtered = prev.filter((c) => c._id !== incomingChat._id);
          return [updatedChat, ...filtered];
        }

        return prev.map((chat) =>
          chat._id === incomingChat._id ? updatedChat : chat
        );
      });
    });

    return unsubscribe;
  }, []);

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
    if (!chats.length) return;

    if (!loadingMore && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const refreshChats = () => {
    setLoadingMore(false);
    setHasMore(true);

    if (page === 1) {
      fetchChats(1);
      return;
    }

    setPage(1);
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