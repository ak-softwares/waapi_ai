import AppMenu from "@/src/components/common/AppMenu";
import UserAvatar from "@/src/components/common/user/UserAvatar";
import { useTheme } from "@/src/context/ThemeContext";
import { darkColors, lightColors } from "@/src/theme/colors";
import { Contact } from "@/src/types/Contact";
import { formatAndJoinPhones, formatInternationalPhoneNumber } from "@/src/utiles/formater/formatPhone";
import { Check, Edit, MessageCircle, MoreVertical, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ContactTileProps {
  contact: Contact;
  isSelected: boolean;
  isSelectionMode: boolean;

  onPress: () => void;
  onLongPress: () => void;

  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;

  onTagPress: (tag: string) => void;
}

export default function ContactTile(props: ContactTileProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { contact } = props;

  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      style={[
        styles.container,
        props.isSelected && styles.selectedContainer,
      ]}
    >
      <UserAvatar
        name={contact.name || contact.phones?.[0]}
        imageUrl={contact.imageUrl}
        size={42}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name || formatInternationalPhoneNumber(contact.phones[0]).international || "Unknown"}
        </Text>

        <Text style={styles.phone} numberOfLines={2}>
          {formatAndJoinPhones(contact.phones)}
        </Text>

        {!!contact.tags?.length && (
          <View style={styles.tagRow}>
            {contact.tags.slice(0, 3).map((tag) => (
              <TouchableOpacity
                key={`${contact._id}-${tag}`}
                style={styles.tag}
                onPress={() => props.onTagPress(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {props.isSelectionMode && props.isSelected ? (
          <View style={styles.selectedBadge}>
            <Check size={16} color={colors.onPrimary} />
          </View>
        ) : (
          <AppMenu
            trigger={<MoreVertical size={20} color={colors.text} />}
            items={[
              {
                label: "Chat",
                icon: <MessageCircle size={16} color={colors.text} />,
                onPress: props.onChat,
              },
              {
                label: "Edit",
                icon: <Edit size={16} color={colors.text} />,
                onPress: props.onEdit,
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} color={colors.error} />,
                onPress: props.onDelete,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
      minHeight: 70,
      // borderWidth: 1,
      // borderColor: colors.border,
      // backgroundColor: colors.surface,
    },

    selectedContainer: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}1A`,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#E6F4EA",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden", // important for circular images
    },

    avatarImage: {
      width: "100%",
      height: "100%",
    },

    avatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#2ecc71",
    },

    content: {
      flex: 1,
      gap: 4,
    },

    name: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },

    phone: {
      color: colors.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },

    right: {
      justifyContent: "center",
      alignItems: "center",
    },

    selectedBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    /* smaller tags */
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 2,
    },

    tag: {
      backgroundColor: `${colors.primary}18`,
      // borderWidth: 1,
      // borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },

    tagText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "500",
    },
  });