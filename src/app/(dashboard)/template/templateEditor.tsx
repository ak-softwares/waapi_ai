import BodySection from "@/src/components/templates/editor/sections/BodySection";
import ButtonsSection from "@/src/components/templates/editor/sections/ButtonsSection";
import FooterSection from "@/src/components/templates/editor/sections/FooterSection";
import HeaderSection from "@/src/components/templates/editor/sections/HeaderSection";
import TemplateInfoSection from "@/src/components/templates/editor/sections/TemplateInfoSection";
import TemplatePreviewSection from "@/src/components/templates/editor/sections/TemplatePreviewSection";
import { useTheme } from "@/src/context/ThemeContext";
import { useTemplateEditor } from "@/src/hooks/template/useTemplateEditor";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Template, TemplateComponentCreate } from "@/src/types/Template";
import {
    TemplateCategory,
    TemplateComponentType,
    TemplateHeaderType,
} from "@/src/utils/enums/template";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function TemplateEditorScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ mode?: "create" | "edit" | "duplicate"; template?: string }>();
  const mode = params.mode || "create";
  const initialTemplate = params.template ? (JSON.parse(params.template) as Template) : null;

  const editor = useTemplateEditor({
    mode,
    initialTemplate,
    onSaved: () => router.back(),
  });

  const previewComponents: TemplateComponentCreate[] = [
    {
      type: TemplateComponentType.HEADER,
      format: editor.headerFormat,
      text: editor.headerFormat === TemplateHeaderType.TEXT ? editor.headerText : undefined,
    } as any,
    { type: TemplateComponentType.BODY, text: editor.bodyText },
    ...(editor.footerText ? [{ type: TemplateComponentType.FOOTER, text: editor.footerText } as any] : []),
    ...(editor.buttons.filter((btn) => btn.text?.trim()).length ? [{ type: TemplateComponentType.BUTTONS, buttons: editor.buttons } as any] : []),
  ];

  const showTemplateSections = editor.templateCategory !== TemplateCategory.AUTHENTICATION;

  return (
    <>
      <Stack.Screen
        options={{
          title: mode === "edit" ? "Edit Template" : "Add Template",
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <TemplateInfoSection
          templateCategory={editor.templateCategory}
          setTemplateCategory={editor.setTemplateCategory}
          templateLanguage={editor.templateLanguage}
          setTemplateLanguage={editor.setTemplateLanguage}
          templateName={editor.templateName}
          setTemplateName={editor.setTemplateName}
          toMetaTemplateName={editor.toMetaTemplateName}
        />

        {showTemplateSections && (
          <HeaderSection
            headerFormat={editor.headerFormat}
            setHeaderFormat={editor.setHeaderFormat}
            headerText={editor.headerText}
            setHeaderText={editor.setHeaderText}
            addVariableInHeader={editor.addVariableInHeader}
            headerVariables={editor.headerVariables}
            headerSampleValues={editor.headerSampleValues}
            setHeaderSampleValues={editor.setHeaderSampleValues}
            headerMedia={editor.headerMedia}
            uploadHeaderMedia={editor.uploadHeaderMedia}
            removeMedia={editor.removeMedia}
            isUploading={editor.isUploading}
          />
        )}

        {showTemplateSections && (
          <BodySection
            bodyText={editor.bodyText}
            setBodyText={editor.setBodyText}
            bodyVariables={editor.bodyVariables}
            addVariableInBody={editor.addVariableInBody}
            bodySampleValues={editor.bodySampleValues}
            setBodySampleValues={editor.setBodySampleValues}
            updateSampleValues={editor.updateSampleValues}
          />
        )}

        {showTemplateSections && <FooterSection footerText={editor.footerText} setFooterText={editor.setFooterText} />}

        {showTemplateSections && (
          <ButtonsSection
            buttons={editor.buttons}
            updateButton={editor.updateButton}
            removeButton={editor.removeButton}
            addButton={editor.addButton}
            isVariableAddedInButtonUrl={editor.isVariableAddedInButtonUrl}
            addVariableInUrlButton={editor.addVariableInUrlButton}
            removeVariableInUrlButton={editor.removeVariableInUrlButton}
            setUrlSampleValues={editor.setUrlSampleValues}
            setCopyCodeSampleValues={editor.setCopyCodeSampleValues}
          />
        )}

        <TemplatePreviewSection name={editor.templateName} components={previewComponents} />

        <Pressable style={styles.saveBtn} onPress={editor.saveTemplate} disabled={editor.isSaving}>
          <Text style={styles.saveText}>{editor.isSaving ? "Saving..." : mode === "edit" ? "Update Template" : "Create Template"}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: { padding: 16, gap: 12, paddingBottom: 40 },
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
    saveBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    saveText: { color: "#fff", fontWeight: "700" },
  });
