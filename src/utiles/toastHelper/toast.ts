import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  type?: ToastType;
  // title?: string;
  message: string;
}

export const showToast = ({
  type = "success",
  // title,
  message,
}: ToastOptions) => {
  Toast.show({
    type,
    // text1: title,
    text1: message,
  });
};