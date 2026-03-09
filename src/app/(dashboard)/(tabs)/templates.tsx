import TemplateTile from "@/src/components/templates/widgets/TemplateTile";
import { useTheme } from "@/src/context/ThemeContext";
import { useTemplates } from "@/src/hooks/template/useTemplates";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
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
        <Search size={18} color={colors.placeHolderText} />
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
                pathname: "/(dashboard)/template/TemplateViewScreen",
                  params: {
                    template: JSON.stringify(item),
                  },
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
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      marginBottom: 12,
      gap: 8,
      marginHorizontal: 15,
    },

    searchInput: {
      flex: 1,
      paddingVertical: 11,
      color: colors.text,
      fontSize: 14,
    },
  });