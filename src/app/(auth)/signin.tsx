import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { signInSchema } from "@/src/schemas/signInSchema";
import { darkColors, lightColors } from "@/src/theme/colors";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as z from "zod";

type FormData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const router = useRouter();
  const { signin, googleSignin, loading } = useAuth();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const { request, promptAsync } = useGoogleAuth(async ({ accessToken }) => {
  //   await googleSignin(accessToken);
  // });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // ✅ Submit Handler
  const onSubmit = async (data: FormData) => {
    await signin({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity> */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Login with your email or Google account
      </Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholderTextColor={colors.placeHolderText}
            selectionColor={colors.cursorColor}
            cursorColor={colors.cursorColor}      // Android
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholderTextColor={colors.placeHolderText}
            selectionColor={colors.cursorColor}
            cursorColor={colors.cursorColor}      // Android
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => router.push("/(auth)/forgotPassword")}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      {/* Login Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Phone Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.socialButton]}
        // onPress={gotoPhoneLogin}
        onPress={() => router.push("/login" as any)}
      >
        <AntDesign name="mobile" size={20} color={colors.text} />
        <Text style={styles.outlineText}>Continue with Phone</Text>
      </TouchableOpacity>

      {/* Google Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.socialButton]}
        onPress={() => promptAsync().catch((err) => console.log("Google Signin Error: ", err))}
        disabled={!request || loading}
      >
        <AntDesign name="google" size={20} color={colors.text} />
        <Text style={styles.outlineText}>
          {loading ? "Signing in..." : "Continue with Google"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.alignCenter}>
        Don't have an account?{" "}
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

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
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
    borderWidth: 1,
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    paddingLeft: 16,
    color: colors.inputText,
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    color: colors.error,
    marginBottom: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.buttonBorder,
    backgroundColor: colors.buttonBackground,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  forgotText: {
    color: colors.link,
    fontWeight: "600",
    textDecorationLine: "underline",
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
  link: {
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
    color: colors.link,
  },
  alignCenter: {
    color: colors.text,
    marginTop: 15,
    textAlign: "center",
  },
  dividerContainer: {
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
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
});
