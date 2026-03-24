import { useTheme } from "@/src/context/ThemeContext";
import { useDeleteWabaAccount } from "@/src/hooks/setup/useDeleteWabaAccount";
import { usePhoneCodeVerification } from "@/src/hooks/setup/usePhoneCodeVerification";
import { useRegisterPhoneNumber } from "@/src/hooks/setup/useRegisterPhoneNumber";
import { useSubscribeApp } from "@/src/hooks/setup/useSubscribeApp";
import { useWabaSetupData } from "@/src/hooks/setup/useWabaSetupData";
import { darkColors, lightColors } from "@/src/theme/colors";
import { WabaPhoneNumber } from "@/src/types/WabaAccount";
import { Stack } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  CircleCheck,
  ExternalLink,
  Info,
  Trash2,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function WhatsAppSetupScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { loadingWaba, loadingSetupData, waSetupStatus, wabaAccount, fetchStatus } = useWabaSetupData();
  const [openVerifyPhoneDialog, setOpenVerifyPhoneDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { deleting, deleteAccount } = useDeleteWabaAccount(() => {
    fetchStatus();
  });
  const { requestCode, verifyCode, requestCodeLoading, verifyCodeLoading } = usePhoneCodeVerification();
  const { isLoading: isSubscribing, subscribeAppToWABA } = useSubscribeApp();
  const { isLoading: isPhoneRegistering, registerPhoneNumber } = useRegisterPhoneNumber();

  const allDone = useMemo(
    () => !!(
      waSetupStatus?.isTokenAvailable
      && waSetupStatus?.isAppSubscription
      && waSetupStatus?.isPhoneRegistered
      && wabaAccount?.account_review_status === "APPROVED"
    ),
    [waSetupStatus, wabaAccount]
  );

  const currentStepIndex = useMemo(() => {
    if (!waSetupStatus?.isTokenAvailable) return 1;
    if (wabaAccount?.account_review_status !== "APPROVED") return 2;
    if (!waSetupStatus?.isAppSubscription) return 3;
    if (!waSetupStatus?.isPhoneRegistered) return 4;
    return 5;
  }, [waSetupStatus, wabaAccount]);

  const goToSetup = async () => {
    await Linking.openURL("https://wa-api.me/dashboard/setup");
  };

  const goToWhatsappAccount = async () => {
    await Linking.openURL("https://business.facebook.com/latest/settings/whatsapp_account");
  };

  const onAskDelete = () => {
    Alert.alert(
      "Delete WABA account permanently?",
      "This action will permanently remove your WhatsApp Business Account connection, including chats, contacts, AI settings, and all related data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: deleting ? "Deleting..." : "Delete",
          style: "destructive",
          onPress: () => {
            deleteAccount();
          },
        },
      ]
    );
  };

  const handleSendCodeAndOpenDialog = async () => {
    const ok = await requestCode("SMS");
    if (ok) {
      setOpenVerifyPhoneDialog(true);
    }
  };

  const handleVerifyCode = async () => {
    const ok = await verifyCode(verificationCode.trim());
    if (ok) {
      setOpenVerifyPhoneDialog(false);
      setVerificationCode("");
      fetchStatus();
    }
  };

  if (loadingWaba || loadingSetupData) {
    return (
      <>
        <Stack.Screen options={{ title: "WhatsApp API Setup" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading setup status...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "WhatsApp API Setup" }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {!waSetupStatus?.isTokenAvailable ? (
          <View style={styles.card}>
            <View style={styles.rowStart}>
              <AlertCircle size={20} color="#CA8A04" />
              <Text style={styles.cardTitle}>WhatsApp Setup Required</Text>
            </View>
            <Text style={styles.cardDescription}>Connect your number to WhatsApp Cloud API</Text>

            <View style={styles.warningBox}>
              <AlertCircle size={16} color="#CA8A04" />
              <Text style={styles.warningText}>
                Your number is not connected to WhatsApp API. Setup is required to use messaging.
              </Text>
            </View>

            <View style={styles.stepsList}>
              <Text style={styles.stepText}>1. Tap Connect WhatsApp below</Text>
              <Text style={styles.stepText}>2. Login with Facebook and grant permissions</Text>
              <Text style={styles.stepText}>3. Select your WhatsApp Business Account & phone</Text>
            </View>

            <View style={styles.rowGap}>
              <TouchableOpacity style={styles.primaryButton} onPress={goToSetup}>
                <Text style={styles.primaryButtonText}>Connect WhatsApp</Text>
              </TouchableOpacity>
              <View style={styles.iconButton}>
                <Info size={18} color={colors.secondaryText} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.rowStart}>
              <CircleCheck size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>WhatsApp API Setup</Text>
            </View>
            <Text style={styles.cardDescription}>Your number is ready to use</Text>

            {allDone ? (
              <View style={styles.successBox}>
                <CheckCircle size={18} color={colors.primary} />
                <Text style={styles.successText}>WhatsApp API is connected and ready to use!</Text>
              </View>
            ) : (
              <View style={styles.stepperContainer}>
                <StepItem
                  styles={styles}
                  step={1}
                  title="Connect WhatsApp Number"
                  done={currentStepIndex > 1}
                  actionLabel="Connect WhatsApp"
                  onAction={goToSetup}
                />
                <StepItem
                  styles={styles}
                  step={2}
                  title="WhatsApp Account Status"
                  done={currentStepIndex > 2}
                  actionLabel="Visit WhatsApp Business"
                  onAction={goToWhatsappAccount}
                />
                <StepItem
                  styles={styles}
                  step={3}
                  title="Subscribe App"
                  done={currentStepIndex > 3}
                  actionLabel={isSubscribing ? "Subscribing..." : "Subscribe App"}
                  onAction={() => subscribeAppToWABA(fetchStatus)}
                  disabled={isSubscribing}
                />
                <StepItem
                  styles={styles}
                  step={4}
                  title="Register Phone Number"
                  done={currentStepIndex > 4}
                  actionLabel={isPhoneRegistering ? "Registering..." : "Register Phone"}
                  onAction={() => registerPhoneNumber(fetchStatus)}
                  disabled={isPhoneRegistering}
                />
              </View>
            )}

            <View style={styles.metaBlock}>
              <View style={styles.accountRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>WhatsApp Business Account</Text>
                  <View style={styles.rowStart}>
                    <Text style={styles.metaValue}>{wabaAccount?.name || "WhatsApp Business Account"}</Text>
                    <Pressable onPress={goToWhatsappAccount}>
                      <ExternalLink size={16} color={colors.messageLink} />
                    </Pressable>
                  </View>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Account Status</Text>
                  <Text style={styles.badge}>{wabaAccount?.account_review_status || "Unknown"}</Text>
                </View>
              </View>

              <Text style={styles.metaLabel}>Phone Numbers ({wabaAccount?.phone_numbers?.length || 0})</Text>
              {(wabaAccount?.phone_numbers?.length || 0) > 0 ? (
                wabaAccount?.phone_numbers?.map((phoneNumber: any) => (
                  <PhoneNumberCard
                    key={phoneNumber.id}
                    styles={styles}
                    phoneNumber={phoneNumber}
                    allDone={allDone}
                    requestCodeLoading={requestCodeLoading}
                    onVerifyPhone={handleSendCodeAndOpenDialog}
                    deleting={deleting}
                    onDelete={onAskDelete}
                  />
                ))
              ) : (
                <View style={styles.emptyPhoneCard}>
                  <Text style={styles.metaLabel}>No phone numbers found.</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={openVerifyPhoneDialog} transparent animationType="fade" onRequestClose={() => setOpenVerifyPhoneDialog(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify Phone</Text>
            <Text style={styles.modalText}>Enter the OTP code sent to your WhatsApp number.</Text>

            <TextInput
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.codeInput}
              keyboardType="number-pad"
              placeholder="Enter code"
              placeholderTextColor={colors.lighterText}
              maxLength={8}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setOpenVerifyPhoneDialog(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, verifyCodeLoading && styles.disabledButton]}
                disabled={verifyCodeLoading}
                onPress={handleVerifyCode}
              >
                <Text style={styles.primaryButtonText}>{verifyCodeLoading ? "Verifying..." : "Verify"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type SetupStyles = ReturnType<typeof getStyles>;

function StepItem({
  styles,
  step,
  title,
  done,
  actionLabel,
  onAction,
  disabled,
}: {
  styles: SetupStyles;
  step: number;
  title: string;
  done: boolean;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepIndex}>Step {step}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={[styles.stepState, done && styles.stepDone]}>{done ? "Done" : "Pending"}</Text>
      {!done ? (
        <TouchableOpacity style={[styles.outlineButton, disabled && styles.disabledButton]} onPress={onAction} disabled={disabled}>
          <Text style={styles.outlineButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function PhoneNumberCard({
  styles,
  phoneNumber,
  allDone,
  requestCodeLoading,
  onVerifyPhone,
  deleting,
  onDelete,
}: {
  styles: SetupStyles;
  phoneNumber: WabaPhoneNumber;
  allDone: boolean;
  requestCodeLoading: boolean;
  onVerifyPhone: () => void;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <View style={styles.phoneCard}>
      <Text style={styles.phoneText}>Name: {phoneNumber?.verified_name || "Not set"}</Text>
      <Text style={styles.phoneText}>Phone: {phoneNumber?.display_phone_number || "N/A"}</Text>
      <Text style={styles.phoneText}>Quality: {phoneNumber?.quality_rating || "Unknown"}</Text>
      <Text style={styles.phoneText}>
        Onboarded:{" "}
        {phoneNumber?.last_onboarded_time
          ? new Date(phoneNumber.last_onboarded_time).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A"}
      </Text>

      <View style={styles.rowGap}>
        {phoneNumber?.code_verification_status !== "VERIFIED" && !allDone ? (
          <TouchableOpacity
            style={[styles.outlineButton, requestCodeLoading && styles.disabledButton]}
            disabled={requestCodeLoading}
            onPress={onVerifyPhone}
          >
            <Text style={styles.outlineButtonText}>{requestCodeLoading ? "Sending..." : "Verify Phone"}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={[styles.deleteButton, deleting && styles.disabledButton]} onPress={onDelete} disabled={deleting}>
          <Trash2 size={16} color={"#DC2626"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 14,
      paddingBottom: 30,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      gap: 8,
    },
    loadingText: {
      color: colors.secondaryText,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderColor: colors.border,
      borderWidth: 1,
      padding: 14,
      gap: 10,
    },
    rowStart: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowGap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    cardDescription: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    warningBox: {
      backgroundColor: themeAwareWarningBg(colors),
      borderWidth: 1,
      borderColor: "#FDE68A",
      borderRadius: 10,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    warningText: {
      color: themeAwareWarningText(colors),
      flex: 1,
      fontSize: 12,
    },
    stepsList: {
      gap: 6,
    },
    stepText: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 110,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontWeight: "600",
    },
    iconButton: {
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 10,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    successBox: {
      borderColor: `${colors.primary}70`,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      backgroundColor: `${colors.primary}20`,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    successText: {
      color: colors.primary,
      fontWeight: "600",
    },
    stepperContainer: {
      gap: 8,
    },
    stepRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      gap: 6,
      backgroundColor: colors.background,
    },
    stepIndex: {
      fontSize: 11,
      color: colors.secondaryText,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    stepState: {
      color: colors.warning,
      fontSize: 12,
      fontWeight: "600",
    },
    stepDone: {
      color: colors.success,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignSelf: "flex-start",
    },
    outlineButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    metaBlock: {
      marginTop: 4,
      gap: 10,
    },
    accountRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    metaLabel: {
      color: colors.secondaryText,
      fontSize: 12,
    },
    metaValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    badge: {
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      overflow: "hidden",
      marginTop: 4,
      textAlign: "center",
      fontSize: 12,
    },
    phoneCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
      padding: 10,
      gap: 5,
    },
    phoneText: {
      color: colors.text,
      fontSize: 13,
    },
    deleteButton: {
      borderWidth: 1,
      borderColor: "#FCA5A5",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignSelf: "flex-start",
      backgroundColor: "rgba(239,68,68,0.08)",
    },
    emptyPhoneCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.background,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderColor: colors.border,
      borderWidth: 1,
      padding: 14,
      gap: 10,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },
    modalText: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    codeInput: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.background,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 85,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

function themeAwareWarningBg(colors: typeof lightColors) {
  return colors.background === "#ffffff" ? "#FEFCE8" : "rgba(234,179,8,0.15)";
}

function themeAwareWarningText(colors: typeof lightColors) {
  return colors.background === "#ffffff" ? "#92400E" : "#FDE68A";
}