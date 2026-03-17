import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
}

export async function getUserIdFromToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode<TokenPayload>(token);

    return decoded?.userId || null;
  } catch (error) {
    // console.error("Failed to get userId from token:", error);
    return null;
  }
}