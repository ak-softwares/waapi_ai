import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ChatType } from "@/src/types/Chat";
import { Message, MessageStatus, MessageType } from "@/src/types/Messages";
import { formatTimeOnly } from "@/src/utiles/formatTime/formatTime";

// SVG Icons
import MsgTime from "@/assets/messageMetaIcons/msg-time.svg";
import Check from "@/assets/messageMetaIcons/status-check.svg";
import DoubleCheckRead from "@/assets/messageMetaIcons/status-dblcheck-1.svg";
import DoubleCheck from "@/assets/messageMetaIcons/status-dblcheck.svg";
import Warning from "@/assets/messageMetaIcons/warning.svg";

import AiAgentIcon from "@/assets/messageMetaIcons/ai-agent-icon.svg";
import AiIcon from "@/assets/messageMetaIcons/ai-icon.svg";
import BroadcastIcon from "@/assets/messageMetaIcons/broadcast-icon.svg";
import TemplateIcon from "@/assets/messageMetaIcons/template.svg";

interface Props {
  message: Message;
}

export default function MessageMetaInfo({ message }: Props) {
  const isTemplate =
    !!message?.template || message?.type === MessageType.TEMPLATE;

  const renderStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.Pending:
        return MsgTime;

      case MessageStatus.Failed:
        return Warning;

      case MessageStatus.Sent:
        return Check;

      case MessageStatus.Delivered:
        return DoubleCheck;

      case MessageStatus.Read:
        return DoubleCheckRead;

      default:
        return null;
    }
  };

  const StatusIcon = renderStatusIcon();

  return (
    <View style={styles.container}>
      {/* Tag Icons */}

      {message.tag === ChatType.BROADCAST && (
        <BroadcastIcon {...styles.icon} />
      )}

      {message.tag === "aichat" && <AiIcon {...styles.icon} />}

      {message.tag === "aiagent" && <AiAgentIcon {...styles.icon} />}

      {isTemplate && <TemplateIcon {...styles.icon} />}

      {/* Time */}
      <Text style={styles.time}>
        {formatTimeOnly(message.createdAt)}
      </Text>

      {/* Status */}
      {StatusIcon && (
        <StatusIcon
          width={14}
          height={14}
          color={
            message.status === MessageStatus.Read
              ? "#34B7F1"
              : "#a0af9c"
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  icon: {
    width: 14,
    height: 14,
    color: "#a0af9c",
  },

  time: {
    fontSize: 11,
    color: "#999",
    marginHorizontal: 2,
  },
});