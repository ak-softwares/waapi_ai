import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { TemplateHeaderType } from "@/src/utiles/enums/template";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
  const { headerFormat, uploadHeaderMedia } = props;
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required to access gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        headerFormat === TemplateHeaderType.IMAGE
          ? ImagePicker.MediaTypeOptions.Images
          : headerFormat === TemplateHeaderType.VIDEO
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      uploadHeaderMedia({
        uri: asset.uri,
        name: asset.fileName || "header-file",
        type:
          headerFormat === TemplateHeaderType.IMAGE
            ? "image/jpeg"
            : headerFormat === TemplateHeaderType.VIDEO
            ? "video/mp4"
            : "application/pdf",
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];

      uploadHeaderMedia({
        uri: file.uri,
        name: file.name || "document.pdf",
        type: file.mimeType || "application/pdf",
      });
    }
  };

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
          <Text style={styles.label}>Header Media</Text>

          {/* Upload Card */}
          {!props.headerMedia.uri && !props.isUploading && (
            <Pressable
              style={styles.uploadCard}
              onPress={
                props.headerFormat === TemplateHeaderType.DOCUMENT
                  ? pickDocument
                  : pickMedia
              }
            >
              <Text style={styles.uploadIcon}>⬆️</Text>
              <Text style={styles.uploadTitle}>
                {props.headerFormat === TemplateHeaderType.DOCUMENT
                  ? "Upload PDF"
                  : "Upload Media"}
              </Text>
              <Text style={styles.uploadSubtitle}>Tap to select file</Text>
            </Pressable>
          )}

          {/* Uploading */}
          {props.isUploading && (
            <View style={styles.uploadingWrap}>
              <Text style={styles.uploading}>Uploading media...</Text>
            </View>
          )}

          {/* Media Preview */}
          {props.headerMedia.uri && !props.isUploading && (
            <View style={styles.mediaPreview}>

              {/* Top Row */}
              <View style={styles.mediaRow}>
                <Text numberOfLines={1} style={styles.fileName}>
                  {props.headerMedia.fileName}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.changeBtn}
                    onPress={
                      props.headerFormat === TemplateHeaderType.DOCUMENT
                        ? pickDocument
                        : pickMedia
                    }
                  >
                    <Text style={styles.changeText}>Change</Text>
                  </Pressable>

                  <Pressable onPress={props.removeMedia}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>

              {/* Image Preview */}
              {props.headerFormat === TemplateHeaderType.IMAGE && (
                <Image
                  source={{ uri: props.headerMedia.uri }}
                  style={styles.imagePreview}
                />
              )}

              {/* Video / PDF preview */}
              {props.headerFormat !== TemplateHeaderType.IMAGE && (
                <View style={styles.filePreview}>
                  <Text style={{ fontSize: 26 }}>
                    {props.headerFormat === TemplateHeaderType.VIDEO ? "🎬" : "📄"}
                  </Text>
                </View>
              )}

            </View>
          )}
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
    mediaButton: {
      marginTop: 10,
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    mediaButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
    uploadCard: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 12,
      paddingVertical: 26,
      alignItems: "center",
      backgroundColor: colors.background,
    },

    uploadIcon: {
      fontSize: 24,
      marginBottom: 6,
    },

    uploadTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    uploadSubtitle: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 4,
    },
    
    fileName: {
      color: colors.text,
      fontWeight: "500",
    },

    uploading: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 3,
    },

    changeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },

    changeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },

    removeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    removeText: {
      color: colors.error,
      fontSize: 12,
      fontWeight: "600",
    },

    uploadingWrap: {
      paddingVertical: 12,
    },

   mediaPreview: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.background,
    },

    mediaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    imagePreview: {
      width: "100%",
      height: 180,
      borderRadius: 8,
      marginTop: 10,
    },

    filePreview: {
      width: "100%",
      height: 100,
      borderRadius: 8,
      marginTop: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
    },
  });

