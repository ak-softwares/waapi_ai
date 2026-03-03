import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function FooterSection({ footerText, setFooterText }: { footerText: string; setFooterText: (v: string) => void }) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Footer (Optional)</Text>
      <Text style={styles.label}>Footer Text</Text>
      <TextInput 
      placeholderTextColor={colors.placeHolderText}
      selectionColor={colors.cursorColor}
      cursorColor={colors.cursorColor}      // Android
      style={styles.input} 
      value={footerText} 
      onChangeText={setFooterText}
      maxLength={60}
      />
      <Text style={styles.helper}>{footerText.length}/60 characters</Text>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
    },
    title: { 
      fontSize: 15,
      fontWeight: "600", 
      marginBottom: 10, 
      color: colors.text
    },
    label: {
      fontSize: 13,
      color: colors.mutedText,
      marginBottom: 6,
      marginTop: 10,
    },
    pickerWrap: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 10,
      overflow: "hidden",
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 10,
      height: 45,
      justifyContent: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 15,
      height: 45,
    },
    textarea: { 
      minHeight: 90, 
      textAlignVertical: "top" 
    },
    helper: {
      color: colors.mutedText, 
      fontSize: 12 
    },
    rowBetween: { 
      flexDirection: "row",
      justifyContent: "space-between", 
      alignItems: "center" 
    },
    link: { 
      color: colors.link, 
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    dissabledLink: { 
      color: colors.link, 
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    danger: { 
      color: colors.error, 
      fontWeight: "700" 
    },
  });
