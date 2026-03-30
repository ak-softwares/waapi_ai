import { lightColors } from "@/src/theme/colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  step: number;
  title: string;
  done: boolean;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  colors: typeof lightColors;
};

export default function StepItem({
  step,
  title,
  done,
  actionLabel,
  onAction,
  disabled,
  colors,
}: Props) {
  const styles = getStyles(colors);

  return (
    <View style={styles.stepRow}>
      {/* Left indicator */}
      <View
        style={[
          styles.stepIndicator,
          { backgroundColor: done ? colors.success : colors.border },
        ]}
      />

      <Text style={styles.stepIndex}>Step {step}</Text>

      <Text style={styles.stepTitle}>{title}</Text>

      <Text style={[styles.stepState, done && styles.stepDone]}>
        {done ? "Done" : "Pending"}
      </Text>

      {!done && (
        <TouchableOpacity
          style={[styles.outlineButton, disabled && styles.disabledButton]}
          onPress={onAction}
          disabled={disabled}
        >
          <Text style={styles.outlineButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    stepRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.background,
      gap: 8,
      position: "relative",

      // subtle card separation
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },

    stepIndicator: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },

    stepIndex: {
      fontSize: 11,
      color: colors.secondaryText,
    },

    stepTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    stepState: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.warning,
    },

    stepDone: {
      color: colors.success,
    },

    outlineButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignSelf: "flex-start",
    },

    outlineButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },

    disabledButton: {
      opacity: 0.6,
    },
  });