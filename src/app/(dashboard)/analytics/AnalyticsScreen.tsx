import SingleTik from "@/assets/messageMetaIcons/status-check.svg";
import DoubleTik from "@/assets/messageMetaIcons/status-dblcheck.svg";
import AppMenu from "@/src/components/common/AppMenu";
import { useTheme } from "@/src/context/ThemeContext";
import { useAnalytics } from "@/src/hooks/analytics/useAnalytics";
import { calcPercentage } from "@/src/lib/helper/math";
import { darkColors, lightColors } from "@/src/theme/colors";
import { DateRangeEnum, DateRangeLabels } from "@/src/utiles/enums/dateRangeEnum";
import { dateRanges } from "@/src/utiles/helper/dateRangePresetsHelper";
import { Stack } from "expo-router";
import {
  BarChart3,
  MessageSquare,
  Send,
  Sparkles
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Svg, { Circle } from "react-native-svg";

function MetricCard({
  label,
  value,
  subValue,
  icon,
  colors,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  colors: typeof lightColors;
}) {
  return (
    <View
      style={[
        stylesMetric.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={stylesMetric.topRow}>
        <Text style={[stylesMetric.label, { color: colors.mutedText }]}>{label}</Text>
        {icon}
      </View>

      <View style={stylesMetric.bottomRow}>
        <Text style={[stylesMetric.value, { color: colors.text }]}>{value}</Text>
        {!!subValue && (
          <Text style={[stylesMetric.subValue, { color: colors.mutedText }]}>
            ({subValue})
          </Text>
        )}
      </View>
    </View>
  );
}

function PieChartCard({
  colors,
  accepted,
  delivered,
  read,
}: {
  colors: typeof lightColors;
  accepted: number;
  delivered: number;
  read: number;
}) {
  const normalizedAccepted = Math.max(accepted, 0);
  const normalizedDelivered = Math.max(Math.min(delivered, normalizedAccepted), 0);
  const normalizedRead = Math.max(Math.min(read, normalizedDelivered), 0);
  const remaining = Math.max(normalizedAccepted - normalizedDelivered, 0);

  const size = 122;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const deliveredDash = (normalizedDelivered / Math.max(normalizedAccepted, 1)) * circumference;
  const readDash = (normalizedRead / Math.max(normalizedAccepted, 1)) * circumference;
  const remainingDash = (remaining / Math.max(normalizedAccepted, 1)) * circumference;

  return (
    <View
      style={[
        stylesChart.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={stylesChart.header}>
        <Text style={[stylesChart.title, { color: colors.text }]}>Delivery breakdown</Text>
        <Text style={[stylesChart.subtitle, { color: colors.mutedText }]}>
          Accepted vs delivered vs read
        </Text>
      </View>

      <View style={stylesChart.body}>
        <View style={stylesChart.chartWrap}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={`${colors.border}66`}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${remainingDash} ${Math.max(circumference - remainingDash, 0)}`}
              transform={`rotate(-90 ${center} ${center})`}
              fill="transparent"
            />

            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.primary}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${deliveredDash} ${Math.max(circumference - deliveredDash, 0)}`}
              transform={`rotate(-90 ${center} ${center})`}
              fill="transparent"
            />

            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.messageLink}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${readDash} ${Math.max(circumference - readDash, 0)}`}
              transform={`rotate(-90 ${center} ${center})`}
              fill="transparent"
            />
          </Svg>
          <View style={stylesChart.centerTextWrap}>
            <Text style={[stylesChart.centerValue, { color: colors.text }]}>
              {calcPercentage({ total: normalizedAccepted, part: normalizedRead })}%
            </Text>
            <Text style={[stylesChart.centerLabel, { color: colors.mutedText }]}>Read rate</Text>
          </View>
        </View>

        <View style={stylesChart.legendCol}>
          <View style={stylesChart.legendItem}>
            <View style={[stylesChart.dot, { backgroundColor: colors.primary }]} />
            <Text style={[stylesChart.legendText, { color: colors.text }]}>
              Delivered: {normalizedDelivered}
            </Text>
          </View>
          <View style={stylesChart.legendItem}>
            <View style={[stylesChart.dot, { backgroundColor: colors.messageLink }]} />
            <Text style={[stylesChart.legendText, { color: colors.text }]}>Read: {normalizedRead}</Text>
          </View>
          <View style={stylesChart.legendItem}>
            <View style={[stylesChart.dot, { backgroundColor: "#f59e0b" }]} />
            <Text style={[stylesChart.legendText, { color: colors.text }]}>Pending: {remaining}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data, loading, fetchAnalytics } = useAnalytics();
  const [selectedRange, setSelectedRange] = useState<DateRangeEnum>(DateRangeEnum.THIS_MONTH);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const handleRangeChange = (value: DateRangeEnum) => {
    setSelectedRange(value);
    const { start, end } = dateRanges[value]();
    fetchAnalytics({ start, end });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: "Analytics",
        }}
      />

      <View style={[styles.headerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.titleRow}>
              <BarChart3 size={16} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>Overview of your messaging & AI usage</Text>
          </View>

          <AppMenu
            trigger={
              <View style={[styles.rangeTrigger, { borderColor: colors.border }]}>
                <Text style={[styles.rangeText, { color: colors.text }]}>
                  {DateRangeLabels[selectedRange]}
                </Text>
              </View>
            }
            items={Object.values(DateRangeEnum).map((range) => ({
              label: DateRangeLabels[range],
              onPress: () => handleRangeChange(range),
            }))}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.mutedText }]}>Loading analytics…</Text>
        </View>
      ) : (
        <View style={styles.analyticsWrap}>
          <PieChartCard
            colors={colors}
            accepted={data?.fbAcceptedMessages ?? 0}
            delivered={data?.deliveredMessages ?? 0}
            read={data?.readMessages ?? 0}
          />

          <View style={styles.grid}>
            <MetricCard
              label="Total Msg"
              value={data?.totalMessages ?? 0}
              icon={<MessageSquare size={16} color={colors.mutedText} />}
              colors={colors}
            />

            <MetricCard
              label="API Sent"
              value={data?.apiSentMessages ?? 0}
              icon={<Send size={16} color={colors.mutedText} />}
              colors={colors}
            />

            <MetricCard
              label="FB Accepted"
              value={data?.fbAcceptedMessages ?? 0}
              icon={<SingleTik height={16} width={16} fill={colors.mutedText} />}
              colors={colors}
            />

            <MetricCard
              label="Delivered"
              value={data?.deliveredMessages ?? 0}
              icon={<DoubleTik height={16} width={16} fill={colors.mutedText} />}
              colors={colors}
            />

            <MetricCard
              label="Read"
              value={data?.readMessages ?? 0}
              icon={<DoubleTik height={16} width={16} fill={colors.messageLink} />}
              subValue={`${calcPercentage({
                total: data?.deliveredMessages ?? 0,
                part: data?.readMessages ?? 0,
              })}%`}
              colors={colors}
            />

            <MetricCard
              label="AI Replies"
              value={data?.aIReplies ?? 0}
              icon={<Sparkles size={16} color={colors.mutedText} />}
              subValue={`$${(data?.aICost ?? 0).toFixed(4)}`}
              colors={colors}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 12,
      gap: 12,
    },

    headerCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },

    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    headerTitleWrap: {
      flex: 1,
      gap: 4,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    title: {
      fontSize: 16,
      fontWeight: "700",
    },

    subtitle: {
      fontSize: 12,
    },

    rangeTrigger: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      minWidth: 120,
      alignItems: "center",
    },

    rangeText: {
      fontSize: 12,
      fontWeight: "600",
    },

    loaderWrap: {
      borderRadius: 12,
      paddingVertical: 28,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    loaderText: {
      fontSize: 13,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    analyticsWrap: {
      gap: 10,
    },
  });

const stylesMetric = StyleSheet.create({
  card: {
    width: "48.8%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 78,
    justifyContent: "space-between",
    gap: 8,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
  },

  subValue: {
    fontSize: 11,
  },
});

const stylesChart = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chartWrap: {
    width: 122,
    height: 122,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTextWrap: {
    position: "absolute",
    alignItems: "center",
  },
  centerValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  centerLabel: {
    fontSize: 11,
  },
  legendCol: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 20,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
