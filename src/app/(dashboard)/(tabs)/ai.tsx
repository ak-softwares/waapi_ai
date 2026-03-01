import { ToolTile } from "@/src/component/tools/widgets/ToolTile";
import { useEditTool } from "@/src/hooks/tools/useEditTool";
import { useTools } from "@/src/hooks/tools/useTools";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import { Pencil } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import {
  ToolCatalog,
  ToolPayload,
  ToolStatus,
} from "@/src/types/Tool";

export default function AiScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    tools,
    setTools,
    loading,
    loadingMore,
    loadMore,
    refresh,
  } = useTools();

  const {
    updateTool,
    deleteTool,
    loading: updateLoading,
    isDeleteLoading,
  } = useEditTool();

  const [selectedTool, setSelectedTool] =
    useState<ToolCatalog | null>(null);

  // ==========================
  // TOGGLE ACTIVE
  // ==========================
  const handleToggleActive = async (
    tool: ToolCatalog,
    active: boolean
  ) => {
    if (!tool?._id) return;

    setSelectedTool(tool);

    const payload: ToolPayload = {
      id: tool.id,
      active,
    };

    const updated = await updateTool(tool._id, payload);
    if (!updated) return;

    setTools((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              _id: updated._id,
              active: updated.active,
              status: updated.status,
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt,
              credentials: t.credentials.map((cred) => ({
                ...cred,
                value:
                  updated.credentials?.[cred.key] ??
                  cred.value ??
                  "",
              })),
            }
          : t
      )
    );

    setSelectedTool(null);
  };

  // ==========================
  // DELETE TOOL
  // ==========================
  const handleDelete = async (tool: ToolCatalog) => {
    if (!tool?._id) return;

    setSelectedTool(tool);

    const deleted = await deleteTool(tool._id);
    if (!deleted) return;

    setTools((prev) =>
      prev.map((t) => {
        if (t.id !== tool.id) return t;

        return {
          ...t,
          _id: undefined,
          active: false,
          status: ToolStatus.NOT_CONNECTED,
          createdAt: undefined,
          updatedAt: undefined,
          credentials: t.credentials.map((cred) => ({
            ...cred,
            value: "",
          })),
        };
      })
    );

    setSelectedTool(null);
  };

  // ==========================
  // RENDER TOOL ITEM
  // ==========================
  const renderTool = ({
    item,
  }: {
    item: ToolCatalog;
  }) => (
  <ToolTile
    tool={item}
    onConnect={(tool) =>
      router.push({
        pathname: "/(dashboard)/ai/tools/toolConnect",
        params: {
          toolId: tool.id,
          mode: "connect",
        },
      })
    }
    onManage={(tool) =>
      router.push({
        pathname: "/(dashboard)/ai/tools/toolConnect",
        params: {
          toolId: tool.id,
          mode: "edit",
        },
      })
    }
    onToggleActive={handleToggleActive}
    onDelete={handleDelete}

    onToggleLoading={(tool) =>
      selectedTool?.id === tool.id && updateLoading
    }

    onDeleteLoading={(tool) =>
      selectedTool?.id === tool.id && isDeleteLoading
    }
  />
  );

  // ==========================
  // HEADER COMPONENT
  // ==========================
  const ListHeader = () => (
    <>
      {/* ===== AI ASSISTANT ===== */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              AI Assistant
            </Text>
            <Text style={styles.cardDesc}>
              Manage your AI prompts
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editBtn}
            onPress={() =>
              router.push("/(dashboard)/ai/aiAssistant")
            }
          >
            <Pencil
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== TOOLS TITLE ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tools Integrations
        </Text>
      </View>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={tools}
      keyExtractor={(item) => item.id}
      renderItem={renderTool}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshing={loading}
      onRefresh={refresh}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            style={{ marginVertical: 20 }}
            color={colors.primary}
          />
        ) : null
      }
    />
  );
}

const getStyles = (
  colors: typeof lightColors
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 15,
    },

    section: {
      paddingVertical: 10,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 3,
    },

    cardDesc: {
      fontSize: 13,
      color: colors.mutedText,
    },

    editBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });