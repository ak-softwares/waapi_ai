import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { TemplateHeaderType } from "@/src/utiles/enums/template";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  headerFormat: TemplateHeaderType;
  setHeaderFormat: (v: TemplateHeaderType) => void;
  headerText: string;
  setHeaderText: (v: string) => void;
  addVariableInHeader: () => void;
  headerVariables: number[];
  headerSampleValues: string;
  setHeaderSampleValues: (v: string) => void;
  headerMedia: { uri: string | null; fileName: string };
  uploadHeaderMedia: (file: { uri: string; name: string; type: string }) => Promise<void>;
  removeMedia: () => void;
  isUploading: boolean;
};

export default function HeaderSection(props: Props) {
  const [mediaUri, setMediaUri] = useState("");
  const { headerFormat, uploadHeaderMedia } = props;
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  useEffect(() => {
    const isMedia = [TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat);
    if (!isMedia || !mediaUri.trim()) return;

    uploadHeaderMedia({
      uri: mediaUri.trim(),
      name: mediaUri.split("/").pop() || "header-file",
      type:
        headerFormat === TemplateHeaderType.IMAGE
          ? "image/jpeg"
          : headerFormat === TemplateHeaderType.VIDEO
            ? "video/mp4"
            : "application/pdf",
    });
  }, [mediaUri, headerFormat, uploadHeaderMedia]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Header (Optional)</Text>
      <Text style={styles.label}>Header Format</Text>
      <View style={styles.pickerWrap}>
        <Picker 
        selectedValue={props.headerFormat} 
        onValueChange={props.setHeaderFormat as any}
        style={{ color: colors.text }}
        dropdownIconColor={colors.text}
        itemStyle={{ color: colors.text }}
        >
          <Picker.Item label="Text" value={TemplateHeaderType.TEXT} />
          <Picker.Item label="Image" value={TemplateHeaderType.IMAGE} />
          <Picker.Item label="Video" value={TemplateHeaderType.VIDEO} />
          <Picker.Item label="Document" value={TemplateHeaderType.DOCUMENT} />
          <Picker.Item label="Location" value={TemplateHeaderType.LOCATION} />
        </Picker>
      </View>

      {props.headerFormat === TemplateHeaderType.TEXT && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Header Text</Text>
            <Pressable onPress={props.addVariableInHeader} disabled={props.headerVariables.length >= 1}>
              <Text style={styles.link}>+ Add Variable</Text>
            </Pressable>
          </View>
          <TextInput
          placeholderTextColor={colors.placeHolderText}
          selectionColor={colors.cursorColor}
          cursorColor={colors.cursorColor}      // Android
          style={styles.input} 
          value={props.headerText} 
          onChangeText={props.setHeaderText}
          maxLength={60}
           />
          {props.headerVariables.length > 0 && (
            <TextInput 
            placeholderTextColor={colors.placeHolderText}
            selectionColor={colors.cursorColor}
            cursorColor={colors.cursorColor}      // Android
            style={[ styles.input, { marginTop: 10 } ]} 
            value={props.headerSampleValues} 
            onChangeText={props.setHeaderSampleValues} 
            placeholder="Sample header variable value" 
            />
          )}
        </>
      )}

      {[TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(props.headerFormat) && (
        <>
          <Text style={styles.label}>Media URI (upload starts immediately when entered)</Text>
          <TextInput
            placeholderTextColor={colors.placeHolderText}
            selectionColor={colors.cursorColor}
            cursorColor={colors.cursorColor}      // Android
            style={styles.input}
            value={mediaUri}
            onChangeText={setMediaUri}
            placeholder="file:///... or https://..."
            autoCapitalize="none"
          />
          {props.isUploading ? <Text>Uploading...</Text> : null}
          {props.headerMedia.uri ? (
            <View style={styles.rowBetween}>
              <Text numberOfLines={1} style={{ flex: 1 }}>{props.headerMedia.fileName}</Text>
              <Pressable onPress={props.removeMedia}><Text style={styles.danger}>Remove</Text></Pressable>
            </View>
          ) : null}
        </>
      )}

      {props.headerFormat === TemplateHeaderType.LOCATION && <Text style={styles.helper}>Location will be provided dynamically while sending.</Text>}
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

