import React, { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Message } from "@/src/types/Messages";

// SVG Icon
import LocationIcon from "@/assets/messageIcons/location-icon.svg";

interface Props {
  message: Message;
}

export default function LocationMessage({ message }: Props) {
  const lat = message.location?.latitude;
  const lng = message.location?.longitude;

  const name = message.location?.name || "Location";
  const address = message.location?.address || "";

  const [error, setError] = useState(false);

  const hasValidLocation =
    lat !== undefined && lat !== null && lng !== undefined && lng !== null;

  const mapUrl = hasValidLocation
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : undefined;

  const staticMap = hasValidLocation
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red|${lat},${lng}`
    : undefined;

  const openMap = () => {
    if (!mapUrl) return;
    Linking.openURL(mapUrl);
  };

  /* ---------------- FALLBACK ---------------- */

  if (!hasValidLocation || error) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.fallbackBox} onPress={openMap}>
          <LocationIcon width={60} height={60} />
        </Pressable>

        <Text style={styles.title}>{name}</Text>

        {!!address && <Text style={styles.address}>{address}</Text>}
      </View>
    );
  }

  /* ---------------- MAIN ---------------- */

  return (
    <View style={styles.container}>
      <Pressable onPress={openMap}>
        <Image
          source={{ uri: staticMap }}
          style={styles.mapImage}
          resizeMode="cover"
          onError={() => setError(true)}
        />
      </Pressable>

      <Text style={styles.title}>{name}</Text>

      {!!address && <Text style={styles.address}>{address}</Text>}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
    width: 260,
  },

  mapImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },

  fallbackBox: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#DCF8C6",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
    fontSize: 14,
  },

  address: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
});