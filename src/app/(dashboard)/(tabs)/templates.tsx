import TemplateTile from "@/src/component/templates/widgets/TemplateTile";
import { useTheme } from "@/src/context/ThemeContext";
import { useTemplates } from "@/src/hooks/template/useTemplates";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View
} from "react-native";

export default function Templates() {
  const {
    templates,
    loading,
    loadingMore,
    loadMore,
    refreshTemplates,
    searchTemplates,
  } = useTemplates();

  const [search, setSearch] = useState("");

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const handleSearch = (text: string) => {
    setSearch(text);
    searchTemplates(text);
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search templates..."
          placeholderTextColor={colors.placeHolderText}
          cursorColor={colors.cursorColor}
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <TemplateTile
            template={item}
            onPress={() =>
              router.push({
                pathname: "/(dashboard)/messages",
                params: { id: item.id },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} />
          ) : null
        }
        refreshing={loading}
        onRefresh={refreshTemplates}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 10,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
    },

    addText: {
      color: "#fff",
      fontWeight: "600",
    },

    searchContainer: {
      paddingHorizontal: 15,
      paddingBottom: 10,
    },

    searchInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 999,
      paddingHorizontal: 20,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.inputText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
  });