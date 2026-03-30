import SingleTik from "@/assets/messageMetaIcons/status-check.svg";
import DoubleTik from "@/assets/messageMetaIcons/status-dblcheck.svg";
import Warning from "@/assets/messageMetaIcons/warning.svg";
import AppMenu from "@/src/components/common/AppMenu";
import SearchBar from "@/src/components/common/search/SearchBar";
import { useTheme } from "@/src/context/ThemeContext";
import { useBroadcastMessageReport } from "@/src/hooks/broadcast/useBroadcastMessageReport";
import { useBroadcastReportExcel } from "@/src/hooks/broadcast/useBroadcastReportExcel";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Message, MessageStatus } from "@/src/types/Messages";
import { formatInternationalPhoneNumber } from "@/src/utiles/formater/formatPhone";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Download, Loader2, MessageSquare, MoreVertical, RefreshCw } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type ReportParams = {
  chatId?: string;
  messageId?: string;
};

function getStatusStyles(status: MessageStatus | undefined, colors: typeof lightColors) {
  if (status === MessageStatus.Read) {
    return {
      borderColor: colors.success,
      backgroundColor: `${colors.success}22`,
      textColor: colors.success,
      label: "Seen",
    };
  }

  if (status === MessageStatus.Delivered) {
    return {
      borderColor: colors.warning,
      backgroundColor: `${colors.warning}22`,
      textColor: colors.warning,
      label: "Delivered",
    };
  }

  if (status === MessageStatus.Sent) {
    return {
      borderColor: colors.info,
      backgroundColor: `${colors.info}22`,
      textColor: colors.info,
      label: "Sent",
    };
  }

  if (status === MessageStatus.Failed) {
    return {
      borderColor: colors.error,
      backgroundColor: `${colors.error}22`,
      textColor: colors.error,
      label: "Failed",
    };
  }

  return {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textColor: colors.mutedText,
    label: "-",
  };
}

const calcPercentage = (total: number, part: number) => {
  if (!total || total <= 0 || !part) return "0%";

  const value = (part / total) * 100;
  return `${value.toFixed(1)}%`;
};

