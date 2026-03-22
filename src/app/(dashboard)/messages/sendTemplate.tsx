import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import TemplatePreviewSection from "@/src/components/templates/editor/sections/TemplatePreviewSection";
import VariableInput from "@/src/components/templates/widgets/VariableInput";
import { useTheme } from "@/src/context/ThemeContext";
import { useMedia } from "@/src/hooks/messages/useMedia";
import { useSendMessage } from "@/src/hooks/messages/useSendMessage";
import { useTemplates } from "@/src/hooks/template/useTemplates";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ChatParticipant, ChatType } from "@/src/types/Chat";
import { MessagePayload, MessageType } from "@/src/types/Messages";
import {
  Template,
  TemplateBodyComponentCreate,
  TemplateButtonsComponentCreate,
  TemplateHeaderComponentCreate,
} from "@/src/types/Template";
import { MediaType } from "@/src/utiles/enums/mediaTypes";
import {
  TemplateButtonType,
  TemplateComponentType,
  TemplateHeaderType,
} from "@/src/utiles/enums/template";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { Image } from "react-native";

type Params = {
  chatId: string;
  chatData?: string;
};

type VariableField = {
  key: string;
  placeholder: string;
  value: string;
};

const MEDIA_MAX_SIZE = 5 * 1024 * 1024;

