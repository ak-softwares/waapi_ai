import AppPhoneInput from "@/src/component/common/AppPhoneInput";
import { useAuth } from "@/src/context/AuthContext";
import { signUpSchema } from "@/src/schemas/signUpSchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { signup, loading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  // ✅ Submit Handler
  const onSubmit = async (data: FormData) => {
    const success = await signup({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Enter your details to get started.
      </Text>

      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            keyboardType="default"
            autoCapitalize="words"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {/* Phone */}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <AppPhoneInput
            value={value}
            onChange={onChange}
          />
        )}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

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

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.alignCenter}>
        Already have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/signin")}
        >
          Login
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

