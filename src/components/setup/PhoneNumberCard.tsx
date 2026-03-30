import { lightColors } from "@/src/theme/colors";
import { WabaPhoneNumber } from "@/src/types/WabaAccount";
import { Trash2 } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PhoneNumberCard({
  phoneNumber,
  allDone,
  requestCodeLoading,
  onVerifyPhone,
  deleting,
  onDelete,
  colors,
}: {
  phoneNumber: WabaPhoneNumber;
  allDone: boolean;
  requestCodeLoading: boolean;
  onVerifyPhone: () => void;
  deleting: boolean;
  onDelete: () => void;
  colors: typeof lightColors;
}) {
  const styles = getStyles(colors);

  return (
    <View style={styles.phoneCard}>
      <Text style={styles.phoneText}>
        Name: {phoneNumber?.verified_name || "Not set"}
      </Text>

      <Text style={styles.phoneText}>
        Phone: {phoneNumber?.display_phone_number || "N/A"}
      </Text>

      <Text style={styles.phoneText}>
        Quality: {phoneNumber?.quality_rating || "Unknown"}
      </Text>

      <Text style={styles.phoneText}>
        Onboarded:{" "}
        {phoneNumber?.last_onboarded_time
          ? new Date(phoneNumber.last_onboarded_time).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A"}
      </Text>

      <View style={styles.row}>
        {phoneNumber?.code_verification_status !== "VERIFIED" && !allDone && (
          <TouchableOpacity
            style={[
              styles.outlineButton,
              requestCodeLoading && styles.disabledButton,
            ]}
            disabled={requestCodeLoading}
            onPress={onVerifyPhone}
          >
            <Text style={styles.outlineButtonText}>
              {requestCodeLoading ? "Sending..." : "Verify Phone"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleting && styles.disabledButton,
          ]}
          onPress={onDelete}
          disabled={deleting}
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    phoneCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
      padding: 10,
      gap: 6,
    },
    phoneText: {
      color: colors.text,
      fontSize: 13,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    outlineButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    deleteButton: {
      borderWidth: 1,
      borderColor: "#FCA5A5",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: "rgba(239,68,68,0.08)",
    },
    disabledButton: {
      opacity: 0.6,
    },
  });