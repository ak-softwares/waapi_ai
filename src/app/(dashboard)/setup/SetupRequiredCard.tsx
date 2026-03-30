import { lightColors } from "@/src/theme/colors";
import { AlertCircle, Info } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  colors: typeof lightColors;
  onConnect: () => void;
  isLoading?: boolean;
};

export default function SetupRequiredCard({ colors, onConnect, isLoading }: Props) {
  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <AlertCircle size={18} color="#CA8A04" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Connect WhatsApp</Text>
          <Text style={styles.subtitle}>
            Setup your WhatsApp Cloud API to start messaging
          </Text>
        </View>
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        <Text style={styles.step}>• Connect your WhatsApp account</Text>
        <Text style={styles.step}>• Login with Facebook</Text>
        <Text style={styles.step}>• Select business & phone number</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Info size={14} color={colors.secondaryText} />
        <Text style={styles.infoText}>
          Takes less than 2 minutes. No coding required.
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
          onPress={onConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Connect Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 14,
    },

    header: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },

    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor:
        colors.background === "#ffffff"
          ? "#FEF3C7"
          : "rgba(234,179,8,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },

    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },

    subtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 2,
    },

    steps: {
      gap: 6,
      paddingLeft: 4,
    },

    step: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.8,
    },

    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: colors.border,
    },

    infoText: {
      fontSize: 12,
      color: colors.secondaryText,
      flex: 1,
    },

    actions: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },

    primaryButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },

    primaryButtonText: {
      color: colors.onPrimary,
      fontWeight: "600",
      fontSize: 14,
    },

    secondaryButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });