import { Chat } from "@/src/types/Chat";

type ChatListener = (chat: Chat) => void;

const listeners = new Set<ChatListener>();

export function emitChat(chat: Chat) {
  listeners.forEach((listener) => listener(chat));
}

export function subscribeChat(listener: ChatListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}