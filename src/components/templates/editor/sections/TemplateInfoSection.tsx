import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { TemplateCategory } from "@/src/utils/enums/template";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  templateCategory: TemplateCategory;
  setTemplateCategory: (v: TemplateCategory) => void;
  templateLanguage: string;
  setTemplateLanguage: (v: string) => void;
  templateName: string;
  setTemplateName: (v: string) => void;
  toMetaTemplateName: (v: string) => string;
};

export default function TemplateInfoSection(props: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Template Information</Text>
      <Text style={styles.label}>Template Category</Text>
      <View style={styles.pickerWrap}>
        <Picker 
        selectedValue={props.templateCategory} 
        onValueChange={props.setTemplateCategory as any}
        style={{ color: colors.text }}
        dropdownIconColor={colors.text}
        itemStyle={{ color: colors.text }}
        >
          <Picker.Item label="Utility" value={TemplateCategory.UTILITY} />
          <Picker.Item label="Marketing" value={TemplateCategory.MARKETING} />
          <Picker.Item label="Authentication" value={TemplateCategory.AUTHENTICATION} />
        </Picker>
      </View>

      <Text style={styles.label}>Template Language</Text>
      <View style={styles.pickerWrap}>
        <Picker
        selectionColor={colors.cursorColor}
        selectedValue={props.templateLanguage}
        onValueChange={props.setTemplateLanguage}
        style={{ color: colors.text }}
        dropdownIconColor={colors.text}
        itemStyle={{ color: colors.text }}
      >
          <Picker.Item label="English (en)" value="en" />
          <Picker.Item label="Hindi (hi)" value="hi" />
          <Picker.Item label="Spanish (es)" value="es" />
          <Picker.Item label="French (fr)" value="fr" />
        </Picker>
      </View>

      <Text style={styles.label}>Template Name</Text>
      <TextInput
        placeholderTextColor={colors.placeHolderText}
        selectionColor={colors.cursorColor}
        cursorColor={colors.cursorColor}      // Android
        style={styles.input}
        value={props.templateName}
        onChangeText={(v) => props.setTemplateName(props.toMetaTemplateName(v))}
        placeholder="e.g. order_update_code"
      />
      <Text style={styles.helper}>Name supports lowercase letters, numbers and underscore only.</Text>
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
    helper: {
      color: colors.mutedText, 
      fontSize: 12 
    },
  });