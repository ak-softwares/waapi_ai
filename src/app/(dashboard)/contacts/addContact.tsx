import AppPhoneInput from "@/src/components/common/phoneInput/AppPhoneInput";
import { useTheme } from "@/src/context/ThemeContext";
import { useAddContact } from "@/src/hooks/contacts/useAddContact";
import { contactSchema } from "@/src/schemas/contactSchema";
import { darkColors, lightColors } from "@/src/theme/colors";
import { ImportedContact } from "@/src/types/Contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { CirclePlus, X } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { z } from "zod";

type ContactFormData = z.infer<typeof contactSchema>;

export default function AddContactScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    email?: string;
    phones?: string;
    tags?: string;
    contactData?: string;
  }>();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [tagInput, setTagInput] = useState("");


  const parsedContact = useMemo(() => {
    if (typeof params.contactData !== "string" || !params.contactData) {
      return null;
    }

    try {
      return JSON.parse(params.contactData) as ImportedContact;
    } catch {
      return null;
    }
  }, [params.contactData]);

  const contactId = typeof params.id === "string" ? params.id : undefined;
  const mode = contactId || parsedContact?.id ? "edit" : "add";

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phones: [{ number: "" }],
      email: "",
      tags: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "phones",
  });

  const { addContact, updateContact, addingContact, updatingContact } = useAddContact(
    () => {
      router.back();
    }
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: mode === "edit" ? "Edit Contact" : "Add Contact",
    });
  }, [navigation, mode]);

  useEffect(() => {
    const basePhones =
      parsedContact?.phones && parsedContact.phones.length
        ? parsedContact.phones
        : typeof params.phones === "string" && params.phones.length
        ? params.phones
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

    const parsedPhones =
      basePhones.length > 0 ? basePhones.map((number) => ({ number })) : [{ number: "" }];

    const parsedTags =
      parsedContact?.tags && parsedContact.tags.length
        ? parsedContact.tags
        : typeof params.tags === "string" && params.tags.length
        ? params.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

    reset({
      name:
        parsedContact?.name ||
        (typeof params.name === "string" ? params.name : ""),
      email:
        parsedContact?.email ||
        (typeof params.email === "string" ? params.email : ""),
      phones: parsedPhones,
      tags: parsedTags,
    });

    replace(parsedPhones);
  }, [
    params.email,
    params.name,
    params.phones,
    params.tags,
    parsedContact,
    reset,
    replace,
  ]);

  const addTag = () => {
    const clean = tagInput.trim();
    const tags = getValues("tags") || [];

    if (!clean || tags.includes(clean)) {
      return;
    }

    setValue("tags", [...tags, clean], { shouldValidate: true });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const tags = getValues("tags") || [];
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ContactFormData) => {
    const payload: ImportedContact = {
      id: parsedContact?.id || contactId,
      name: data.name.trim(),
      phones: data.phones.map((p) => p.number.trim()).filter(Boolean),
      email: data.email?.trim() || undefined,
      tags: data.tags || [],
    };

    if (mode === "edit") {
      await updateContact({ contact: payload });
      return;
    }

    await addContact({ contact: payload });
  };

  const submitting = addingContact || updatingContact;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.mutedText}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <Text style={styles.label}>Phone Numbers</Text>
        {fields.map((field, index) => (
          <View key={field.id} style={styles.phoneRow}>
            <View style={styles.phoneInputWrap}>
              <Controller
                control={control}
                name={`phones.${index}.number`}
                render={({ field: { onChange, value } }) => (
                  <AppPhoneInput
                    value={value ?? ""}
                    onChange={(val: string) => onChange(val ?? "")}
                  />
                )}
              />
              {errors.phones?.[index]?.number && (
                <Text style={styles.error}>{errors.phones[index]?.number?.message}</Text>
              )}
            </View>

            {index > 0 && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => remove(index)}
                disabled={submitting}
              >
                <X size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addPhoneBtn}
          onPress={() => append({ number: "" })}
          disabled={submitting}
        >
          <CirclePlus size={16} color={colors.primary} />
          <Text style={styles.addPhoneText}>Add Another Phone</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Email (optional)</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor={colors.mutedText}
              value={value ?? ""}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="Type tag"
            placeholderTextColor={colors.mutedText}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity onPress={addTag}>
            <Text style={styles.addTagText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="tags"
          render={({ field: { value } }) => (
            <View style={styles.tagsWrap}>
              {(value || []).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      <View>
        <TouchableOpacity
          style={[styles.submitBtn, { opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting
              ? mode === "edit"
                ? "Updating..."
                : "Adding..."
              : mode === "edit"
              ? "Update Contact"
              : "Add Contact"}
          </Text>
        </TouchableOpacity>
      </View>
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
      padding: 16,
      paddingBottom: 32,
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 16,
    },

    label: {
      fontSize: 13,
      color: colors.mutedText,
      marginBottom: 6,
      marginTop: 10,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 14,
    },

    error: {
      color: colors.error,
      marginTop: 6,
      fontSize: 12,
    },

    phoneRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },

    phoneInputWrap: {
      flex: 1,
    },

    iconBtn: {
      width: 32,
      height: 32,
      marginTop: 9,
      alignItems: "center",
      justifyContent: "center",
    },

    addPhoneBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },

    addPhoneText: {
      color: colors.primary,
      fontWeight: "500",
    },

    tagInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    flexInput: {
      flex: 1,
    },

    addTagText: {
      color: colors.primary,
      fontWeight: "600",
    },

    tagsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },

    tag: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },

    tagText: {
      color: colors.text,
      fontSize: 12,
    },

    cancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    cancelText: {
      color: colors.text,
      fontWeight: "500",
    },

    submitBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },

    submitText: {
      color: "#fff",
      fontWeight: "600",
      textAlign: "center"
    },
  });
