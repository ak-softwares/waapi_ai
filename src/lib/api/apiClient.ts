import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constans/apiConstans";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    // skip auth routes
    const isAuthRoute =
      config.url?.includes("/auth/signin") ||
      config.url?.includes("/auth/signup") ||
      config.url?.includes("/auth/send-otp") ||
      config.url?.includes("/auth/verify-otp") ||
      config.url?.includes("/auth/forgot-password");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
