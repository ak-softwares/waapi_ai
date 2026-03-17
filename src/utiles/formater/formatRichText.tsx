// utils/formatRichText.tsx

import React from "react";
import { Linking, StyleSheet, Text } from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

interface Props {
  text?: string;
}

export const FormatRichText = ({ text = "" }: Props) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const parts = parseText(text);

  return (
    <Text style={styles.base}>
      {parts.map((part, index) => {
        if (part.type === "url") {
          return (
            <Text
              key={index}
              style={styles.link}
              onPress={() => Linking.openURL(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "phone") {
          return (
            <Text
              key={index}
              style={styles.phone}
              onPress={() => Linking.openURL(`tel:${part.clean}`)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "email") {
          return (
            <Text
              key={index}
              style={styles.link}
              onPress={() => Linking.openURL(`mailto:${part.value}`)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "bold") {
          return (
            <Text key={index} style={styles.bold}>
              {part.value}
            </Text>
          );
        }

        return (
          <Text key={index} style={styles.base}>
            {part.value}
          </Text>
        );
      })}
    </Text>
  );
};



/* ---------- PARSER ---------- */

type Part =
  | { type: "text"; value: string }
  | { type: "url"; value: string }
  | { type: "phone"; value: string; clean: string }
  | { type: "email"; value: string }
  | { type: "bold"; value: string };

function parseText(input: string): Part[] {
  const regex =
    /(https?:\/\/[^\s]+)|(\+?\d[\d\s-]{8,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\*[^*]+\*)/g;

  const parts: Part[] = [];

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: input.slice(lastIndex, match.index),
      });
    }

    const value = match[0];

    if (match[1]) {
      parts.push({ type: "url", value });
    } else if (match[2]) {
      parts.push({
        type: "phone",
        value,
        clean: value.replace(/\D/g, ""),
      });
    } else if (match[3]) {
      parts.push({ type: "email", value });
    } else if (match[4]) {
      parts.push({
        type: "bold",
        value: value.replace(/\*/g, ""),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({
      type: "text",
      value: input.slice(lastIndex),
    });
  }

  return parts;
}



/* ---------- STYLES ---------- */

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    base: {
      paddingTop: 10,
      paddingHorizontal: 10,
      fontSize: 15,
      color: colors.text,
      flexWrap: "wrap",
    },

    link: {
      color: colors.messageLink,
    },

    phone: {
      color: colors.messageLink,
      fontWeight: "600",
    },

    bold: {
      fontWeight: "bold",
      color: colors.text,
    },
  });