export default function SendTemplateScreen() {
  const { chatId, chatData } = useLocalSearchParams<Params>();

  const chat = useMemo(() => (chatData ? JSON.parse(chatData) : null), [chatData]);
  const participants = (chat?.participants as ChatParticipant[]) || [];
  const isBroadcast = chat?.type === ChatType.BROADCAST;

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { templates, loading, loadingMore, loadMore, searchTemplates } = useTemplates();
  const { sendMessage, isSending } = useSendMessage();
  const { uploadMedia, fetchMedia, uploading, loadingMedia } = useMedia();

  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const sanitizeTemplateForSend = (template: Template) => {
    if (!template.components) return;

    for (const comp of template.components) {
      if (comp.type === TemplateComponentType.HEADER && comp.format !== TemplateHeaderType.TEXT) {
        if (comp.example?.header_handle) {
          delete comp.example.header_handle;
        }
      }

      if (comp.type === TemplateComponentType.BUTTONS) {
        for (const button of comp.buttons || []) {
          if (button.type === TemplateButtonType.URL && /{{\d+}}/.test(button.url || "") && button.example) {
            delete button.example;
          }
        }
      }
    }
  };

  const onSelectTemplate = (template: Template) => {
    const clone = JSON.parse(JSON.stringify(template)) as Template;
    sanitizeTemplateForSend(clone);
    setSelectedTemplate(clone);
    setMediaPreview(null);
  };

  const headerComponent = selectedTemplate?.components?.find(
    (c) => c.type === TemplateComponentType.HEADER
  ) as TemplateHeaderComponentCreate | undefined;

  const extractHeaderVariable = (): VariableField | null => {
    if (!headerComponent?.text) return null;

    const match = headerComponent.text.match(/{{(\d+)}}/);
    if (!match) return null;

    return {
      key: match[1],
      placeholder: match[0],
      value: headerComponent.example?.header_text?.[0] ?? "",
    };
  };

  const extractBodyVariables = (): VariableField[] => {
    const body = selectedTemplate?.components?.find(
      (c) => c.type === TemplateComponentType.BODY
    ) as TemplateBodyComponentCreate | undefined;

    if (!body?.text) return [];

    const keys = Array.from(new Set([...body.text.matchAll(/{{(\d+)}}/g)].map((m) => Number(m[1])))).sort(
      (a, b) => a - b
    );

    const sample = body.example?.body_text?.[0] ?? [];

    return keys.map((key) => ({
      key: String(key),
      placeholder: `{{${key}}}`,
      value: sample[key - 1] ?? "",
    }));
  };

  const extractButtonVariables = () => {
    const buttonsComp = selectedTemplate?.components?.find(
      (c) => c.type === TemplateComponentType.BUTTONS
    ) as TemplateButtonsComponentCreate | undefined;

    if (!buttonsComp?.buttons) return [];

    return buttonsComp.buttons
      .map((button, index) => {
        if (button.type === TemplateButtonType.COPY_CODE) {
          return {
            key: `copy_${index}`,
            index,
            label: "Copy code",
            placeholder: "{{1}}",
            value: button.example?.[0] ?? "",
            type: button.type,
          };
        }

        if (button.type === TemplateButtonType.URL && /{{\d+}}/.test(button.url || "")) {
          return {
            key: `url_${index}`,
            index,
            label: "URL variable",
            placeholder: button.url.match(/{{(\d+)}}/)?.[0] || "{{1}}",
            value: button.example?.[0] ?? "",
            type: button.type,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const headerVariable = extractHeaderVariable();
  const bodyVariables = extractBodyVariables();
  const buttonVariables = extractButtonVariables();

  const updateHeaderVariable = (value: string) => {
    if (!selectedTemplate) return;

    const updated = JSON.parse(JSON.stringify(selectedTemplate));

    const header = updated.components?.find(
      (c: any) => c.type === TemplateComponentType.HEADER
    );

    header.example ??= {};
    header.example.header_text ??= [];
    header.example.header_text[0] = value;

    setSelectedTemplate(updated);
  };

  const updateBodyVariable = (key: string, value: string) => {
    if (!selectedTemplate) return;

    const updated = JSON.parse(JSON.stringify(selectedTemplate));

    const body = updated.components?.find(
      (c: any) => c.type === TemplateComponentType.BODY
    );

    body.example ??= {};
    body.example.body_text ??= [[]];
    body.example.body_text[0][Number(key) - 1] = value;

    setSelectedTemplate(updated);
  };

  const updateButtonVariable = (index: number, value: string) => {
    if (!selectedTemplate) return;

    const updated = JSON.parse(JSON.stringify(selectedTemplate));

    const buttonComp = updated.components?.find(
      (c: any) => c.type === TemplateComponentType.BUTTONS
    );

    if (buttonComp?.buttons?.[index]) {
      buttonComp.buttons[index].example = [value];
    }

    setSelectedTemplate(updated);
  };

  const updateHeaderLocation = (
    field: "latitude" | "longitude" | "name" | "address",
    value: string
  ) => {
    if (!headerComponent || !selectedTemplate || headerComponent.format !== TemplateHeaderType.LOCATION) return;

    headerComponent.example ??= {};
    headerComponent.example.location ??= { latitude: 0, longitude: 0 };

    if (field === "latitude" || field === "longitude") {
      headerComponent.example.location[field] = value === "" ? 0 : Number(value);
    } else {
      headerComponent.example.location[field] = value;
    }

    setSelectedTemplate({ ...selectedTemplate });
  };

  const pickHeaderMedia = async () => {
    if (!headerComponent || !selectedTemplate) return;

    try {
      let file: { uri: string; name?: string; mimeType?: string; size?: number } | null = null;
      let mediaType: MediaType | null = null;

      if (headerComponent.format === TemplateHeaderType.IMAGE || headerComponent.format === TemplateHeaderType.VIDEO) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: headerComponent.format === TemplateHeaderType.IMAGE ? ["images"] : ["videos"],
          allowsMultipleSelection: false,
          quality: 1,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        file = {
          uri: asset.uri,
          name: asset.fileName ?? "media",
          mimeType: asset.mimeType,
          size: asset.fileSize,
        };
        mediaType = headerComponent.format === TemplateHeaderType.IMAGE ? MediaType.IMAGE : MediaType.VIDEO;
      }

      if (headerComponent.format === TemplateHeaderType.DOCUMENT) {
        const result = await DocumentPicker.getDocumentAsync({ multiple: false });
        if (result.canceled) return;

        const asset = result.assets[0];
        file = {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        };
        mediaType = MediaType.DOCUMENT;
      }

      if (!file || !mediaType) return;

      if (file.size && file.size > MEDIA_MAX_SIZE) {
        showToast({ type: "error", message: "File size exceeds 5MB limit" });
        return;
      }

      const mediaId = await uploadMedia({ uri: file.uri, name: file.name, mimeType: file.mimeType });
      const preview = await fetchMedia(mediaId);

      headerComponent.example ??= {};
      headerComponent.example.header_handle = [mediaId];

      setMediaPreview(preview);
      setSelectedTemplate({ ...selectedTemplate });
      showToast({ type: "success", message: "Media uploaded" });
    } catch (error: any) {
      showToast({ type: "error", message: error?.message || "Upload failed" });
    }
  };

  const removeHeaderMedia = () => {
    if (!headerComponent || !selectedTemplate) return;

    headerComponent.example ??= {};
    headerComponent.example.header_handle = undefined;
    setMediaPreview(null);
    setSelectedTemplate({ ...selectedTemplate });
  };

  const validateTemplateBeforeSend = () => {
    if (!selectedTemplate) {
      showToast({ type: "error", message: "Select a template" });
      return false;
    }

    for (const comp of selectedTemplate.components || []) {
      if (comp.type === TemplateComponentType.HEADER) {
        if (comp.format === TemplateHeaderType.TEXT && headerVariable) {
          const textValue = comp.example?.header_text?.[0];
          if (!textValue?.trim()) {
            showToast({ type: "error", message: "Header variable is required" });
            return false;
          }
        }

        if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(comp.format)) {
          if (!comp.example?.header_handle?.[0]) {
            showToast({ type: "error", message: "Header media is required" });
            return false;
          }
        }

        if (comp.format === TemplateHeaderType.LOCATION) {
          const loc = comp.example?.location;
          if (!loc || Number.isNaN(loc.latitude) || Number.isNaN(loc.longitude)) {
            showToast({ type: "error", message: "Valid location is required" });
            return false;
          }
        }
      }

      if (comp.type === TemplateComponentType.BODY) {
        const variableCount = (comp.text?.match(/{{\d+}}/g) || []).length;
        const values = comp.example?.body_text?.[0] || [];

        if (values.length < variableCount || values.some((value) => !value?.trim())) {
          showToast({ type: "error", message: "All body variables are required" });
          return false;
        }
      }

      if (comp.type === TemplateComponentType.BUTTONS) {
        for (const button of comp.buttons || []) {
          if (button.type === TemplateButtonType.COPY_CODE && !button.example?.[0]?.trim()) {
            showToast({ type: "error", message: "Copy code value is required" });
            return false;
          }

          if (button.type === TemplateButtonType.URL && /{{\d+}}/.test(button.url || "") && !button.example?.[0]?.trim()) {
            showToast({ type: "error", message: "Button URL variable is required" });
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSendTemplate = async () => {
    if (!validateTemplateBeforeSend() || !selectedTemplate) return;

    const payload: MessagePayload = {
      participants,
      messageType: MessageType.TEMPLATE,
      template: selectedTemplate,
      chatType: isBroadcast ? ChatType.BROADCAST : ChatType.CHAT,
      chatId: chatId || "",
    };

    const result = await sendMessage({ messagePayload: payload });

    if (result) {
      showToast({ type: "success", message: "Template sent" });
      router.back();
    }
  };

  const headerLocation = headerComponent?.example?.location;

  return (
    <>
      <Stack.Screen options={{ title: "Send Template" }} />
      <View style={styles.container}>
        {!selectedTemplate ? (
          <>
            <View style={styles.searchWrap}>
              <TextInput
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  searchTemplates(text);
                }}
                placeholder="Search template"
                placeholderTextColor={colors.placeHolderText}
                style={styles.input}
              />
            </View>

            <FlatList
              data={templates}
              keyExtractor={(item) => item.id || item._id}
              refreshing={loading}
              onRefresh={() => searchTemplates(search)}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No templates found.</Text> : null}
              ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : null}
              renderItem={({ item }) => (
                <Pressable style={styles.templateTile} onPress={() => onSelectTemplate(item)}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Text style={styles.templateMeta}>{item.language} • {item.category}</Text>
                </Pressable>
              )}
            />
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.formWrap}>
            <View style={styles.templateHeaderRow}>
              <Text style={styles.sectionTitle}>{selectedTemplate.name}</Text>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <Text style={styles.changeBtn}>Change</Text>
              </TouchableOpacity>
            </View>

            {headerVariable ? (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Header variable {headerVariable.placeholder} *</Text>
                <VariableInput
                  value={headerVariable.value}
                  onChange={updateHeaderVariable}
                  placeholder={`Enter value for ${headerVariable.placeholder}`}
                  variables={["user_name"]}
                />
              </View>
            ) : null}

            {headerComponent &&
              [TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerComponent.format) && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Header media *</Text>

                  {/* Upload Card */}
                  {!headerComponent.example?.header_handle?.[0] && (
                    <Pressable
                      style={styles.uploadCard}
                      disabled={uploading}
                      onPress={pickHeaderMedia}
                    >
                      {(uploading || loadingMedia) ? (
                        <>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={styles.uploadTitle}>{loadingMedia ? "Loading...": "Uploading..."}</Text>
                          <Text style={styles.uploadSubtitle}>Please wait</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.uploadIcon}>⬆️</Text>
                          <Text style={styles.uploadTitle}>
                            {headerComponent.format === TemplateHeaderType.DOCUMENT
                              ? "Upload Document"
                              : "Upload Media"}
                          </Text>
                          <Text style={styles.uploadSubtitle}>Tap to select file</Text>
                        </>
                      )}
                    </Pressable>
                  )}

                  {/* Media Preview */}
                  {!!headerComponent.example?.header_handle?.[0] && !uploading && (
                    <View style={styles.mediaPreview}>
                      
                      {/* Top Row */}
                      <View style={styles.mediaRow}>
                        <Text numberOfLines={1} style={styles.fileName}>
                          Selected file
                        </Text>

                        <View style={styles.actions}>
                          {/* <Pressable style={styles.changeBtn} onPress={pickHeaderMedia}>
                            <Text style={styles.changeText}>Change</Text>
                          </Pressable> */}

                          <Pressable onPress={removeHeaderMedia}>
                            <Text style={styles.removeText}>Remove</Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* Image Preview */}
                      {headerComponent.format === TemplateHeaderType.IMAGE && !!mediaPreview && (
                        <Image
                          source={{ uri: mediaPreview }}
                          style={styles.imagePreview}
                        />
                      )}

                      {/* Video / Document */}
                      {headerComponent.format !== TemplateHeaderType.IMAGE && (
                        <View style={styles.filePreview}>
                          <Text style={{ fontSize: 26 }}>
                            {headerComponent.format === TemplateHeaderType.VIDEO ? "🎬" : "📄"}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
            )}

            {headerComponent?.format === TemplateHeaderType.LOCATION ? (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Location *</Text>
                <TextInput
                  value={String(headerLocation?.latitude ?? "")}
                  onChangeText={(text) => updateHeaderLocation("latitude", text)}
                  style={styles.input}
                  placeholder="Latitude"
                  placeholderTextColor={colors.placeHolderText}
                  keyboardType="numeric"
                />
                <TextInput
                  value={String(headerLocation?.longitude ?? "")}
                  onChangeText={(text) => updateHeaderLocation("longitude", text)}
                  style={styles.input}
                  placeholder="Longitude"
                  placeholderTextColor={colors.placeHolderText}
                  keyboardType="numeric"
                />
                <TextInput
                  value={headerLocation?.name ?? ""}
                  onChangeText={(text) => updateHeaderLocation("name", text)}
                  style={styles.input}
                  placeholder="Name (optional)"
                  placeholderTextColor={colors.placeHolderText}
                />
                <TextInput
                  value={headerLocation?.address ?? ""}
                  onChangeText={(text) => updateHeaderLocation("address", text)}
                  style={styles.input}
                  placeholder="Address (optional)"
                  placeholderTextColor={colors.placeHolderText}
                />
              </View>
            ) : null}

            {bodyVariables.map((variable) => (
              <View style={styles.fieldWrap} key={variable.key}>
                <Text style={styles.label}>Body variable {variable.placeholder} *</Text>
                <VariableInput
                  value={variable.value}
                  onChange={(value) => updateBodyVariable(variable.key, value)}
                  placeholder={`Enter value for ${variable.placeholder}`}
                  variables={["user_name"]}
                />
              </View>
            ))}

            {buttonVariables.map((variable: any) => (
              <View style={styles.fieldWrap} key={variable.key}>
                <Text style={styles.label}>{variable.label} {variable.placeholder} *</Text>
                <TextInput
                  value={variable.value}
                  onChangeText={(value) => updateButtonVariable(variable.index, value)}
                  style={styles.input}
                  placeholder={`Enter value for ${variable.placeholder}`}
                  placeholderTextColor={colors.placeHolderText}
                />
              </View>
            ))}

            <TemplatePreviewSection
              key={JSON.stringify(selectedTemplate)} // 🔥 force re-render
              name={selectedTemplate.name}
              components={selectedTemplate.components ?? []}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendTemplate} disabled={isSending}>
              <Text style={styles.sendBtnText}>{isSending ? "Sending..." : "Send Template"}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 14,
    },
    searchWrap: {
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 30,
      color: colors.secondaryText,
    },
    templateTile: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.messageCard,
      padding: 12,
      marginBottom: 8,
    },
    templateName: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 15,
      marginBottom: 4,
      textTransform: "lowercase",
    },
    templateMeta: {
      color: colors.secondaryText,
      fontSize: 12,
    },
    formWrap: {
      paddingBottom: 26,
      gap: 8,
    },
    templateHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 16,
    },
    fieldWrap: {
      marginBottom: 4,
    },
    label: {
      color: colors.secondaryText,
      marginBottom: 6,
      fontSize: 13,
    },
    mediaRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
    secondaryBtn: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    secondaryBtnText: {
      color: colors.text,
      fontWeight: "600",
    },
    clearBtn: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    clearBtnText: {
      color: colors.danger,
      fontWeight: "600",
    },
    helpText: {
      color: colors.secondaryText,
      marginTop: 6,
      fontSize: 12,
    },
    sendBtn: {
      marginTop: 14,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    sendBtnText: {
      color: "#FFF",
      fontWeight: "700",
      fontSize: 15,
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
      color: colors.secondaryText,
      marginTop: 4,
    },

    mediaPreview: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.background,
    },

    fileName: {
      flex: 1,
      color: colors.text,
      fontWeight: "500",
      marginRight: 10,
    },

    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    changeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      color: "#fff",
      backgroundColor: colors.primary,
    },

    changeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },

    removeText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: "600",
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
