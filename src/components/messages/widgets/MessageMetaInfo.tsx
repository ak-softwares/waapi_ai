import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ChatType } from "@/src/types/Chat";
import { Message, MessageStatus, MessageType } from "@/src/types/Messages";
import { formatTimeOnly } from "@/src/utiles/formater/formatTime";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

// SVG Icons
import MsgTime from "@/assets/messageMetaIcons/msg-time.svg";
import Check from "@/assets/messageMetaIcons/status-check.svg";
import DoubleCheck from "@/assets/messageMetaIcons/status-dblcheck.svg";
import Warning from "@/assets/messageMetaIcons/warning.svg";

import AiAgentIcon from "@/assets/messageMetaIcons/ai-agent-icon.svg";
import AiIcon from "@/assets/messageMetaIcons/ai-icon.svg";
import BroadcastIcon from "@/assets/messageMetaIcons/broadcast-icon.svg";
import TemplateIcon from "@/assets/messageMetaIcons/template.svg";

import { MESSAGE_TAGS } from "@/src/utiles/enums/messageTags";

interface Props {
  message: Message;
}

export default function MessageMetaInfo({ message }: Props) {

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const size = 16;

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
        return DoubleCheck;

      default:
        return null;
    }
  };

  const StatusIcon = renderStatusIcon();

  const handleFailedPress = () => {
    Alert.alert(
      "Message Failed",
      message?.errorMessage || "Failed to send message."
    );
  };

  return (
    <View style={styles.container}>

      {message.tag === ChatType.BROADCAST && (
        <BroadcastIcon width={size} height={size} fill={colors.secondaryText} />
      )}

      {message.tag === MESSAGE_TAGS.AI_ASSISTANT && (
        <AiIcon width={size} height={size} fill={colors.secondaryText} />
      )}

      {message.tag === MESSAGE_TAGS.AI_AGENT && (
        <AiAgentIcon width={size} height={size} fill={colors.secondaryText} />
      )}

      {isTemplate && (
        <TemplateIcon width={size} height={size} fill={colors.secondaryText} />
      )}

      <Text style={styles.time}>
        {formatTimeOnly(message.createdAt)}
      </Text>

      {StatusIcon &&
        (message.status === MessageStatus.Failed ? (
          <TouchableOpacity onPress={handleFailedPress}>
            <StatusIcon
              width={size}
              height={size}
              fill={colors.warning}
            />
          </TouchableOpacity>
        ) : (
          <StatusIcon
            width={size}
            height={size}
            fill={
              message.status === MessageStatus.Read
                ? colors.blueTik
                : colors.secondaryText
            }
          />
        ))}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },

    time: {
      fontSize: 12,
      color: colors.secondaryText,
      marginHorizontal: 2,
    },
  });