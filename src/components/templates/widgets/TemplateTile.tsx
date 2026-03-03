import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Template, TemplateComponentCreate, TemplateHeaderComponentCreate } from "@/src/types/Template";
import { FileText } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  const statusColor = getStatusColor();

  const getHeaderFormat = () => {
    const headerComponent = template?.components?.find(
      (c: TemplateComponentCreate) => c.type === "HEADER"
    ) as TemplateHeaderComponentCreate | undefined;

    return headerComponent?.format || "TEXT";
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Left Icon */}
      <View style={styles.icon}>
        <FileText size={20} color={colors.primary} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Row */}
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {template.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {template.status}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>
              {template.category}
            </Text>
          </View>

          <Text style={styles.metaText}>
            Header: {getHeaderFormat()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      marginHorizontal: 14,
      marginVertical: 2,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,

      shadowRadius: 8,
    },

    icon: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.background,
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
      alignItems: "center",
      marginBottom: 6,
    },

    name: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginRight: 8,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },

    statusText: {
      fontSize: 11,
      fontWeight: "600",
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    categoryChip: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },

    categoryText: {
      fontSize: 11,
      color: colors.mutedText,
      fontWeight: "500",
    },

    metaText: {
      fontSize: 12,
      color: colors.mutedText,
    },
  });