import React from "react";
import { StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";

interface Props {
  value: string;
  onChange: (phone: string) => void;
}

export default function AppPhoneInput({ value, onChange }: Props) {
  return (
    <PhoneInput
      defaultCode="IN"
      layout="first"
      value={value}
      onChangeFormattedText={(text) => {
        const digitsOnly = text.replace(/\D/g, ""); // remove +, space, etc
        onChange(digitsOnly);
      }}
      containerStyle={styles.phoneContainer}
      textContainerStyle={styles.phoneTextContainer}
      textInputStyle={styles.phoneTextInput}
      codeTextStyle={styles.codeText}
    />
  );
}

const styles = StyleSheet.create({
  phoneContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: "100%",
    height: 50,
    overflow: "hidden",
  },
  phoneTextContainer: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    height: 50,
    paddingVertical: 0,
  },
  phoneTextInput: {
    fontSize: 14,
    fontWeight: "500",
    height: 50,
    paddingVertical: 0,
  },
  codeText: {
    marginRight: 2,
    fontSize: 14,
  },
});