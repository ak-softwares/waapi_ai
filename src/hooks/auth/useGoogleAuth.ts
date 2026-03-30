import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthPayload = {
  accessToken: string;
  idToken?: string;
};

export function useGoogleAuth(
  onSuccess: (payload: GoogleAuthPayload) => Promise<void> | void,
) {
  const config = Constants.expoConfig?.extra;
  // const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || config?.googleWebClientId
  const [request, response, promptAsync] = Google.useAuthRequest({
    // clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

    // scopes: ["openid", "profile", "email"],
    // ✅ THIS IS THE FIX
    // redirectUri: "https://auth.expo.io/@waapi.me/waapi_ai",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      const idToken = response.authentication?.idToken;
      console.log("accessToken: ", accessToken, "idToken: ", idToken)
      if (!accessToken) return;

      onSuccess({
        accessToken,
        idToken,
      });
    }
  }, [response]);

  return {
    request,
    promptAsync,
  };
}