import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ToolCatalog, ToolStatus } from "@/src/types/Tool";
import { Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgUri } from "react-native-svg";
import { AppSwitch } from "../../common/AppSwitch";
import ConfirmSheet from "../../common/ConfirmSheet";

type ToolTileProps = {
  tool: ToolCatalog;

  onConnect?: (tool: ToolCatalog) => void;
  onManage?: (tool: ToolCatalog) => void;

  onToggleActive?: (
    tool: ToolCatalog,
    active: boolean
  ) => Promise<void> | void;

  onToggleLoading?: (tool: ToolCatalog) => boolean;

  onDelete?: (tool: ToolCatalog) => Promise<void> | void;
  onDeleteLoading?: (tool: ToolCatalog) => boolean;
};

export function ToolTile({
  tool,
  onConnect,
  onManage,
  onToggleActive,
  onToggleLoading,
  onDelete,
  onDeleteLoading,
}: ToolTileProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const isConnected = tool.status === ToolStatus.CONNECTED;

  const toggleLoading = onToggleLoading?.(tool) ?? false;
  const deleteLoading = onDeleteLoading?.(tool) ?? false;
  const [showDelete, setShowDelete] = useState(false);

  // =========================
  // PRIMARY ACTION
  // =========================
  const handlePrimaryAction = () => {
    if (isConnected) {
      onManage?.(tool);
    } else {
      onConnect?.(tool);
    }
  };

  // =========================
  // TOGGLE
  // =========================
  const handleToggle = async (value: boolean) => {
    if (!isConnected || toggleLoading) return;
    await onToggleActive?.(tool, value);
  };

  // =========================
  // DELETE CONFIRM
  // =========================
  const handleDelete = () => {
    setShowDelete(true);
  };

  console.log("Tool Logo: ", tool.logo);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.logoBox}>
            {tool.logo ? (
              tool.logo.endsWith(".svg") ? (
                <SvgUri
                  uri={tool.logo}
                  width={25}
                  height={25}
                />
              ) : (
                <Image
                  source={{ uri: tool.logo }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              )
            ) : (
              <Text style={styles.initial}>
                {tool.name?.slice(0, 1)}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.name}>{tool.name}</Text>
            <Text style={styles.category}>
              {tool.category || "—"}
            </Text>
          </View>
        </View>

        <View style={styles.switchBox}>
          {toggleLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          )}

          <AppSwitch
            value={!!tool.active}
            disabled={!isConnected || toggleLoading}
            onValueChange={handleToggle}
            colors={colors}
          />
        </View>
      </View>

      {/* DESCRIPTION */}
      <Text style={styles.desc}>
        {tool.desc || "No description available."}
      </Text>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.button,
            {
              backgroundColor: isConnected
                ? colors.surface
                : colors.primary,
              borderWidth: isConnected ? 1 : 0,
              borderColor: colors.border,
              opacity:
                toggleLoading || deleteLoading ? 0.6 : 1,
            },
          ]}
          disabled={toggleLoading || deleteLoading}
          onPress={handlePrimaryAction}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: isConnected
                  ? colors.text
                  : "#fff",
              },
            ]}
          >
            {isConnected ? "Manage" : "Connect"}
          </Text>
        </TouchableOpacity>

        {/* DELETE */}
        {isConnected && (
          <TouchableOpacity
            style={styles.deleteBtn}
            disabled={toggleLoading || deleteLoading}
            onPress={handleDelete}
          >
            {deleteLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Trash2
                size={18}
                color={colors.error}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      <ConfirmSheet
        visible={showDelete}
        title="Disconnect Tool"
        description={`Are you sure you want to disconnect ${tool.name}?`}
        confirmText="Disconnect"
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          setShowDelete(false);
          await onDelete?.(tool);
        }}
        colors={colors}
      />
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    logoBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    logo: {
      width: 24,
      height: 24,
    },

    initial: {
      fontWeight: "700",
      color: colors.text,
    },

    name: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    category: {
      fontSize: 12,
      color: colors.mutedText,
    },

    switchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    desc: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 10,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },

    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
    },

    buttonText: {
      fontSize: 13,
      fontWeight: "600",
    },

    deleteBtn: {
      padding: 8,
    },
  });