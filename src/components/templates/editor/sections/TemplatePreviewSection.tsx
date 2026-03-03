import MessageBubble from "@/src/components/messages/widgets/MessageBubble";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessageStatus, MessageType } from "@/src/types/Messages";
import { Template, TemplateComponentCreate } from "@/src/types/Template";
import { TemplateCategory } from "@/src/utiles/enums/template";
import { StyleSheet, Text, View } from "react-native";

export default function TemplatePreviewSection({ name, components }: { name: string; components: TemplateComponentCreate[] }) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  
  const template: Template = {
    _id: "preview-id",
    userId: "preview-user-id",
    waAccountId: "preview-wa-account-id",
    language: "en",
    name,
    category: TemplateCategory.UTILITY,
    components,
  };

  const messageTemplate: Message = {
    userId: "random-id",
    chatId: "random-id",
    to: "random-number",
    from: "me",
    type: MessageType.TEMPLATE,
    message: "hi",
    template: template,
    tag: "broadcast",
    createdAt: new Date().toISOString(),
    status: MessageStatus.Delivered,
  }
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Preview</Text>
        {/* Template Message */}
        <MessageBubble message={messageTemplate} isPreviewMode={true} />
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
    buttonCard: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 10, 
      padding: 10, 
      gap: 8 
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

const styles = StyleSheet.create({
  previewBox: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, backgroundColor: "#f9fafb", gap: 8 },
  name: { fontWeight: "700" },
  footer: { color: "#6b7280", fontSize: 12 },
  button: { color: "#2563eb" },
});
