import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import parsePhoneNumberFromString from "libphonenumber-js";
import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";

interface Props {
  value: string;
  onChange: (phone: string) => void;
}

export default function AppPhoneInput({ value, onChange }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const phoneRef = useRef<PhoneInput>(null);

  // ✅ Sync external value (profile load / reset)
  useEffect(() => {
    if (!value || !phoneRef.current) return;

    const parsed = parsePhoneNumberFromString("+" + value);
    const dialCode = parsed?.countryCallingCode || "91"; // ✅ 91

    if (parsed) {
      phoneRef.current.setState({
        code: dialCode,   // ✅ ISO country code (IN)
        number: parsed.nationalNumber,  // ✅ local number
      });
    }
  }, [value]);

  return (
    <PhoneInput
      ref={phoneRef}
      withDarkTheme={theme === "dark"}
      defaultCode="IN"
      layout="first"
      value={value}
      onChangeFormattedText={(text) => {
        const digitsOnly = text.replace(/\D/g, "");
        onChange(digitsOnly);
      }}
      countryPickerProps={{
        preferredCountries: ["IN", "US"],

      }}
      containerStyle={styles.phoneContainer}
      textContainerStyle={styles.phoneTextContainer}
      textInputStyle={styles.phoneTextInput}
      codeTextStyle={styles.codeText}
      textInputProps={{
        cursorColor: colors.cursorColor,
        selectionColor: colors.cursorColor,
        placeholderTextColor: colors.placeHolderText,
      }}
      countryPickerButtonStyle={{
        width: 60,
        justifyContent: "center",
        alignItems: "center",
        
      }}
    />
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    phoneContainer: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      width: "100%",
      height: 50,
      overflow: "hidden",
      backgroundColor: colors.inputBackground,
    },
    phoneTextContainer: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      height: 50,
      paddingVertical: 0,
      backgroundColor: colors.inputBackground,
    },
    phoneTextInput: {
      fontSize: 14,
      fontWeight: "500",
      height: 50,
      paddingVertical: 0,
      color: colors.inputText,
    },
    codeText: {
      marginRight: 2,
      fontSize: 14,
      color: colors.text,
    },
  });