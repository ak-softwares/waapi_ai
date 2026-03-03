import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react-native";

import AppMenu from "@/src/components/common/AppMenu";
import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import MessageBubble from "@/src/components/messages/widgets/MessageBubble";
import { useTheme } from "@/src/context/ThemeContext";
import { useTemplateDelete } from "@/src/hooks/template/useTemplateDelete";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessageStatus, MessageType } from "@/src/types/Messages";

export default function TemplateViewScreen() {
  const { template }: any = useLocalSearchParams(); // pass template JSON
  const parsedTemplate = JSON.parse(template);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [showDelete, setShowDelete] = useState(false);
  const { deleteTemplate, loading } = useTemplateDelete();
  // ======================
  // ACTIONS
  // ======================

  const handleEdit = () => {
    // router.push({
    //   pathname: "/templates/edit",
    //   params: { template },
    // });
  };

  const handleDuplicate = () => {
    // router.push({
    //   pathname: "/templates/create",
    //   params: { duplicate: template },
    // });
  };

  const handleDelete = async () => {
    setShowDelete(false);
    await deleteTemplate(parsedTemplate.name);
    // router.back();
  };

  // ======================
  // UI
  // ======================

  const messageTemplate: Message = {
    userId: "random-id",
    chatId: "random-id",
    to: parsedTemplate.to,
    from: "me",
    type: MessageType.TEMPLATE,
    message: "hi",
    template: parsedTemplate,
    tag: "broadcast",
    createdAt: new Date().toISOString(),
    status: MessageStatus.Delivered,
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: parsedTemplate.name,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <AppMenu
                trigger={<MoreVertical size={22} color={colors.text} />}
                items={[
                  {
                    label: "Edit Template",
                    icon: <Edit size={18} color={colors.text} />,
                    onPress: handleEdit,
                  },
                  {
                    label: "Duplicate Template",
                    icon: <Copy size={18} color={colors.text} />,
                    onPress: handleDuplicate,
                  },
                ]}
              />
            </View>
          ),
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>

          {/* Template Message */}
          <MessageBubble message={messageTemplate} isPreviewMode={true} />

        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDelete(true)}
        >
          <Trash2 size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Template</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Delete */}
      <ConfirmSheet
        visible={showDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template?"
        confirmText="Delete"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
        colors={colors}
      />
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 30,
    },

    previewTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.mutedText,
      marginBottom: 10,
      paddingHorizontal: 10,
    },

    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
      gap: 8,
    },

    deleteText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: "600",
    },
  });