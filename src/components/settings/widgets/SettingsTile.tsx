import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Props = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
};

export default function SettingsTile({
  icon,
  title,
  subtitle,
  onPress,
  onLongPress,
  danger,
  rightElement,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      {icon && <View style={styles.icon}>{icon}</View>}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            danger && { color: colors.error },
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement && (
        <View style={styles.right}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    icon: {
      width: 42,
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      flex: 1,
      marginLeft: 8,
    },

    title: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    subtitle: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },

    right: {
      marginLeft: 8,
    },
  });