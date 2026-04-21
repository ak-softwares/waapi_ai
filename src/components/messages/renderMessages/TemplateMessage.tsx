import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

import { Template } from "@/src/types/Template";
import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderType,
} from "@/src/utils/enums/template";

import { Message } from "@/src/types/Messages";
import { FormatRichText } from "@/src/utils/formater/formatRichText";
import { showToast } from "@/src/utils/toastHelper/toast";
import MessageMetaInfo from "../widgets/MessageMetaInfo";

// SVG Icons
import CopyIcon from "@/assets/menuIcons/copy.svg";
import LaunchIcon from "@/assets/menuIcons/launch.svg";
import ReplyIcon from "@/assets/menuIcons/reply.svg";
import CallIcon from "@/assets/messageIcons/call.svg";
import { MediaType } from "@/src/utils/enums/mediaTypes";
import MediaRenderer from "./MediaRenderer";

function mapTemplateFormat(format: string): MediaType {
  switch (format) {
    case "IMAGE":
      return MediaType.IMAGE;

    case "VIDEO":
      return MediaType.VIDEO;

    case "DOCUMENT":
      return MediaType.DOCUMENT;

    default:
      return MediaType.IMAGE;
  }
}

interface Props {
  message?: Message;
  template: Template;
}

export default function TemplateMessage({ message, template }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  if (!template?.components) return null;
  return (
    <View style={styles.container}>
      {/* HEADER */}

      {template.components
        .filter((c: any) => c.type === TemplateComponentType.HEADER)
        .map((h: any, idx: number) => {
          if (h.format === "TEXT") {
            const finalText = replaceHeaderVariables(
              h.text ?? "",
              h.example
            );

            return (
              <Text key={idx} style={styles.headerText}>
                {finalText}
              </Text>
            );
          }
          /* BUILD MEDIA DATA */

          const mediaId = h.example?.header_handle?.[0];

          const mediaType = mapTemplateFormat(h.format) ?? MediaType.DOCUMENT;

          const filename = h.format === TemplateHeaderType.DOCUMENT
            ? "document"
            : undefined;
          return (
            <View key={idx} style={styles.headerMedia}>
              <MediaRenderer
                mediaId={mediaId}
                mediaType={mediaType}
                filename={filename}
                mediaUrl={h.example?.header_url}
              />
            </View>
          );
        })}

      {/* BODY */}

      {template.components
        .filter((c: any) => c.type === TemplateComponentType.BODY)
        .map((b: any, idx: number) => {
          const finalText = replaceBodyVariables(b.text, b.example);

          return (
            <FormatRichText key={idx} text={finalText} />
          );
        })}

      {/* FOOTER */}

      <View style={styles.footerRow}>
        <View style={{ flex: 1 }}>
          {template.components
            .filter((c: any) => c.type === TemplateComponentType.FOOTER)
            .map((f: any, idx: number) => (
              <Text key={idx} style={styles.footerText}>
                {f.text}
              </Text>
            ))}
        </View>

        {message && <MessageMetaInfo message={message} />}
      </View>

      {/* BUTTONS */}

      <View style={styles.buttonContainer}>
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.BUTTONS)
          .map((group: any, idx: number) => (
            <View key={idx}>
              {group.buttons.map((btn: any, bIndex: number) =>
                renderButton(btn, template.category, bIndex, styles)
              )}
            </View>
          ))}
      </View>
    </View>
  );
}

/* BUTTON RENDER */

function renderButton(btn: any, category: any, key: number, styles: any) {

  if (
    btn.type === TemplateButtonType.URL &&
    category !== TemplateCategory.AUTHENTICATION
  ) {
    const variable = btn.example?.[0];

    const resolvedUrl = variable
      ? btn.url.replace(/{{\s*1\s*}}/g, variable)
      : btn.url;

    return (
      <Pressable
        key={key}
        style={styles.button}
        onPress={() => Linking.openURL(resolvedUrl)}
      >
        <LaunchIcon width={16} height={16} fill="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  if (btn.type === TemplateButtonType.PHONE_NUMBER) {
    return (
      <Pressable
        key={key}
        style={styles.button}
        onPress={() => Linking.openURL(`tel:${btn.phone_number}`)}
      >
        <CallIcon width={16} height={16} fill="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  if (btn.type === TemplateButtonType.QUICK_REPLY) {
    return (
      <Pressable key={key} style={styles.button}>
        <ReplyIcon width={16} height={16} fill="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  if (
    category === TemplateCategory.AUTHENTICATION ||
    btn.type === TemplateButtonType.COPY_CODE
  ) {
    const otpCode = btn.example?.[0];

    const handleCopy = async () => {
      await Clipboard.setStringAsync(otpCode);
      showToast({ type: "success", message: `Copied ${otpCode}` });
    };

    return (
      <Pressable key={key} style={styles.button} onPress={handleCopy}>
        <CopyIcon width={16} height={16} fill="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  return null;
}

/* VARIABLE REPLACEMENT */

function replaceHeaderVariables(
  text: string,
  example?: { header_text?: string[] }
) {
  if (!text) return text;

  const value = example?.header_text?.[0];
  if (!value) return text;

  return text.replace(/\{\{1\}\}/g, value);
}

function replaceBodyVariables(text: string, example?: any) {
  if (!text) return text;

  const vars = example?.body_text?.[0];
  if (!vars || !Array.isArray(vars)) return text;

  let updated = text;

  vars.forEach((value: string, idx: number) => {
    const pattern = new RegExp(`\\{\\{${idx + 1}\\}\\}`, "g");
    updated = updated.replace(pattern, value);
  });

  return updated;
}

/* STYLES */

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      gap: 4,
      minWidth: 250,
      // marginBottom: 4,
    },

    headerMedia: {
      paddingHorizontal: 4,
      paddingVertical: 2
    },

    headerText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      opacity: 0.9,
      padding: 10,
    },

    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      paddingHorizontal: 10,
    },

    footerText: {
      fontSize: 11,
      opacity: 0.7,
      color: colors.mutedText,
    },

    buttonContainer: {
      marginTop: 6,
    },

    button: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
      gap: 6,
      borderTopWidth: 0.3,
      borderColor: colors.templateBorder,
    },

    buttonText: {
      color: "#21C063",
      fontSize: 14,
      fontWeight: "500",
    },
  });