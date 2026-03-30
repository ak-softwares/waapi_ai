import { lightColors } from "@/src/theme/colors";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  colors: typeof lightColors;
  onPress: () => void;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
};

export default function FacebookConnectCard({
  colors,
  onPress,
  subtitle,
  style,
}: Props) {
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.title}>Connect your number</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      // marginHorizontal: 10,
      marginTop: 10,
      padding: 12,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      // notification style
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    content: {
      flex: 1,
      paddingRight: 10,
    },

    title: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },

    subtitle: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },

    button: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },

    buttonText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.onPrimary,
    },
  });