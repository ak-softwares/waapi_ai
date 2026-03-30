import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import SettingsTile from "@/src/components/settings/widgets/SettingsTile";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import * as Application from "expo-application";
import { router } from "expo-router";

import {
  BarChart3,
  Headphones,
  LogOut,
  MessageCircleMore,
  Settings,
  User,
  Wallet,
  Youtube
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function SettingsScreen() {
  const [showDelete, setShowDelete] = useState(false);
  const { theme, themeMode } = useTheme();
  const { logout } = useAuth();

  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const handleLogout = () => {
    setShowDelete(true);
  };
  const handleYouTube = () => Linking.openURL("https://www.youtube.com/@wa-api-me");
  // 🔥 Version (replace with Constants if needed)
  // const APP_VERSION = "1.0.0";
  const APP_VERSION = Application.nativeApplicationVersion ?? "";
  const BUILD_VERSION = Application.nativeBuildVersion ?? "";

  return (
    <ScrollView style={styles.container}>

      <View style={styles.section}>
        {/* ✅ Profile Tile */}
        <SettingsTile
          icon={<User size={22} color={colors.primary} />}
          title="My Profile"
          subtitle="View and edit your profile"
          onPress={() => router.push("/(dashboard)/profile/profilePage")}
        />
        <SettingsTile
          icon={<MessageCircleMore size={22} color={colors.primary} />}
          title="WhatsApp Setup"
          subtitle="Connect WhatsApp Business account"
          onPress={() => router.push("/(dashboard)/setup/WhatsAppSetupScreen")}
        />
        <SettingsTile
          icon={<BarChart3 size={22} color={colors.primary} />}
          title="Analytics"
          subtitle="Messaging and AI performance"
          onPress={() => router.push("/(dashboard)/analytics/AnalyticsScreen")}
        />
        <SettingsTile
          icon={<Wallet size={22} color={colors.primary} />}
          title="Wallet"
          subtitle="Credits, quota and balance"
          onPress={() => router.push("/(dashboard)/wallet/WalletScreen")}
        />    
        <SettingsTile
          icon={<Youtube size={22} color={colors.primary} />}
          title="YouTube Channel"
          subtitle="Watch app usage guides"
          onPress={handleYouTube}
        />
        <SettingsTile
          icon={<Settings size={22} color={colors.primary} />}
          title="Settings"
          subtitle={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} · Notifications`}
          onPress={() => router.push("/(dashboard)/settings/AppSettingsScreen")}
        />
        <SettingsTile
          icon={<Headphones size={22} color={colors.primary} />}
          title="Help and support"
          subtitle="Call, WhatsApp or Email"
          onPress={() => router.push("/(dashboard)/settings/SupportScreen")}
        />
        <SettingsTile
          icon={<LogOut size={22} color={colors.error} />}
          title="Logout"
          danger
          onPress={handleLogout}
        />
      </View>

      {/* ✅ Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          Version {APP_VERSION}
          {BUILD_VERSION ? ` (${BUILD_VERSION})` : ""}
        </Text>
      </View>
      <ConfirmSheet
        visible={showDelete}
        title="Logout"
        description={"Are you sure you want to logout?"}
        confirmText="Logout"
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          setShowDelete(false);
          await logout();
        }}
        colors={colors}
      />
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: 15,
      paddingVertical: 15,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    section: {
      paddingHorizontal: 10,
      marginTop: 10,
    },

    footer: {
      alignItems: "center",
      paddingVertical: 20,
    },

    versionText: {
      fontSize: 12,
      color: colors.mutedText,
    },
  });