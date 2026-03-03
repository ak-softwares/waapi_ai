import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

interface Props {
  trigger: React.ReactNode;
  items: MenuItem[];
}

export default function AppMenu({ trigger, items }: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const styles = getStyles(colors);

  return (
    <Menu>
      <MenuTrigger>{trigger}</MenuTrigger>

      <MenuOptions customStyles={{ optionsContainer: styles.container }}>
        {items.map((item, index) => (
          <MenuOption
            key={index}
            onSelect={item.onPress}
            customStyles={{
              optionWrapper: styles.optionWrapper,
            }}
          >
            <View style={styles.item}>
              {item.icon}
              <Text style={styles.text}>{item.label}</Text>
            </View>
          </MenuOption>
        ))}
      </MenuOptions>
    </Menu>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    },

    optionWrapper: {
      borderRadius: 8,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    text: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
  });