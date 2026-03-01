import SettingsTile from "@/src/component/settings/widgets/SettingsTile";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Stack } from "expo-router";
import { Mail, MessageCircle, Phone } from "lucide-react-native";
import { Linking, StyleSheet, Text, View } from "react-native";

export default function SupportScreen() {
  const { theme } = useTheme();

  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const PHONE = "+918077030731";
  const WHATSAPP = "918077030731";
  const EMAIL = "support@wa-api.me";

  const handleCall = () => Linking.openURL(`tel:${PHONE}`);
  const handleWhatsApp = () => Linking.openURL(`https://wa.me/${WHATSAPP}`);
  const handleEmail = () => Linking.openURL(`mailto:${EMAIL}`);

  return (
    <>
      {/* ✅ Header */}
      <Stack.Screen
        options={{
          title: "Help & Support",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Need help? Contact us using any method below.
        </Text>

        <View style={styles.section}>
          <SettingsTile
            icon={<Phone size={22} color={colors.primary} />}
            title="Call Us"
            subtitle={PHONE}
            onPress={handleCall}
          />

          <SettingsTile
            icon={<MessageCircle size={22} color={colors.primary} />}
            title="WhatsApp"
            subtitle="+91 80770 30731"
            onPress={handleWhatsApp}
          />

          <SettingsTile
            icon={<Mail size={22} color={colors.primary} />}
            title="Email"
            subtitle={EMAIL}
            onPress={handleEmail}
          />
        </View>
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    subtitle: {
      fontSize: 14,
      color: colors.mutedText,
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 5,
    },

    section: {
      paddingHorizontal: 10,
      marginTop: 10,
    },
  });