import AppPhoneInput from "@/src/components/common/phoneInput/AppPhoneInput";
import { useTheme } from "@/src/context/ThemeContext";
import { useOtpLogin } from "@/src/hooks/auth/useOtpLogin";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const { sendOtp, loading } = useOtpLogin();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const onSubmit = async () => {
    const res = await sendOtp(phone);

    if (res.success) {
      router.push({
        pathname: "/verify-otp",
        params: { phone },
      });
    }
  };

  const onGoogleSignIn = () => {
    console.log("Google login");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Login with Phone</Text>
      <Text style={styles.subtitle}>
        Enter your mobile number to continue
      </Text>

      <AppPhoneInput value={phone} onChange={setPhone} autoFocus={true} />
      <View style={{ marginBottom: 5 }} />

      {/* WhatsApp Login */}
      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.butttonText} />
        ) : (
          <Text style={styles.buttonText}>Login with WhatsApp</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Email Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.push("/(auth)/signin")}
      >
        <Ionicons name="mail-outline" size={20} color={colors.text} />
        <Text style={[styles.outlineText, { marginLeft: 10 }]}>
          Login with Email and Password
        </Text>
      </TouchableOpacity>

      {/* Google Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={onGoogleSignIn}
      >
        <Ionicons name="logo-google" size={20} color={colors.text} />
        <Text style={[styles.outlineText, { marginLeft: 10 }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/signup")}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    backButton: {
      position: "absolute",
      top: 50,
      left: 20,
      zIndex: 10,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 20,
    },
    button: {
      borderWidth: 1,
      borderColor: colors.buttonBorder,
      backgroundColor: colors.buttonBackground,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginVertical: 5,
      flexDirection: "row",
      justifyContent: "center",
    },
    buttonText: {
      color: colors.butttonText,
      fontWeight: "600",
    },
    outlineButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.buttonBorder,
    },
    outlineText: {
      color: colors.text,
      fontWeight: "600",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    orText: {
      marginHorizontal: 10,
      color: colors.mutedText,
    },
    footerText: {
      marginTop: 20,
      textAlign: "center",
      color: colors.mutedText,
    },
    link: {
      textDecorationLine: "underline",
      fontWeight: "600",
      color: colors.link,
    },
  });