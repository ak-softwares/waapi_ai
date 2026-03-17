import { getUserIdFromToken } from "@/src/lib/auth/getUserIdFromToken";
import { emitChatUpdate } from "@/src/lib/events/chatEvents";
import { emitMessage } from "@/src/lib/events/messageEvents";
import { getPusher } from "@/src/lib/pusher/pusherClient";
import { NotificationPayload } from "@/src/types/Notification";
import { NotificationEventType } from "@/src/utiles/enums/notification";
import { useEffect } from "react";

export function usePusher() {
  useEffect(() => {
    let channel: any;
    let pusher: any;

    const init = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      pusher = getPusher();
      console.log("token123: " + JSON.stringify(pusher, null, 2));

      channel = pusher.subscribe(`user-${userId}`);

      channel.bind(NotificationEventType.NEW_MESSAGE, (data: any) => {

        const payload = data.notificationPayload as NotificationPayload;

        if (payload.chat) emitChatUpdate(payload.chat);
        if (payload.message) emitMessage(payload.message);
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