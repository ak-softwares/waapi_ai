import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform, useColorScheme } from "react-native";

type Theme = "light" | "dark";
type ThemeMode = "system" | Theme;

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_MODE_KEY = "theme_mode";

const ThemeContext = createContext<ThemeContextType | null>(null);

const getStoredThemeMode = async (): Promise<ThemeMode | null> => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const mode = window.localStorage.getItem(THEME_MODE_KEY);
    return mode === "system" || mode === "light" || mode === "dark" ? mode : null;
  }

  const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
  return mode === "system" || mode === "light" || mode === "dark" ? mode : null;
};

const saveThemeMode = async (mode: ThemeMode) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_MODE_KEY, mode);
    return;
  }

  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
};

export const ThemeProvider = ({ children }: any) => {
  const systemTheme = useColorScheme() === "dark" ? "dark" : "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const loadThemeMode = async () => {
      const storedThemeMode = await getStoredThemeMode();
      if (storedThemeMode) {
        setThemeModeState(storedThemeMode);
      }
    };

    loadThemeMode();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    void saveThemeMode(mode);
  };

  const theme = themeMode === "system" ? systemTheme : themeMode;

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
    }),
    [theme, themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};