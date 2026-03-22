import { getUserIdFromToken } from "@/src/lib/auth/getUserIdFromToken";
import { emitChatUpdate } from "@/src/lib/events/chatEvents";
import { emitMessage } from "@/src/lib/events/messageEvents";
import { getPusher } from "@/src/lib/pusher/pusherClient";
import { NotificationPayload } from "@/src/types/Notification";
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
          const payload = data.eventPayload as NotificationPayload;

          if (payload?.chat) emitChatUpdate(payload.chat);
          // ✅ Message events
          if (payload?.eventType) {
            // console.log("EventType: ", JSON.stringify(payload.eventType, null, 2))
            // console.log("Message: ", JSON.stringify(payload.message, null, 2))
            emitMessage({
              eventType: payload.eventType,
              message: payload.message,
              messageId: payload.message?._id,
            });
          }
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