import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import SettingsTile from "@/src/components/settings/widgets/SettingsTile";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import Constants from "expo-constants";
import { router } from "expo-router";

import {
  CreditCard,
  Headphones,
  KeyRound,
  LogOut,
  Moon,
  User
} from "lucide-react-native";
import { useState } from "react";
import {
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

  // 🔥 Version (replace with Constants if needed)
  // const APP_VERSION = "1.0.0";
  const APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";
  const BUILD = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || "";

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
          icon={<CreditCard size={22} color={colors.primary} />}
          title="Payment history"
          subtitle="View and manage your payments"
          onPress={() => router.push("/(dashboard)/settings/TransactionHistoryScreen")}
        />

        {/* <SettingsTile
          icon={<Shield size={22} color={colors.primary} />}
          title="Blocked contacts"
          subtitle="Manage who can message you"
          // onPress={() => router.push("/(dashboard)/blocked")}
        /> */}

        <SettingsTile
          icon={<Moon size={22} color={colors.primary} />}
          title="Theme"
          subtitle={`Current: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
          onPress={() => router.push("/(dashboard)/settings/ThemeScreen")}
        />

        <SettingsTile
          icon={<KeyRound size={22} color={colors.primary} />}
          title="API Key"
          subtitle="Generate API key here"
          onPress={() => router.push("/(dashboard)/settings/ApiTokenScreen")}
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
          {BUILD ? ` (${BUILD})` : ""}
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