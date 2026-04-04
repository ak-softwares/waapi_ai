import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "expo-router";
import { LogOut, MoreVertical } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { z } from "zod";

import AppMenu from "@/src/components/common/AppMenu";
import ConfirmSheet from "@/src/components/common/ConfirmSheet";
import AppPhoneInput from "@/src/components/common/phoneInput/AppPhoneInput";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useProfile } from "@/src/hooks/profile/useProfile";
import { useProfileMutation } from "@/src/hooks/profile/useProfileMutation";
import { profileSchema } from "@/src/schemas/profileSchema";
import { darkColors, lightColors } from "@/src/theme/colors";

type FormData = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { updateProfile, deleteProfile, loading } = useProfileMutation();

  const [showDelete, setShowDelete] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const { logout } = useAuth();

  const handleLogout = () => {
    setShowLogout(true);
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // ================= LOAD PROFILE =================

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: String(profile.phone) ?? "",
      });
    }
  }, [profile, reset]);

  // ================= HEADER =================

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <AppMenu
            trigger={<MoreVertical size={22} color={colors.text} />}
            items={[
              // {
              //   label: "Forgot Password",
              //   icon: <KeyRound size={18} color={colors.text} />,
              //   onPress: onForgotPassword,
              // },
              {
                label: "Logout",
                icon: <LogOut size={18} color={colors.text} />,
                onPress: handleLogout,
              },
            ]}
          />
        </View>
      ),
    });
  }, [navigation, colors, refreshProfile]);

  // ================= ACTIONS =================

  const onSubmit = async (values: FormData) => {
    await updateProfile(values);
  };
  
  const onDeleteAccount = () => {
    setShowDelete(true);
  };

  // ================= INITIAL LOADING =================

  if (profileLoading && !profile) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.mutedText }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // ================= UI =================

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={profileLoading}
          onRefresh={refreshProfile}
          tintColor={colors.primary}
        />
      }
    >
      {/* ===== CARD ===== */}
      <View style={styles.card}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.mutedText}
              editable={!profileLoading}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.error}>{errors.name.message}</Text>
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              style={styles.input}
              placeholder="Enter email"
              keyboardType="email-address"
              placeholderTextColor={colors.mutedText}
              editable={!profileLoading}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <AppPhoneInput
              key={profile?._id ?? "phone"}   // ✅ stable key
              value={value ?? ""}   // ✅ safe fallback
              onChange={(val: string) => onChange(val ?? "")}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.error}>{errors.phone.message}</Text>
        )}
      </View>

      {/* ===== SAVE BUTTON ===== */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: loading || profileLoading ? 0.6 : 1,
          },
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading || profileLoading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>

      {/* ===== DELETE ACCOUNT ===== */}
      <TouchableOpacity
        onPress={onDeleteAccount}
        disabled={loading || profileLoading}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>
          {loading ? "Deleting..." : "Delete Account"}
        </Text>
      </TouchableOpacity>

      {/* ===== CONFIRM SHEET ===== */}
      <ConfirmSheet
        visible={showDelete}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action is irreversible."
        confirmText="Delete"
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          setShowDelete(false);
          await deleteProfile?.();
        }}
        colors={colors}
      />
      <ConfirmSheet
        visible={showLogout}
        title="Logout"
        description={"Are you sure you want to logout?"}
        confirmText="Logout"
        onCancel={() => setShowLogout(false)}
        onConfirm={async () => {
          setShowLogout(false);
          await logout();
        }}
        colors={colors}
      />
    </ScrollView>
  );
}

// ================= STYLES =================

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },

    loaderContainer: {
      justifyContent: "center",
      alignItems: "center",
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
    },

    label: {
      fontSize: 13,
      color: colors.mutedText,
      marginBottom: 6,
      marginTop: 10,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 14,
    },

    error: {
      color: colors.error,
      marginTop: 6,
      fontSize: 12,
    },

    button: {
      marginTop: 10,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },

    deleteButton: {
      marginTop: 20,
      alignItems: "center",
      paddingVertical: 12,
    },

    deleteButtonText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: "600",
    },
  });