function MetricCard({
  label,
  value,
  subValue,
  icon,
  colors,
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  colors: typeof lightColors;
}) {
  return (
    <View
      style={[
        metricStyles.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {/* Top Row */}
      <View style={metricStyles.header}>
        <Text style={[metricStyles.label, { color: colors.mutedText }]}>
          {label}
        </Text>
        {icon}
      </View>

      {/* Value + SubValue Row */}
      <View style={metricStyles.valueRow}>
        <Text style={[metricStyles.value, { color: colors.text }]}>
          {value}
        </Text>

        {!!subValue && (
          <Text style={[metricStyles.subInline, { color: colors.mutedText }]}>
            {subValue}
          </Text>
        )}
      </View>
    </View>
  );
}

function ReportItem({
  item,
  index,
  colors,
}: {
  item: Message;
  index: number;
  colors: typeof lightColors;
}) {
  const badge = getStatusStyles(item.status, colors);

  const formatShortTime = (date?: string | Date | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        stylesRow.container,
        { borderBottomColor: colors.border },
      ]}
    >
      {/* Top Row */}
      <View style={stylesRow.topRow}>
        <Text style={[stylesRow.index, { color: colors.mutedText }]}>
          #{index + 1}
        </Text>

        <Text
          style={[stylesRow.number, { color: colors.text }]}
          numberOfLines={1}
        >
          {formatInternationalPhoneNumber(item.to || "").international || "-"}
        </Text>

        <Text style={[stylesRow.status, { color: badge.textColor }]}>
          {badge.label}
        </Text>
      </View>

      {/* Meta Row */}
      <View style={stylesRow.metaRow}>
        
        {/* Sent */}
        <View style={stylesRow.metaItem}>
          <SingleTik height={12} width={12} fill={colors.mutedText} />
          <Text style={[stylesRow.metaText, { color: colors.mutedText }]}>
            {formatShortTime(item.sentAt)}
          </Text>
        </View>

        {/* Delivered */}
        <View style={stylesRow.metaItem}>
          <DoubleTik height={12} width={12} fill={colors.mutedText} />
          <Text style={[stylesRow.metaText, { color: colors.mutedText }]}>
            {formatShortTime(item.deliveredAt)}
          </Text>
        </View>

        {/* Read */}
        <View style={stylesRow.metaItem}>
          <DoubleTik height={12} width={12} fill={colors.messageLink} />
          <Text style={[stylesRow.metaText, { color: colors.mutedText }]}>
            {formatShortTime(item.readAt)}
          </Text>
        </View>

        {/* Failed */}
        {!!item.errorMessage && (
          <View style={stylesRow.metaItem}>
            <Warning
              height={12}
              width={12}
              fill={item.failedAt ? colors.warning : colors.mutedText}
            />
            <Text
              style={[
                stylesRow.metaText,
                { color: item.failedAt ? colors.warning : colors.mutedText },
              ]}
            >
              {formatShortTime(item.failedAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Error */}
      {!!item.errorMessage && (
        <Text
          style={[stylesRow.error, { color: colors.warning }]}
          numberOfLines={1}
        >
          {item.errorMessage}
        </Text>
      )}
    </View>
  );
}

export default function BroadcastReportScreen() {
  const params = useLocalSearchParams<ReportParams>();
  const chatId = String(params.chatId || "");
  const messageId = String(params.messageId || "");

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    rows,
    summary,
    loading,
    loadingMore,
    hasMore,
    searchMessages,
    setPage,
    refreshReport,
  } = useBroadcastMessageReport({
    chatId,
    messageId,
  });

  const { downloading, downloadExcel } = useBroadcastReportExcel();

  const canDownload = useMemo(() => Boolean(chatId && messageId), [chatId, messageId]);

  const onDownloadExcel = async () => {
    if (!canDownload) return;

    await downloadExcel({ chatId, messageId });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Broadcast Message Report",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.selectionActionsRight}>
              <TouchableOpacity onPress={refreshReport}>
                <RefreshCw size={20} color={colors.text} />
              </TouchableOpacity>

              <AppMenu
                trigger={<MoreVertical size={22} color={colors.text} />}
                items={[
                  {
                    label: downloading ? "Downloading..." : "Download Excel",
                    icon: downloading ? <Loader2 size={16} color={colors.text} /> : <Download size={16} color={colors.text} />,
                    onPress: () => {onDownloadExcel()},
                  },
                ]}
              />
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Total Messages"
            value={summary.totalMessages}
            icon={<MessageSquare size={16} color={colors.mutedText} />}
            colors={colors}
          />
          <MetricCard
            label="FB Accepted"
            value={summary.fbAcceptedMessages}
            subValue={calcPercentage(summary.totalMessages, summary.fbAcceptedMessages)}
            icon={<SingleTik height={16} width={16} fill={colors.mutedText}/>}
            colors={colors}
          />
          <MetricCard
            label="Delivered"
            value={summary.deliveredMessages}
            subValue={calcPercentage(summary.totalMessages, summary.deliveredMessages)}
            icon={<DoubleTik height={16} width={16} fill={colors.mutedText}/>}
            colors={colors}
          />
          <MetricCard
            label="Read"
            value={summary.readMessages}
            subValue={calcPercentage(summary.totalMessages, summary.readMessages)}
            icon={<DoubleTik height={16} width={16} fill={colors.messageLink}/>}
            colors={colors}
          />
        </View>

        <SearchBar
          placeholder="Search number..."
          onSearch={searchMessages}
        />

        {loading && rows.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item, index) => item._id ?? `${item.to}-${index}`}
            renderItem={({ item, index }) => <ReportItem item={item} index={index} colors={colors} />}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (!loadingMore && hasMore) {
                setPage((prev) => prev + 1);
              }
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No report data found.</Text>}
            ListFooterComponent={
              loadingMore ? (
                <Text style={styles.footerText}>Loading more...</Text>
              ) : !hasMore && rows.length > 0 ? (
                <Text style={styles.footerText}>End of report</Text>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  sub: {
    fontSize: 11,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  subInline: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2, // aligns baseline nicely
  },
});

const stylesRow = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  index: {
    fontSize: 11,
    marginRight: 6,
  },

  number: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  status: {
    fontSize: 12,
    fontWeight: "600",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap", // ✅ prevents overflow
    gap: 10,
    marginTop: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center", // ✅ FIX alignment
    gap: 4,
  },

  metaText: {
    fontSize: 11,
  },

  error: {
    fontSize: 11,
    marginTop: 4,
  },
});

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 14,
      gap: 10,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
    },
    actionButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    selectionActionsRight: {
      flexDirection: "row",
      gap: 15,
    },
    actionText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    listContent: {
      paddingBottom: 24,
    },
    loaderWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: colors.mutedText,
      textAlign: "center",
      paddingVertical: 20,
    },
    footerText: {
      color: colors.mutedText,
      textAlign: "center",
      paddingVertical: 12,
    },
  });
