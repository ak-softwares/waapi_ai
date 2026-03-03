import SettingsTile from "@/src/components/settings/widgets/SettingsTile";
import { useTheme } from "@/src/context/ThemeContext";
import { useAiAssistant } from "@/src/hooks/ai/useAiAssistant";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Stack } from "expo-router";
import { Power, Save } from "lucide-react-native";
import React from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function AIAssistantScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    aiAssistant,
    setAiAssistant,
    loading,
    saving,
    updateAiAssistant,
  } = useAiAssistant();

  const handleSave = async () => {
    await updateAiAssistant({
      prompt: aiAssistant.prompt,
      isActive: aiAssistant.isActive,
    });
  };

  const toggleAI = async () => {
    await updateAiAssistant({
      isActive: !aiAssistant.isActive,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "AI Assistant",
          // headerRight: () => (
          //   <TouchableOpacity
          //     onPress={() => console.log("Menu")}
          //     style={{ paddingHorizontal: 10 }}
          //   >
          //     <MoreVertical size={22} color={colors.text} />
          //   </TouchableOpacity>
          // ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* Status Tile */}
        <SettingsTile
          // icon={<Stars size={20} color={colors.primary} />}
          title="AI Status"
          subtitle={
            aiAssistant.isActive
              ? "AI is currently responding to messages"
              : "AI replies are disabled"
          }
          rightElement={
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: aiAssistant.isActive
                    ? colors.error
                    : colors.primary,
                },
              ]}
              onPress={toggleAI}
              disabled={saving}
            >
              <Power size={16} color="#fff" />
              <Text style={styles.toggleText}>
                {aiAssistant.isActive ? "Disable" : "Enable"}
              </Text>
            </TouchableOpacity>
          }
        />
        {/* Prompt Section */}
        <View style={styles.promptContainer}>
          <Text style={styles.label}>System Prompt</Text>

          <TextInput
            multiline
            value={aiAssistant.prompt}
            onChangeText={(text) =>
              setAiAssistant((prev) => ({
                ...prev,
                prompt: text,
              }))
            }
            placeholder="You are a helpful AI assistant for our business..."
            placeholderTextColor={colors.mutedText}
            style={styles.textArea}
          />

          <View style={styles.promptFooter}>
            <Text style={styles.counter}>
              {aiAssistant.prompt?.length || 0} characters
            </Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Save size={16} color="#fff" />
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },

    header: {
      marginTop: 16,
      marginBottom: 12,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    subtitle: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 4,
    },

    promptContainer: {
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },

    label: {
      fontSize: 13,
      color: colors.mutedText,
      marginBottom: 8,
    },

    textArea: {
      height: 250, // ✅ fixed height
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.background,
      textAlignVertical: "top",
      fontSize: 14,
    },

    promptFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    },

    counter: {
      fontSize: 12,
      color: colors.mutedText,
    },

    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },

    saveText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
    },

    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },

    toggleText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });