import { api } from "@/src/lib/api/apiClient";
import { subscribeMessages } from "@/src/lib/events/messageEvents";
import { Message } from "@/src/types/Messages";
import { ITEMS_PER_PAGE } from "@/src/utiles/constans/apiConstans";
import { EventType } from "@/src/utiles/enums/notification";
import { useCallback, useEffect, useState } from "react";
import { useChatOpenClose } from "../chat/useChatOpenClose";

interface Props {
  chatId: string;
}

export function useMessages({ chatId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { openChat, closeChat } = useChatOpenClose();

  // 🔁 realtime messages
  useEffect(() => {
    const unsubscribe = subscribeMessages(({ message, messageId, eventType }) => {
      if (!message && !messageId) return;
      if (message && message.chatId !== chatId) return;

      setMessages((prev) => {
        const id = message?._id || messageId;

        // 🔑 find by BOTH _id OR clientTempId
        const index = prev.findIndex(
          (m) =>
            m._id === id ||
            (message?.clientTempId && m.clientTempId === message.clientTempId)
        );

        // 🆕 NEW MESSAGE
        if (eventType === EventType.NEW_MESSAGE && message) {
          if (index !== -1) {
            // 🔁 REPLACE temp message with real one
            const updated = [...prev];
            updated[index] = {
              ...prev[index],
              ...message,
              clientTempId: undefined, // optional cleanup
            };
            return updated;
          }

          // ➕ ADD if no match
          return [message, ...prev];
        }

        // ❌ DELETE
        if (eventType === EventType.MESSAGE_DELETED && id) {
          return prev.filter((m) => m._id !== id);
        }

        // ✏️ STATUS UPDATE
        if (index !== -1 && message) {
          const updated = [...prev];
          updated[index] = { ...prev[index], ...message };
          return updated;
        }

        return prev;
      });
    });

    return unsubscribe;
  }, [chatId, openChat, closeChat]);

    // ✅ OPEN on mount, CLOSE on unmount
    useEffect(() => {
      if (!chatId) return;

      openChat(chatId);

      return () => {
        closeChat(chatId);
      };
    }, [chatId]);

  const fetchMessages = useCallback(async (pageToFetch: number) => {
    if (!chatId) return;

    if (pageToFetch === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get("/wa-accounts/messages", {
        params: {
          chatId: chatId,
          page: pageToFetch,
          per_page: ITEMS_PER_PAGE,
        },
      });

      const json = res.data;

      if (json.success && Array.isArray(json.data)) {
        setMessages((prev) =>
          pageToFetch === 1 ? json.data : [...prev, ...json.data]
        );
        setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.log("Fetch error", e);
    } finally {
      if (pageToFetch === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [chatId]);
 
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMessages([]);
    fetchMessages(1);
  }, [fetchMessages]);

  useEffect(() => {
    if (page === 1) return;
    fetchMessages(page);
  }, [fetchMessages, page]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  };
}