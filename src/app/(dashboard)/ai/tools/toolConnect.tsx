import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { router, Stack, useLocalSearchParams } from "expo-router";

import { useEditTool } from "@/src/hooks/tools/useEditTool";
import { useTools } from "@/src/hooks/tools/useTools";
import { api } from "@/src/lib/api/apiClient";

import {
  ToolCatalog,
  ToolCredentialType,
  ToolPasswordMasking,
  ToolPayload,
  ToolStatus,
} from "@/src/types/Tool";

import { AppSwitch } from "@/src/components/common/AppSwitch";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

type Mode = "connect" | "edit";

export default function ToolConnectScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const params = useLocalSearchParams();
  const toolId = params.toolId as string;
  const mode: Mode = (params.mode as Mode) || "connect";

  const { tools, setTools } = useTools();
  const { createTool, updateTool } = useEditTool();

  const tool: ToolCatalog | undefined = tools.find(
    (t) => t.id === toolId
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] =
    useState<Record<string, string>>({});
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const isOAuth = tool?.authType === "oauth";

  // =========================
  // INIT VALUES
  // =========================
  useEffect(() => {
    if (!tool) return;

    const creds: Record<string, string> = {};

    tool.credentials?.forEach((f: any) => {
      creds[f.key] =
        f.value === ToolPasswordMasking.MASKED
          ? ""
          : f.value || "";
    });

    setValues(creds);
    setInitialValues(creds);
    setActive(mode === "connect" ? true : tool.active ?? true);
  }, [tool, mode]);

  // =========================
  // INPUT HELPERS
  // =========================
  const getKeyboard = (type: ToolCredentialType) => {
    switch (type) {
      case ToolCredentialType.EMAIL:
        return "email-address";
      case ToolCredentialType.NUMBER:
        return "numeric";
      case ToolCredentialType.URL:
        return "url";
      default:
        return "default";
    }
  };

  const isSecure = (type: ToolCredentialType) => {
    return [
      ToolCredentialType.PASSWORD,
      ToolCredentialType.KEY,
      ToolCredentialType.SECRET,
      ToolCredentialType.TOKEN,
    ].includes(type);
  };

  // =========================
  // SAVE
  // =========================
  const handleSave = async () => {
    if (!tool) return;

    setLoading(true);

    try {
      const changed: Record<string, string> = {};

      Object.entries(values).forEach(([k, v]) => {
        if ((initialValues[k] || "") !== v) {
          changed[k] = v;
        }
      });

      const activeChanged = active !== tool.active;

      let result;

      if (mode === "connect") {
        const payload: ToolPayload = {
          id: tool.id,
          name: tool.name,
          category: tool.category,
          active,
          status: ToolStatus.CONNECTED,
          credentials: values,
        };

        result = await createTool(payload);
      } else {
        if (!tool._id) return;

        if (!activeChanged && Object.keys(changed).length === 0) {
          router.back();
          return;
        }

        const payload: ToolPayload = {
          id: tool.id,
          ...(activeChanged ? { active } : {}),
          ...(Object.keys(changed).length > 0
            ? { credentials: changed }
            : {}),
        };

        result = await updateTool(tool._id, payload);
      }

      if (!result) return;

      // ✅ UPDATE LOCAL STATE (LIKE NEXTJS)
      setTools((prev) =>
        prev.map((t) =>
          t.id === result.id
            ? {
                ...t,
                _id: result._id,
                active: result.active,
                status: result.status,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                credentials: t.credentials.map((cred) => ({
                  ...cred,
                  value: result.credentials?.[cred.key] ?? "",
                })),
              }
            : t
        )
      );

      router.back();
    } catch (e) {
      console.log("Save tool failed", e);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OAUTH
  // =========================
  const handleOAuth = async () => {
    if (!tool) return;

    try {
      const res = await api.get(`/oauth/google?tool=${tool.id}`);
      const url = res.data?.data;

      if (url) {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.log("OAuth error", e);
    }
  };

  if (!tool) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const title =
    mode === "edit"
      ? `Manage ${tool.name}`
      : `Connect ${tool.name}`;

  // =========================
  // UI
  // =========================
  return (
    <>
      <Stack.Screen options={{ title }} />

      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            {tool.logo && (
              <Image
                source={{ uri: tool.logo }}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>
              {tool.desc ||
                "Add credentials to connect this tool."}
            </Text>
          </View>
        </View>

        {/* OAUTH */}
        {isOAuth ? (
          <TouchableOpacity
            style={styles.oauthBtn}
            onPress={handleOAuth}
          >
            <Text style={styles.oauthText}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {tool.credentials?.map((field: any) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedText}
                  value={values[field.key]}
                  secureTextEntry={isSecure(field.type)}
                  keyboardType={getKeyboard(field.type)}
                  onChangeText={(text) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.key]: text,
                    }))
                  }
                />
              </View>
            ))}
          </>
        )}

        {/* ACTIVE TOGGLE */}
        <View style={styles.activeBox}>
          <View>
            <Text style={styles.label}>
              Integration Status
            </Text>
            <Text style={styles.small}>
              Turn off without disconnecting
            </Text>
          </View>

          <AppSwitch
            value={active}
            onValueChange={setActive}
            colors={colors}
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {mode === "edit"
                ? "Save Changes"
                : "Save & Connect"}
            </Text>
          )}
        </TouchableOpacity>
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

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    header: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },

    logoBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    desc: {
      fontSize: 13,
      color: colors.mutedText,
      marginTop: 2,
    },

    field: {
      marginBottom: 14,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
    },

    activeBox: {
      marginTop: 10,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    small: {
      fontSize: 12,
      color: colors.mutedText,
    },

    saveBtn: {
      marginTop: 24,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
    },

    saveText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },

    oauthBtn: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 20,
    },

    oauthText: {
      color: "#fff",
      fontWeight: "600",
    },
  });