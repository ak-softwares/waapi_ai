// components/chat/TemplateMessage.tsx

import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { Template } from "@/src/types/Template";
import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
} from "@/src/utiles/enums/template";

import { Message } from "@/src/types/Messages";
import { FormatRichText } from "@/src/utiles/formatText/formatRichText";
import { showToast } from "@/src/utiles/toastHelper/toast";
import MessageMetaInfo from "../widgets/MessageMetaInfo";
import TemplateMediaPreview from "./TemplateMediaPreview";

// SVG Icons
import CopyIcon from "@/assets/menuIcons/copy.svg";
import CallIcon from "@/assets/messageIcons/call.svg";
import LaunchIcon from "@/assets/messageIcons/launch.svg";
import ReplyIcon from "@/assets/messageIcons/reply.svg";

interface Props {
  message?: Message;
  template: Template;
}

export default function TemplateMessage({ message, template }: Props) {
  if (!template?.components) return null;

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}

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

          return (
            <View key={idx}>
              <TemplateMediaPreview h={h} />
            </View>
          );
        })}

      {/* ---------- BODY ---------- */}

      {template.components
        .filter((c: any) => c.type === TemplateComponentType.BODY)
        .map((b: any, idx: number) => {
          const finalText = replaceBodyVariables(b.text, b.example);

          return (
            <FormatRichText key={idx} text={finalText} />
          );
        })}

      {/* ---------- FOOTER + META ---------- */}

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

      {/* ---------- BUTTONS ---------- */}

      <View style={styles.buttonContainer}>
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.BUTTONS)
          .map((group: any, idx: number) => (
            <View key={idx}>
              {group.buttons.map((btn: any, bIndex: number) =>
                renderButton(btn, template.category, bIndex)
              )}
            </View>
          ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------
   BUTTON RENDER
------------------------------------------------ */

function renderButton(btn: any, category: any, key: number) {
  /* ---------- URL ---------- */

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
        <LaunchIcon width={16} height={16} color="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  /* ---------- PHONE ---------- */

  if (btn.type === TemplateButtonType.PHONE_NUMBER) {
    return (
      <Pressable
        key={key}
        style={styles.button}
        onPress={() => Linking.openURL(`tel:${btn.phone_number}`)}
      >
        <CallIcon width={16} height={16} color="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  /* ---------- QUICK REPLY ---------- */

  if (btn.type === TemplateButtonType.QUICK_REPLY) {
    return (
      <Pressable key={key} style={styles.button}>
        <ReplyIcon width={16} height={16} color="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  /* ---------- COPY CODE / AUTH ---------- */

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
        <CopyIcon width={16} height={16} color="#21C063" />
        <Text style={styles.buttonText}>{btn.text}</Text>
      </Pressable>
    );
  }

  return null;
}

/* ------------------------------------------------
   VARIABLE REPLACEMENT
------------------------------------------------ */

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

/* ------------------------------------------------
   STYLES
------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    gap: 4,
    minWidth: 200,
    marginBottom: 4,
  },

  headerText: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  footerText: {
    fontSize: 11,
    opacity: 0.7,
    color: "#777",
  },

  buttonContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    gap: 6,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  buttonText: {
    color: "#21C063",
    fontSize: 14,
    fontWeight: "500",
  },

  icon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
});