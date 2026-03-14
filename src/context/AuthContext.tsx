import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useOtpLogin } from "../hooks/auth/useOtpLogin";
import { useSignin } from "../hooks/auth/useSignin";
import { useSignup } from "../hooks/auth/useSignup";
import { usePushDevice } from "../hooks/notifications/usePushDevice";
import { registerForPushNotificationsAsync } from "../lib/notification/notifications";

type SigninParams = {
  email: string;
  password: string;
}

type OtpVerifyParams = {
  phone: string;
  otp: string;
}

type SignupParams = {
  name: string;
  phone: string;
  email?: string;
  password?: string;
};

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  isReady: boolean;

  signin: (params: SigninParams) => Promise<boolean>;
  signup: (params: SignupParams) => Promise<boolean>;

  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (params: OtpVerifyParams) => Promise<boolean>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading: signinLoading, signin: signinHook } = useSignin();
  const { loading: otpLoading, sendOtp, verifyOtp: verifyOtpHook } = useOtpLogin();
  const { loading: signupLoading, signup: signupHook } = useSignup();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const{ registerDevice, unregisterDevice } = usePushDevice();

  const loading = signinLoading || otpLoading || signupLoading;
  
  // ✅ Restore token on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      setIsAuthenticated(!!token);
      setIsReady(true); // ✅ app ready
    };

    checkAuth();
  }, []);

  const registerPush = async () => {
    const pushToken = await registerForPushNotificationsAsync();

    if (!pushToken) return;

    const deviceId = Application.getAndroidId();

    await registerDevice({
      deviceId,
      token: pushToken,
    });
  };

  // ================= SIGNIN ================= //
  const signin = async (params: SigninParams) => {
    const res = await signinHook(params);

    if (res.success && res.data?.token) {
      await AsyncStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);

      // ✅ Register device
      await registerPush();

      return true;
    }

    return false;
  };

  // ================= SIGNUP ================= //
  const signup = async (params: SignupParams) => {
    const res = await signupHook(params);

    if (res.success && res.data?.token) {
      await AsyncStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);

      // ✅ Register device
      await registerPush();

      return true;
    }

    return false;
  };
  
  // ================= OTP LOGIN ================= //
  const verifyOtp = async (params: OtpVerifyParams) => {
    const res = await verifyOtpHook(params);

    if (res.success && res.data?.token) {
      await AsyncStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);
      
      // ✅ Register device
      await registerPush();

      return true;
    }

    return false;
  };

  // ================= LOGOUT ================= //
  const logout = async () => {
    const deviceId = Application.getAndroidId(); // or ios identifier
    await unregisterDevice(deviceId);
    await AsyncStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated,
        signin,
        signup,
        sendOtp,
        verifyOtp,
        logout,
        isReady, // ✅ expose
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
