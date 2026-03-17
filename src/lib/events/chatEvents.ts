import { Chat } from "@/src/types/Chat";

type ChatUpdateListener = (chat: Chat) => void;

const listeners = new Set<ChatUpdateListener>();

export function emitChatUpdate(chat: Chat) {
  listeners.forEach((listener) => listener(chat));
}

export function subscribeChatUpdates(listener: ChatUpdateListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}