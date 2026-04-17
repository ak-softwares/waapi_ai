import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { TemplateButton } from "@/src/types/Template";
import { TemplateButtonType } from "@/src/utils/enums/template";
import { Picker } from "@react-native-picker/picker";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  buttons: TemplateButton[];
  updateButton: (index: number, field: string, value: string) => void;
  removeButton: (index: number) => void;
  addButton: () => void;
  isVariableAddedInButtonUrl: boolean;
  addVariableInUrlButton: (index: number) => void;
  removeVariableInUrlButton: (index: number) => void;
  setUrlSampleValues: (v: string) => void;
  setCopyCodeSampleValues: (v: string) => void;
};

export default function ButtonsSection(props: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Buttons (Optional)</Text>
      {props.buttons.map((button, index) => {
        const isURL = button.type === TemplateButtonType.URL;
        return (
          <View key={index} style={styles.buttonCard}>
            <View style={styles.pickerWrap}>
              <Picker
              style={{ color: colors.text }}
              dropdownIconColor={colors.text}
              itemStyle={{ color: colors.text }}
              selectedValue={button.type} 
              onValueChange={(v) => props.updateButton(index, "type", v)}
              >
                <Picker.Item label="Quick Reply" value={TemplateButtonType.QUICK_REPLY} />
                <Picker.Item label="URL" value={TemplateButtonType.URL} />
                <Picker.Item label="Phone Number" value={TemplateButtonType.PHONE_NUMBER} />
                <Picker.Item label="Copy offer code" value={TemplateButtonType.COPY_CODE} />
              </Picker>
            </View>

            <TextInput
              placeholderTextColor={colors.placeHolderText}
              selectionColor={colors.cursorColor}
              cursorColor={colors.cursorColor}      // Android
              style={styles.input}
              editable={button.type !== TemplateButtonType.COPY_CODE}
              value={button.type === TemplateButtonType.COPY_CODE ? "Copy offer code" : button.text}
              onChangeText={(v) => props.updateButton(index, "text", v)}
              placeholder="Button text"
            />

            {button.type === TemplateButtonType.PHONE_NUMBER && (
              <TextInput 
                placeholderTextColor={colors.placeHolderText}
                selectionColor={colors.cursorColor}
                cursorColor={colors.cursorColor}      // Android
                style={styles.input} 
                value={(button as any).phone_number || ""} 
                onChangeText={(v) => props.updateButton(index, "phone_number", v)} 
                placeholder="+1234567890" 
              />
            )}

            {button.type === TemplateButtonType.COPY_CODE && (
              <TextInput
                placeholderTextColor={colors.placeHolderText}
                selectionColor={colors.cursorColor}
                cursorColor={colors.cursorColor}      // Android 
                style={styles.input} 
                onChangeText={props.setCopyCodeSampleValues} 
                placeholder="Enter sample code" 
              />
            )}

            {isURL && (
              <>
                <TextInput 
                  placeholderTextColor={colors.placeHolderText}
                  selectionColor={colors.cursorColor}
                  cursorColor={colors.cursorColor}      // Android
                  style={styles.input} 
                  value={(button as any).url || ""} 
                  onChangeText={(v) => props.updateButton(index, "url", v)} 
                  placeholder="https://..." 
                  autoCapitalize="none" 
                />
                <View style={styles.rowBetween}>
                  <Pressable onPress={() => props.addVariableInUrlButton(index)} disabled={props.isVariableAddedInButtonUrl}>
                    <Text style={[styles.link, { textAlign: "right" }]}>+ Add URL variable</Text>
                  </Pressable>
                  {props.isVariableAddedInButtonUrl && 
                    <Pressable onPress={() => props.removeVariableInUrlButton(index)}>
                      <Text style={styles.danger}>Remove variable</Text>
                    </Pressable>}
                </View>
                {props.isVariableAddedInButtonUrl && (
                  <TextInput
                    placeholderTextColor={colors.placeHolderText}
                    selectionColor={colors.cursorColor}
                    cursorColor={colors.cursorColor}      // Android 
                    style={styles.input} 
                    onChangeText={props.setUrlSampleValues} 
                    placeholder="Full URL for preview" 
                    autoCapitalize="none" 
                  />
                )}
              </>
            )}

            <Pressable
              style={styles.deleteButton}
              onPress={() => props.removeButton(index)}
            >
              <Text style={styles.deleteButtonText}>Remove Button</Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable onPress={props.addButton} disabled={props.buttons.length >= 3}>
        <Text style={[styles.link, { textAlign: "right" }]}>+ Add Button {props.buttons.length >= 3 ? "(Max 3)" : ""}</Text>
      </Pressable>
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
      textAlign: "right",
      color: colors.link, 
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    buttonCard: { 
      borderWidth: 1,
      backgroundColor:
        colors.surface === "#1a1a1a"
          ? "#222222"   // Dark slightly lighter than surface
          : "#ffffff",  // Light elevated card
      borderColor: colors.border, 
      marginBottom: 10,
      borderRadius: 10, 
      padding: 10, 
      gap: 8 
    },
    dissabledLink: { 
      color: colors.mutedText, 
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    danger: {
      alignItems: "center",
      justifyContent: "center",
      color: colors.danger, 
      fontWeight: "700" 
    },
    deleteButton: {
      marginTop: 6,
      alignSelf: "center",
      // backgroundColor: colors.danger,
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 8,
      minWidth: 140,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButtonText: {
      color: colors.danger,
      fontWeight: "500",
      fontSize: 13,
      letterSpacing: 0.3,
    },
  });

