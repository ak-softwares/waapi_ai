// useMessages.ts
import { api } from "@/src/lib/api/apiClient";
import { sendMessage } from "@/src/services/messages/sendMessage";
import { Message, MessagePayload, MessageStatus } from "@/src/types/Messages";
import { useEffect, useState } from "react";

interface Props {
  chatId: string;
}

export function useMessages({ chatId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    if (!chatId) return;

    setLoading(true);

    try {
      const res = await api.get("/wa-accounts/messages", {
        params: {
          chatId: chatId,
        },
      });

      const json = res.data;

      if (json.success) {
        setMessages(json.data);
      }
    } catch (e) {
      console.log("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  const onSend = async ({ messagePayload }: {messagePayload: MessagePayload}) => {
    const tempId = Date.now().toString();

    const tempMessage: Message = {
      _id: tempId,
      userId: "sdfsd54sd",
      message: messagePayload.message,
      chatId,
      from: "me",
      to: "354355",
      status: MessageStatus.Pending,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      const realMessage = await sendMessage({ messagePayload });

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? realMessage : m))
      );
    } catch (err) {
      // setMessages((prev) =>
      //   prev.map((m) =>
      //     m._id === tempId ? { ...m, status: "failed" } : m
      //   )
      // );
    }
  };

  return {
    messages,
    setMessages,
    onSend,
    loading,
  };
}