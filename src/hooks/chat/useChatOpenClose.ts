import { api } from "@/src/lib/api/apiClient";
import { emitChat } from "@/src/lib/events/chatEvents";
import { useState } from "react";

interface UseChatOpenCloseOptions {
  onOpen?: (chatId: string) => void;
  onClose?: (chatId: string) => void;
}

export function useChatOpenClose(options?: UseChatOpenCloseOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const setChatState = async (chatId: string, opened: boolean) => {
    if (!chatId) return;

    setIsLoading(true);

    try {
      await api.patch(`/wa-accounts/chats/${chatId}`, { opened });

      if (opened) {
        // ✅ update UI instantly
        emitChat({
          _id: chatId,
          unreadCount: 0,
        } as any);

        options?.onOpen?.(chatId);
      } else {
        options?.onClose?.(chatId);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openChat: (chatId: string) => setChatState(chatId, true),
    closeChat: (chatId: string) => setChatState(chatId, false),
    isLoading,
  };
}