import Pusher from "pusher-js";

let pusher: Pusher | null = null;

export function getPusher() {
  if (!pusher) {

    pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
      enabledTransports: ["ws", "wss"], // IMPORTANT
    });

  }

  return pusher;
}