import { useAuth } from "@/src/context/AuthContext";
import { signInSchema } from "@/src/schemas/signInSchema";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as z from "zod";

type FormData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const router = useRouter();
  const { signin, loading } = useAuth();

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

  // ✅ Submit Handler
  const onSubmit = async (data: FormData) => {
    const success = await signin({
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
        <AntDesign name="mobile" size={20} />
        <Text style={styles.outlineText}>Continue with Phone</Text>
      </TouchableOpacity>

      {/* Google Login */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.socialButton]}
        onPress={() => console.log("Google Sign In")}
      >
        <AntDesign name="google" size={20} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#111",
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
    color: "#111",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
  },
  outlineText: {
    color: "#111",
    fontWeight: "600",
  },
  link: {
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline"
  },
  alignCenter: {
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
    backgroundColor: "#ddd",
  },

  orText: {
    marginHorizontal: 10,
    color: "#666",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
});
