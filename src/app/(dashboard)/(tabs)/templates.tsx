import SearchBar from "@/src/components/common/search/SearchBar";
import UserShimmer from "@/src/components/common/user/UserShimmer";
import TemplateTile from "@/src/components/templates/widgets/TemplateTile";
import { useTheme } from "@/src/context/ThemeContext";
import { useFacebookConnectionStatus } from "@/src/hooks/setup/useFacebookConnectionStatus";
import { useTemplates } from "@/src/hooks/template/useTemplates";
import { darkColors, lightColors } from "@/src/theme/colors";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import FacebookConnectCard from "../setup/widgets/FacebookConnectCard";

export default function Templates() {
  const {
    templates,
    loading,
    loadingMore,
    loadMore,
    refreshTemplates,
    searchTemplates,
  } = useTemplates();

  const { isLoadingFacebookStatus, isFacebookConnected } = useFacebookConnectionStatus();
  const [search, setSearch] = useState("");

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Search */}
      <SearchBar
        placeholder="Search template..."
        onSearch={searchTemplates}
      />

      {!isFacebookConnected && !isLoadingFacebookStatus && (
        <FacebookConnectCard
          colors={colors}
          onPress={() => router.push("/(dashboard)/setup/WhatsAppSetupScreen")}
          subtitle="Connect WhatsApp Cloud API before using templates."
        />
      )}

      <FlatList
        data={loading ? [] : templates}
        keyExtractor={(item) => item.id!}
        ListEmptyComponent={
          loading ? <UserShimmer count={10}/> : <Text style={styles.emptyText}>No templates found.</Text>
        }
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
        ListFooterComponent={loadingMore ? <UserShimmer count={2} /> : null}
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
      paddingHorizontal: 10,
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
    emptyText: {
      textAlign: "center",
      marginTop: 60,
      color: colors.mutedText,
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
    searchInput: {
      flex: 1,
      paddingVertical: 11,
      color: colors.text,
      fontSize: 14,
    },
  });