import Group from "@/assets/icons/group.svg";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Image, StyleSheet, Text, View } from "react-native";

interface UserAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
  isGroup?: boolean;
}

const LIGHT_COLORS = [
  { bg: "#E8F5E9", text: "#2E7D32" },
  { bg: "#E3F2FD", text: "#1565C0" },
  { bg: "#FFF3E0", text: "#EF6C00" },
  { bg: "#F3E5F5", text: "#7B1FA2" },
  { bg: "#FCE4EC", text: "#C2185B" },
  { bg: "#E0F2F1", text: "#00695C" },
  { bg: "#F1F8E9", text: "#558B2F" },
  { bg: "#EDE7F6", text: "#4527A0" },
];

const DARK_COLORS = [
  { bg: "#1F3A28", text: "#7DDB94" },
  { bg: "#1A314A", text: "#7EB9F7" },
  { bg: "#4A2E19", text: "#FFBD80" },
  { bg: "#3A2143", text: "#D6A6F5" },
  { bg: "#4A1F32", text: "#F39AC0" },
  { bg: "#173A39", text: "#7CD6CF" },
  { bg: "#2E3A1A", text: "#C3E07A" },
  { bg: "#2C2452", text: "#B8A6FF" },
];

const getColorPair = (seed: string | undefined, isDark: boolean) => {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  if (!seed) return palette[0];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
};

export default function UserAvatar({
  name,
  imageUrl,
  size = 42,
  isGroup = false,
}: UserAvatarProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  const { bg, text } = getColorPair(name, theme === "dark");

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderColor: "transparent",
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : isGroup ? (
        <Group  
          width={size * 0.9}
          height={size * 0.9}
          fill={text} 
        />
        // <Users size={size * 0.4} color={text} />
      ) : (
        <Text style={[styles.text, { color: text, fontSize: size * 0.42 }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },

  text: {
    fontWeight: "700",
  },
});