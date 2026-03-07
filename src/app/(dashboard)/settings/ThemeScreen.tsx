import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Stack } from "expo-router";
import { Check, Monitor, Moon, Sun } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const options = [
  {
    key: "system",
    label: "System",
    description: "Follow your device setting",
    icon: Monitor,
  },
  {
    key: "light",
    label: "Light",
    description: "Always use light mode",
    icon: Sun,
  },
  {
    key: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: Moon,
  },
] as const;

export default function ThemeScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Theme",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.container}>
        <Text style={styles.description}>
          Choose your preferred appearance for the app.
        </Text>

        <View style={styles.list}>
          {options.map(option => {
            const Icon = option.icon;
            const isSelected = option.key === themeMode;

            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setThemeMode(option.key)}
                style={[styles.option, isSelected && styles.selectedOption]}
              >
                <View style={styles.optionLeft}>
                  <Icon size={20} color={colors.primary} />
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionSubtitle}>{option.description}</Text>
                  </View>
                </View>

                {isSelected && <Check size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
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
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    description: {
      fontSize: 14,
      color: colors.mutedText,
      paddingHorizontal: 4,
      marginBottom: 10,
    },
    list: {
      gap: 8,
    },
    option: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectedOption: {
      borderColor: colors.primary,
    },
    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    optionTextWrap: {
      marginLeft: 10,
      flex: 1,
    },
    optionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    optionSubtitle: {
      color: colors.mutedText,
      fontSize: 12,
      marginTop: 2,
    },
  });
