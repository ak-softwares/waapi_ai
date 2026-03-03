import { Switch } from "react-native";

export function AppSwitch({
  value,
  onValueChange,
  disabled,
  colors,
}: any) {
  const thumbOn = "#ffffff";
  const thumbOff = colors.inputBorder || colors.border; // 👈 inactive circle

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        true: colors.primary,
        false: colors.border,
      }}
      thumbColor={value ? thumbOn : thumbOff}
      ios_backgroundColor={colors.border}
    />
  );
}