import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfirmSheet({
  visible,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  colors,
}: any) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>

          {description && (
            <Text style={[styles.desc, { color: colors.mutedText }]}>
              {description}
            </Text>
          )}

          <TouchableOpacity
            style={styles.action}
            onPress={onConfirm}
          >
            <Text style={[styles.deleteText, { color: colors.error }]}>
              {confirmText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.action, styles.cancelBtn]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  sheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  action: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtn: {
    marginTop: 6,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
  },
});