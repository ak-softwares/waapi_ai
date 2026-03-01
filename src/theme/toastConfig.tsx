import React from "react";
import { StyleSheet } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";
import { useTheme } from "../context/ThemeContext";
import { darkColors, lightColors } from "./colors";

const BaseStyledToast = (props: any, borderColor: string) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <BaseToast
      {...props}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderLeftColor: borderColor,
        },
      ]}
      contentContainerStyle={styles.content}
      text1Style={[styles.text, { color: colors.text }]}
    />
  );
};

const ErrorStyledToast = (props: any) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ErrorToast
      {...props}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderLeftColor: colors.error,
        },
      ]}
      contentContainerStyle={styles.content}
      text1Style={[styles.text, { color: colors.text }]}
      text1NumberOfLines={2}
      text1Props={{
        numberOfLines: 2,
        ellipsizeMode: "tail",
      }}
    />
  );
};

export const toastConfig = {
  success: (props: any) => {
    const { theme } = useTheme();
    const colors = theme === "dark" ? darkColors : lightColors;
    return BaseStyledToast(props, colors.success);
  },

  info: (props: any) => {
    const { theme } = useTheme();
    const colors = theme === "dark" ? darkColors : lightColors;
    return BaseStyledToast(props, colors.info);
  },

  error: (props: any) => <ErrorStyledToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginHorizontal: 16,
    borderLeftWidth: 6,
  },
  content: {
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});