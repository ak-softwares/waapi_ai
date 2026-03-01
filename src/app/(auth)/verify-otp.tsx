import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useOtpLogin } from "@/src/hooks/auth/useOtpLogin";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(60);

  const { sendOtp, loading: isResending } = useOtpLogin();
  const { verifyOtp, loading: isVerifing } = useAuth();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  // Countdown
  useEffect(() => {
    if (counter <= 0) return;

    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter]);

  // Resend OTP
  const handleResendOtp = async () => {
    await sendOtp(phone);
    setCounter(60);
  };

  // Verify OTP
  const onSubmit = async () => {
    const success = await verifyOtp({
      phone,
      otp,
    });

    if (!success) {
      alert("Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Verify OTP</Text>

      <Text style={styles.subtitle}>
        Enter the 4-digit code sent to{" "}
        <Text
          style={styles.phone}
          onPress={() =>
            router.push({
              pathname: "/(auth)/login",
              params: { phone },
            })
          }
        >
          {phone}
        </Text>
      </Text>

      {/* OTP Input */}
      <TextInput
        style={styles.input}
        placeholder="XXXX"
        placeholderTextColor={colors.placeHolderText}
        cursorColor={colors.cursorColor}
        selectionColor={colors.cursorColor}
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
      />

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={isVerifing}
      >
        {isVerifing ? (
          <ActivityIndicator color={colors.butttonText} />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      {/* Resend */}
      <View style={{ marginTop: 20 }}>
        {counter > 0 ? (
          <Text style={styles.counter}>
            Resend OTP in {counter}s
          </Text>
        ) : (
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={isResending}
          >
            <Text style={styles.resend}>
              {isResending ? "Resending..." : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Email Login */}
      <Text style={styles.alignCenter}>
        Singin with email instead?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/signin")}
        >
          Sign in
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
      marginBottom: 10,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 20,
    },
    phone: {
      fontWeight: "600",
      textDecorationLine: "underline",
      color: colors.link,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 14,
      marginBottom: 10,
      fontSize: 18,
      textAlign: "center",
      letterSpacing: 8,
      color: colors.inputText,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: colors.butttonText,
      fontWeight: "600",
    },
    counter: {
      textAlign: "center",
      color: colors.mutedText,
    },
    resend: {
      textAlign: "center",
      fontWeight: "600",
      color: colors.link,
    },
    alignCenter: {
      marginTop: 15,
      textAlign: "center",
      color: colors.mutedText,
    },
    link: {
      textDecorationLine: "underline",
      fontWeight: "600",
      color: colors.link,
    },
  });