import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";

import AudioIcon from "@/assets/messageIcons/audio.svg";
import CameraIcon from "@/assets/messageIcons/camera.svg";
import DocumentIcon from "@/assets/messageIcons/document-icon.svg";
import GalleryIcon from "@/assets/messageIcons/image.svg";
import LocationIcon from "@/assets/messageIcons/location-icon.svg";
import Template from "@/assets/messageIcons/template-icon.svg";

type ActionItem = {
  key: string;
  label: string;
  renderIcon: () => React.ReactNode;
  onPress?: () => void;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  actions?: ActionItem[];
}

export default function AttachmentSheet({
  visible,
  onClose,
  actions,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  if (!visible) return null;

  const iconSize = 25;

  const defaultActions: ActionItem[] = useMemo(
    () => [
      {
        key: "camera",
        label: "Camera",
        renderIcon: () => <CameraIcon height={iconSize} width={iconSize} />,
      },
      {
        key: "gallery",
        label: "Gallery",
        renderIcon: () => <GalleryIcon height={iconSize} width={iconSize} />,
      },
      {
        key: "location",
        label: "Location",
        renderIcon: () => <LocationIcon height={iconSize} width={iconSize} />,
      },
      {
        key: "document",
        label: "Document",
        renderIcon: () => <DocumentIcon height={iconSize} width={iconSize} />,
      },
      {
        key: "audio",
        label: "Audio",
        renderIcon: () => <AudioIcon height={iconSize} width={iconSize} />,
      },
      {
        key: "template",
        label: "Template",
        renderIcon: () => <Template height={iconSize} width={iconSize} />,
      },
    ],
    []
  );

  const finalActions = actions ?? defaultActions;

  return (
    <>
      {/* Overlay */}
      <Pressable
        style={[styles.overlay]}
        onPress={onClose}
      />

      {/* Sheet */}
      <View style={styles.sheet}>
        <View style={styles.grid}>
          {finalActions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => {
                item.onPress?.();
                onClose();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>{item.renderIcon()}</View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      // backgroundColor: colors.messageBackgroundSecond,
      zIndex: 10,
    },

    sheet: {
      position: "absolute",
      bottom: 75,
      left: 10,
      right: 10,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.messageCard,
      paddingHorizontal: 8,
      paddingTop: 20,
      paddingBottom: 15,
      zIndex: 11,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 14,
    },

    item: {
      width: "33%",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },

    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBackground,
    },

    label: {
      color: colors.secondaryText || colors.text,
      fontSize: 12,
      fontWeight: "500",
    },
  });