import AppPhoneInput from "@/src/component/common/AppPhoneInput";
import { useOtpLogin } from "@/src/hooks/auth/useOtpLogin";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const { sendOtp, loading } = useOtpLogin();

  // Send OTP
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
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Login with Phone</Text>
      <Text style={styles.subtitle}>
        Enter your mobile number to continue
      </Text>

      {/* Phone Input */}
      <AppPhoneInput
        value={phone}
        onChange={setPhone}
      />

      {/* WhatsApp Login */}
      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
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
        <Ionicons name="mail-outline" size={20} color="#000" />
        <Text style={[styles.outlineText, { marginLeft: 10 }]}>
          Login with Email and Password
        </Text>
      </TouchableOpacity>

      {/* Google Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={onGoogleSignIn}
      >
        <Ionicons name="logo-google" size={20} />
        <Text style={[styles.outlineText, { marginLeft: 10 }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Signup */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
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
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  outlineText: {
    color: "#111",
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
    backgroundColor: "#ddd",
  },
  orText: {
    marginHorizontal: 10,
    color: "#666",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
  link: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
