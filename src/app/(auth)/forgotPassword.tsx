import { useTheme } from "@/src/context/ThemeContext";
import { useForgotPassword } from "@/src/hooks/auth/useForgotPassword";
import { forgotPasswordSchema } from "@/src/schemas/forgotPassword";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as z from "zod";

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendResetLink, loading, counter } = useForgotPassword();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await sendResetLink({ email: data.email });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.subtitle}>
        Enter your email and we’ll send a reset link.
      </Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor={colors.placeHolderText}
            cursorColor={colors.cursorColor}
            selectionColor={colors.cursorColor}
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && (
        <Text style={styles.error}>{errors.email.message}</Text>
      )}

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        disabled={loading || counter > 0}
        onPress={handleSubmit(onSubmit)}
      >
        {loading ? (
          <ActivityIndicator color={colors.butttonText} />
        ) : (
          <Text style={styles.buttonText}>
            {counter > 0
              ? `Resend mail in ${counter}s`
              : "Send Reset Link"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
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
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      color: colors.inputText,
    },
    error: {
      color: colors.error,
      marginBottom: 10,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginVertical: 10,
    },
    buttonText: {
      color: colors.butttonText,
      fontWeight: "600",
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