import React from "react";
import { StyleSheet, View } from "react-native";
import MediaRenderer from "./MediaRenderer";

import { Message } from "@/src/types/Messages";
import { MediaType } from "@/src/utiles/enums/mediaTypes";

interface Props {
  message: Message;
}

export default function MediaMessage({ message }: Props) {
  return (
    <View style={styles.container}>
      <MediaRenderer
        mediaId={message.media?.id}
        mediaType={message.media?.mediaType ?? MediaType.DOCUMENT}
        filename={message.media?.filename}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: "100%",
    minWidth: 250,
    flex: 1,
  },
});