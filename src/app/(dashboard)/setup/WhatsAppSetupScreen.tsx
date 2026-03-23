import { useTheme } from "@/src/context/ThemeContext";
import { useWhatsAppSignup } from "@/src/hooks/setup/useWhatsAppSignup";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Stack } from "expo-router";
import { RefreshCcw } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WhatsAppSetupScreen() {

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    launchWhatsAppSignup,
    refreshStatus,
    facebookConnected,
    isLoading,
    isSaving,
  } = useWhatsAppSignup();

  const busy = isLoading || isSaving;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Connect WhatsApp",
          headerRight: () => (
            <View style= {{ paddingRight: 10}}>
              <TouchableOpacity onPress={refreshStatus}>
                <RefreshCcw
                  size={22}
                  color={colors.headerIcon}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Connect WhatsApp</Text>
        <Text style={styles.subtitle}>Connect your WhatsApp Business account via Meta</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you&apos;ll connect</Text>
          <Text style={styles.item}>• WhatsApp Business Account</Text>
          <Text style={styles.item}>• Phone Number</Text>
          <Text style={styles.item}>• Messaging Permissions</Text>
        </View>

        <TouchableOpacity
          style={[styles.fbButton, busy && styles.disabledButton]}
          onPress={launchWhatsAppSignup}
          disabled={busy}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.fbText}>Continue with Facebook</Text>
          )}
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.dot,
              { backgroundColor: facebookConnected ? "#25D366" : "#8f99a3" },
            ]}
          />
          <Text style={styles.statusText}>{facebookConnected ? "Connected" : "Not connected"}</Text>
        </View>

        <Text style={styles.footer}>
          You&apos;ll be redirected to Meta to securely connect your account.
        </Text>
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      justifyContent: "center",
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      letterSpacing: 0.3,
    },

    subtitle: {
      fontSize: 14,
      color: colors.secondaryText, // ✅ FIXED (better than lighterText)
      textAlign: "center",
      marginBottom: 30,
      marginTop: 8,
      lineHeight: 20,
    },

    card: {
      backgroundColor: colors.surface,
      borderWidth: 1, // ✅ add border for depth
      borderColor: colors.border,
      padding: 16,
      borderRadius: 14,
      marginBottom: 22,
    },

    cardTitle: {
      color: colors.text, // ✅ stronger contrast
      fontWeight: "600",
      marginBottom: 12,
      fontSize: 15,
    },

    item: {
      color: colors.mutedText, // ✅ remove opacity hack
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 20,
    },

    fbButton: {
      backgroundColor: "#1877F2", // keep brand color 👍
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      minHeight: 52,
      justifyContent: "center",

      // ✅ depth
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },

    fbText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
      letterSpacing: 0.3,
    },

    statusContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 22,
      alignItems: "center",
    },

    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },

    statusText: {
      color: colors.secondaryText, // ✅ better readability
      fontSize: 14,
    },

    statusIcon: {
      marginLeft: 6,
    },

    footer: {
      textAlign: "center",
      color: colors.lighterText,
      marginTop: 32,
      fontSize: 12,
      lineHeight: 18,
      paddingHorizontal: 10,
    },

    disabledButton: {
      opacity: 0.5, // ✅ slightly more disabled feel
    },
  });
