import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import parsePhoneNumberFromString from "libphonenumber-js";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { CountryCode, isCountryCode } from "react-native-country-picker-modal";
import PhoneInput from "react-native-phone-number-input";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Props {
  value: string;
  onChange: (phone: string) => void;
  autoFocus?: boolean;
  stopCountryCode?: boolean;
}

export default function AppPhoneInput({ value, onChange, autoFocus = false, stopCountryCode = false }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const phoneRef = useRef<PhoneInput>(null);

  // ✅ Sync external value (profile load / reset)
  useEffect(() => {
    if (!value || !phoneRef.current) return;

    const parsed = parsePhoneNumberFromString("+" + value);
    const dialCode = parsed?.countryCallingCode || "91";

    if (parsed) {
      phoneRef.current.setState({
        code: dialCode,   // ✅ ISO country code (IN)
        number: parsed.nationalNumber,  // ✅ local number
      });
    }
  }, [value]);

  // Auto-detect default country only when there is no phone value
  // and country-code auto detection is not disabled.
  useEffect(() => {
    if (value || stopCountryCode) return;

    let isMounted = true;

    fetch("https://ipwho.is/")
      .then(async (res) => {
        const text = await res.text();

        try {
          const data = JSON.parse(text);

          if (!isMounted || stopCountryCode) return;
          if (data?.success && data?.country_code) {
            const detectedCode = data.country_code.toUpperCase();

            if (isCountryCode(detectedCode)) {
              setCountryCode(detectedCode);
            }
          }
        } catch (err) {
          console.log("Invalid JSON response:", text);
        }
      })
      .catch((err) => {
        if (isMounted && !stopCountryCode) {
          setCountryCode("IN");
        }
      });
    return () => {
      isMounted = false;
    };
  }, [value, stopCountryCode]);

  return (
    <PhoneInput
      key={countryCode}
      ref={phoneRef}
      withDarkTheme
      autoFocus={autoFocus}
      defaultCode={countryCode}
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
      renderDropdownImage={
        <Icon
          name="arrow-drop-down"
          size={22}
          color={theme === "dark" ? "#fff" : "#000"} // ✅ dynamic color
        />
      }
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