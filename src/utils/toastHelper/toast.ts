import { Keyboard } from "react-native";
import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  type?: ToastType;
  message: string;
}

export const showToast = ({
  type = "success",
  message,
}: ToastOptions) => {
  // Keyboard.metrics() returns the current keyboard frame
  const keyboardHeight = Keyboard.metrics()?.height ?? 0;
  Toast.show({
    type,
    text1: message,
    position: "bottom",
    visibilityTime: 3000,
    bottomOffset: keyboardHeight > 0 ? keyboardHeight + 20 : 20,
    keyboardOffset: 48,
  });
};