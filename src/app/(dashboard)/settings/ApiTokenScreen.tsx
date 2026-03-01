import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";
import { Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ConfirmSheet from "@/src/component/common/ConfirmSheet";
import { useTheme } from "@/src/context/ThemeContext";
import { useApiToken } from "@/src/hooks/apiToken/useApiToken";
import { darkColors, lightColors } from "@/src/theme/colors";

export default function ApiTokenScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { apiToken, loading, generateNewToken, revokeToken, refetch } =
    useApiToken(true);

  const [rawToken, setRawToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  const confirmDelete = async () => {
    if (!apiToken) return;
    await revokeToken(apiToken._id);
  };

  const confirmGenerate = async () => {
    const token = await generateNewToken();
    setRawToken(token);
  };

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch?.(); // call hook refresh if exists
    setRefreshing(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "API Token",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wa-api.me/docs")}
              style={{
                marginRight: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, marginRight: 4 }}>Docs</Text>
              <ExternalLink size={16} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* RAW TOKEN */}
            {rawToken && (
              <View style={styles.card}>
                <Text style={styles.label}>
                  New Token (copy now, won't show again)
                </Text>

                <View style={styles.row}>
                  <TextInput
                    value={rawToken}
                    editable={false}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => copy(rawToken)}
                  >
                    <Copy size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* EXISTING TOKEN */}
            <View style={styles.card}>
              <Text style={styles.label}>Your API Token</Text>

              {apiToken ? (
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>
                      {apiToken.name || "Default"}
                    </Text>

                    <Text style={styles.meta}>
                      Generated At:{" "}
                      {new Date(apiToken.updatedAt || "").toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setShowDelete(true)}
                  >
                    <Trash2 size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.meta}>No token generated yet</Text>
              )}
            </View>

            {/* GENERATE BUTTON */}
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={() => setShowGenerate(true)}
            >
              <RefreshCw size={18} color="#fff" />
              <Text style={styles.generateText}>Generate New Token</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      {/* DELETE CONFIRM */}
      <ConfirmSheet
        visible={showDelete}
        title="Delete Token"
        description="Are you sure you want to delete this API token? Existing integrations will stop working."
        confirmText="Delete"
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          setShowDelete(false);
          await confirmDelete();
        }}
        colors={colors}
      />

      {/* GENERATE CONFIRM */}
      <ConfirmSheet
        visible={showGenerate}
        title="Generate New Token"
        description="Generating a new token will invalidate the previous one. Continue?"
        confirmText="Generate"
        onCancel={() => setShowGenerate(false)}
        onConfirm={async () => {
          setShowGenerate(false);
          await confirmGenerate();
        }}
        colors={colors}
      />
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

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 12,
    },

    label: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },

    title: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    meta: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: colors.text,
    },

    iconBtn: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 8,
    },

    deleteBtn: {
      backgroundColor: "#E53935",
      padding: 10,
      borderRadius: 8,
    },

    generateBtn: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
      borderRadius: 10,
      marginBottom: 12,
      gap: 8,
    },

    generateText: {
      color: "#fff",
      fontWeight: "600",
    },
  });