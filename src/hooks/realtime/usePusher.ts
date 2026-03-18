import { getUserIdFromToken } from "@/src/lib/auth/getUserIdFromToken";
import { emitChatUpdate } from "@/src/lib/events/chatEvents";
import { emitMessage } from "@/src/lib/events/messageEvents";
import { getPusher } from "@/src/lib/pusher/pusherClient";
import { PusherEvent } from "@/src/utiles/enums/notification";
import { useEffect } from "react";

export function usePusher() {
  useEffect(() => {
    let channel: any;
    let pusher: any;

    const init = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      const channelName = `user-${userId}`;

      pusher = getPusher();
      channel = pusher.subscribe(channelName);

      channel.bind("pusher:subscription_succeeded", () => {
        channel.bind(PusherEvent.USER_EVENT, (data: any) => {
          const payload = data.notificationPayload;

          if (payload?.chat) emitChatUpdate(payload.chat);
          if (payload?.message) emitMessage(payload.message);
        });
      });

    };

    init();

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, []);
}