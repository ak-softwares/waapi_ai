import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  bodyText: string;
  setBodyText: (v: string) => void;
  bodyVariables: number[];
  addVariableInBody: () => void;
  bodySampleValues: string[];
  setBodySampleValues: (v: string[]) => void;
  updateSampleValues: (vars: number[]) => void;
};

export default function BodySection(props: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Body (Required)</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Message Body</Text>
        <Pressable onPress={props.addVariableInBody}><Text style={styles.link}>+ Add Variable</Text></Pressable>
      </View>
      <TextInput
        placeholderTextColor={colors.placeHolderText}
        selectionColor={colors.cursorColor}
        cursorColor={colors.cursorColor}      // Android
        style={[styles.input, styles.textarea]}
        multiline
        value={props.bodyText}
        onChangeText={(v) => {
          props.setBodyText(v);
          const vars = [...v.matchAll(/{{(\d+)}}/g)].map((m) => Number(m[1]));
          props.updateSampleValues(vars);
        }}
      />
      {props.bodyVariables.map((varNum, index) => (
        <View key={varNum} style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={{ color: colors.text }}>{`{{${varNum}}}`}</Text>
          <TextInput
            placeholderTextColor={colors.placeHolderText}
            selectionColor={colors.cursorColor}
            cursorColor={colors.cursorColor}      // Android
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            value={props.bodySampleValues[index] || ""}
            onChangeText={(txt) => {
              const next = [...props.bodySampleValues];
              next[index] = txt;
              props.setBodySampleValues(next);
            }}
          />
        </View>
      ))}
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
      paddingBottom: 60,
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