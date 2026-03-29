import { useTheme } from "@/src/context/ThemeContext";
import { useDebounce } from "@/src/hooks/debounce/useDebounce";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Search, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  delay?: number;
  disablePadding?: boolean;
}

// 🔢 Normalize phone (same logic)
export const normalizePhoneForSearch = (value: string) => {
  if (!value) return "";

  let digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    digits = "91" + digits;
  }

  return digits;
};

export default function SearchBar({
  value,
  placeholder = "Search...",
  onSearch,
  delay = 500,
  disablePadding = false,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState(false);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors, disablePadding);

  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // sync external value
  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  // 🔍 Debounced search
  useEffect(() => {
    if (!onSearch) return;

    const q = debouncedSearchTerm.trim();
    const normalizedPhone = normalizePhoneForSearch(q);

    const finalQuery = normalizedPhone || q;
    onSearch(finalQuery);
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch?.("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        
        {/* 🔍 Icon */}
        <Search size={18} style={styles.searchIcon} />

        {/* 📝 Input */}
        <TextInput
          placeholder={placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        {/* ❌ Clear */}
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <X size={18} style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors, disablePadding: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: disablePadding ? 0 : 16,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    gap: 8,
  },
  searchIcon: {
    width: 18,
    height: 18,
    opacity: 0.8,
    color: colors.inputText,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    color: colors.inputText,
  },
  clearIcon: {
    width: 16,
    height: 16,
    opacity: 0.8,
    color: colors.inputText,
  },
});