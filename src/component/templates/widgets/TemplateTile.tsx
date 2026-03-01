import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Template } from "@/src/types/Template";
import { FileText } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Props = {
  template: Template;
  onPress: () => void;
};

export default function TemplateTile({ template, onPress }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const getStatusColor = () => {
    switch (template.status) {
      case "APPROVED":
        return colors.success;
      case "PENDING":
        return colors.warning;
      case "REJECTED":
        return colors.error;
      default:
        return colors.mutedText;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Icon */}
      <View style={styles.icon}>
        <FileText size={22} color={colors.mutedText} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {template.name}
          </Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor() + "22" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getStatusColor() },
              ]}
            >
              {template.status}
            </Text>
          </View>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {template.category} • Header: TEXT
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
    },

    icon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    content: {
      flex: 1,
      justifyContent: "center",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    name: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },

    meta: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 2,
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },

    badgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
  });