import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  variables?: string[];
};

export default function VariableInput({
  value,
  onChange,
  placeholder,
  variables = [],
}: Props) {
  const insertVariable = (variable: string) => {
    const variableTag = `{{${variable}}}`;
    onChange((value || "") + variableTag);
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        style={styles.input}
      />

      {/* Variable chips */}
      <View style={styles.variableRow}>
        {variables.map((v) => (
          <Pressable
            key={v}
            style={styles.chip}
            onPress={() => insertVariable(v)}
          >
            <Text style={styles.chipText}>{`{{${v}}}`}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  variableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#e6f7ec",
    borderRadius: 20,
  },
  chipText: {
    color: "#21C063",
    fontWeight: "600",
  },
});