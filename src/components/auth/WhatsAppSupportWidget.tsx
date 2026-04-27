import { darkColors, lightColors } from "@/src/theme/colors";
import { FontAwesome } from "@expo/vector-icons";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUPPORT_WHATSAPP_NUMBER = "918077030731";

interface WhatsAppSupportWidgetProps {
  colors: typeof lightColors | typeof darkColors;
  compact?: boolean;
}

export default function WhatsAppSupportWidget({ colors, compact = false }: WhatsAppSupportWidgetProps) {
  const styles = getStyles(colors, compact);

  const handleSupportPress = async () => {
    const message = encodeURIComponent(
      "Hi Support Team, I need help"
    );

    await Linking.openURL(
      `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${message}`
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.linkButton} onPress={handleSupportPress} activeOpacity={0.8}>
        <FontAwesome name="whatsapp" size={16} color={colors.text} />
        <Text style={styles.linkText}>Need help? Chat on WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: typeof lightColors | typeof darkColors, compact: boolean) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    linkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    linkText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
  });
