import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FloatingButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function FloatingButton({
  icon = "chatbubble-ellipses",
  onPress,
}: FloatingButtonProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });