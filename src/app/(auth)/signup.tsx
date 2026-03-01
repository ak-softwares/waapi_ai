import AppPhoneInput from "@/src/component/common/AppPhoneInput";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { signUpSchema } from "@/src/schemas/signUpSchema";
import { darkColors, lightColors } from "@/src/theme/colors";
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
  View
} from "react-native";
import z from "zod";

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { signup, loading } = useAuth();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

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

  const onSubmit = async (data: FormData) => {
    await signup({
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
        <Ionicons name="arrow-back" size={24} color={colors.text} />
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
            placeholderTextColor={colors.placeHolderText}
            cursorColor={colors.cursorColor}
            selectionColor={colors.cursorColor}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {/* Phone */}
      <View
        style={{ marginVertical: 5 }}
      >
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <AppPhoneInput value={value} onChange={onChange} />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
      </View>


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
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={colors.placeHolderText}
            cursorColor={colors.cursorColor}
            selectionColor={colors.cursorColor}
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
          <ActivityIndicator color={colors.butttonText} />
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
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 20,
    },
    input: {
      fontSize: 14,
      fontWeight: "500",
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      marginVertical: 5,
      color: colors.inputText,
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
    buttonText: {
      color: colors.butttonText,
      fontWeight: "600",
    },
    link: {
      fontWeight: "600",
      textDecorationLine: "underline",
      color: colors.link,
    },
    alignCenter: {
      marginTop: 15,
      textAlign: "center",
      color: colors.text,
    },
  });