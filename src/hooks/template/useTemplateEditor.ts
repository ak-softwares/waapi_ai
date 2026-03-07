import {
  Template,
  TemplateBodyComponentCreate,
  TemplateButton,
  TemplateButtonsComponentCreate,
  TemplateComponentCreate,
  TemplateFooterComponentCreate,
  TemplateHeaderComponentCreate,
} from "@/src/types/Template";
import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderType,
} from "@/src/utiles/enums/template";
import { showToast } from "@/src/utiles/toastHelper/toast";
import { useEffect, useMemo, useState } from "react";
import { useHeaderMediaUpload } from "./useHeaderMediaUpload";
import { useTemplateMutation } from "./useTemplateMutation";

export type HeaderMediaState = {
  uri: string | null;
  fileName: string;
  mimeType: string;
  handle?: string[];
};

export type EditorMode = "create" | "edit" | "duplicate";

export function useTemplateEditor({
  mode,
  initialTemplate,
  onSaved,
}: {
  mode: EditorMode;
  initialTemplate?: Template | null;
  onSaved?: () => void;
}) {
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>(TemplateCategory.UTILITY);
  const [templateLanguage, setTemplateLanguage] = useState("en");
  const [headerFormat, setHeaderFormat] = useState<TemplateHeaderType>(TemplateHeaderType.TEXT);
  const [headerText, setHeaderText] = useState("");
  const [headerSampleValues, setHeaderSampleValues] = useState("");
  const [bodyText, setBodyText] = useState("Hello");
  const [bodySampleValues, setBodySampleValues] = useState<string[]>([""]);
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<TemplateButton[]>([{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
  const [isVariableAddedInButtonUrl, setIsVariableAddedInButtonUrl] = useState(false);
  const [urlSampleValues, setUrlSampleValues] = useState("");
  const [copyCodeSampleValues, setCopyCodeSampleValues] = useState("");
  const { headerMedia, isUploading, uploadHeaderMedia, removeMedia } = useHeaderMediaUpload();
  const { isSaving, createTemplate, updateTemplate } = useTemplateMutation(onSaved);

  useEffect(() => {
    if (!initialTemplate) return;
    const isDuplicate = mode === "duplicate";

    setTemplateId(isDuplicate ? "" : initialTemplate.id || "");
    setTemplateName(isDuplicate ? `${initialTemplate.name}_copy` : initialTemplate.name);
    setTemplateCategory(initialTemplate.category as TemplateCategory);
    setTemplateLanguage(initialTemplate.language || "en");

    const headerComp = initialTemplate.components?.find((c) => c.type === TemplateComponentType.HEADER) as TemplateHeaderComponentCreate | undefined;
    const bodyComp = initialTemplate.components?.find((c) => c.type === TemplateComponentType.BODY) as TemplateBodyComponentCreate | undefined;
    const footerComp = initialTemplate.components?.find((c) => c.type === TemplateComponentType.FOOTER) as TemplateFooterComponentCreate | undefined;
    const buttonsComp = initialTemplate.components?.find((c) => c.type === TemplateComponentType.BUTTONS) as TemplateButtonsComponentCreate | undefined;

    setHeaderFormat(headerComp?.format || TemplateHeaderType.TEXT);
    setHeaderText(headerComp?.text || "");
    setBodyText(bodyComp?.text || "");
    setFooterText(footerComp?.text || "");
    setButtons(buttonsComp?.buttons?.map((b) => ({ ...b })) || [{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);

    const bodyExamples = bodyComp?.example?.body_text?.[0] || [""];
    setBodySampleValues(bodyExamples);
    setHeaderSampleValues(headerComp?.example?.header_text?.[0] || "");

    removeMedia();
  }, [initialTemplate, mode]);

  const toMetaTemplateName = (input: string): string =>
    input.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_");

  const extractVariables = (text: string) => {
    const regex = /{{(\d+)}}/g;
    const matches = [...text.matchAll(regex)];
    return [...new Set(matches.map((m) => Number(m[1])))].sort((a, b) => a - b);
  };

  const headerVariables = useMemo(() => extractVariables(headerText), [headerText]);
  const bodyVariables = useMemo(() => extractVariables(bodyText), [bodyText]);

  const normalizeBodySampleValues = (variables: number[]) => {
    const next = [...bodySampleValues];
    if (next.length > variables.length) next.splice(variables.length);
    while (next.length < variables.length) next.push(`Sample ${next.length + 1}`);
    return next.map((value, index) => value?.trim() || `Sample ${index + 1}`);
  };

  const updateSampleValues = (newVars: number[]) => {
    const values = normalizeBodySampleValues(newVars);
    setBodySampleValues(values);
  };

  const addVariableInBody = () => {
    const next = bodyVariables.length ? Math.max(...bodyVariables) + 1 : 1;
    const nextBody = `${bodyText} {{${next}}}`;
    setBodyText(nextBody);
    updateSampleValues([...bodyVariables, next]);
  };

  const addVariableInHeader = () => {
    const next = headerVariables.length ? Math.max(...headerVariables) + 1 : 1;
    setHeaderText(`${headerText} {{${next}}}`);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: TemplateButtonType.QUICK_REPLY, text: "" }]);
    }
  };

  const removeButton = (index: number) => setButtons(buttons.filter((_, i) => i !== index));

  const updateButton = (index: number, field: string, value: string) => {
    const next = [...buttons];
    if (field === "type") {
      next[index] = {
        type: value as TemplateButtonType,
        text: value === TemplateButtonType.COPY_CODE ? "Copy offer code" : next[index].text,
        ...(value === TemplateButtonType.URL ? { url: "" } : {}),
        ...(value === TemplateButtonType.PHONE_NUMBER ? { phone_number: "" } : {}),
      } as TemplateButton;
    } else {
      next[index] = { ...next[index], [field]: value } as TemplateButton;
    }
    setButtons(next);
  };

  const addVariableInUrlButton = (index: number) => {
    setIsVariableAddedInButtonUrl(true);
    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL) return;
    if ((button.url || "").includes("{{1}}")) return;
    updateButton(index, "url", `${button.url || ""}{{1}}`);
  };

  const removeVariableInUrlButton = (index: number) => {
    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL) return;
    updateButton(index, "url", (button.url || "").replace(/\{\{1\}\}/g, ""));
    setIsVariableAddedInButtonUrl(false);
    setUrlSampleValues("");
  };

  useEffect(() => {
    if (!isVariableAddedInButtonUrl || !urlSampleValues) return;
    setButtons((prev) =>
      prev.map((btn) => (btn.type === TemplateButtonType.URL ? { ...btn, example: [urlSampleValues] } : btn))
    );
  }, [urlSampleValues, isVariableAddedInButtonUrl]);

  useEffect(() => {
    if (!copyCodeSampleValues) return;
    setButtons((prev) =>
      prev.map((btn) => (btn.type === TemplateButtonType.COPY_CODE ? { ...btn, example: [copyCodeSampleValues] } : btn))
    );
  }, [copyCodeSampleValues]);

  const saveTemplate = async () => {
    try {

      if (!templateName.trim()) {
        showToast({ type: "error", message: "Template name is required" });
        return;
      }

      if (templateCategory !== TemplateCategory.AUTHENTICATION && !bodyText.trim()) {
        showToast({ type: "error", message: "Body text is required" });
        return;
      }

      if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && !headerMedia.handle?.length) {
        showToast({ type: "error", message: "Please upload header media first" });
        return;
      }

      const components: TemplateComponentCreate[] = [];

      if (templateCategory === TemplateCategory.AUTHENTICATION) {
        components.push(
          { type: TemplateComponentType.BODY, example: { body_text: [["123456"]] } },
          {
            type: TemplateComponentType.BUTTONS,
            buttons: [{ type: TemplateButtonType.OTP, otp_type: TemplateButtonType.COPY_CODE }],
          }
        );
      } else {
        if (headerFormat === TemplateHeaderType.TEXT && headerText.trim()) {
          const c: TemplateHeaderComponentCreate = {
            type: TemplateComponentType.HEADER,
            format: headerFormat,
            text: headerText,
          };
          if (/\{\{\d+\}\}/.test(headerText)) c.example = { header_text: [headerSampleValues] };
          components.push(c);
        }

        if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && headerMedia.handle?.length) {
          components.push({
            type: TemplateComponentType.HEADER,
            format: headerFormat,
            example: { header_handle: headerMedia.handle },
          });
        }

        if (headerFormat === TemplateHeaderType.LOCATION) {
          components.push({
            type: TemplateComponentType.HEADER,
            format: TemplateHeaderType.LOCATION,
          });
        }

        if (bodyText.trim()) {
          const body: TemplateBodyComponentCreate = { type: TemplateComponentType.BODY, text: bodyText };
           if (bodyVariables.length) body.example = { body_text: [normalizeBodySampleValues(bodyVariables)] };
          components.push(body);
        }

        if (footerText.trim()) components.push({ type: TemplateComponentType.FOOTER, text: footerText });

        const validButtons = buttons.filter((b) => b?.text?.trim());
        if (validButtons.length) components.push({ type: TemplateComponentType.BUTTONS, buttons: validButtons });
      }

      const payload = {
        id: templateId,
        name: templateName,
        category: templateCategory,
        language: templateLanguage,
        components,
      };

      if (mode === "edit" && templateName) {
        await updateTemplate(templateName, payload);
      } else {
        await createTemplate(payload);
      }
      onSaved?.();
    } catch (error: any) {
      // showToast({ type: "error", message: error?.message || "Something went wrong" });
    }
  };

  return {
    mode,
    isSaving,
    isUploading,
    templateId,
    templateName,
    templateCategory,
    templateLanguage,
    headerFormat,
    headerText,
    headerSampleValues,
    bodyText,
    bodySampleValues,
    footerText,
    buttons,
    headerMedia,
    headerVariables,
    bodyVariables,
    isVariableAddedInButtonUrl,
    urlSampleValues,
    copyCodeSampleValues,
    setTemplateId,
    setTemplateName,
    setTemplateCategory,
    setTemplateLanguage,
    setHeaderFormat,
    setHeaderText,
    setHeaderSampleValues,
    setBodyText,
    setBodySampleValues,
    setFooterText,
    setUrlSampleValues,
    setCopyCodeSampleValues,
    toMetaTemplateName,
    updateSampleValues,
    addVariableInBody,
    addVariableInHeader,
    addButton,
    removeButton,
    updateButton,
    addVariableInUrlButton,
    removeVariableInUrlButton,
    uploadHeaderMedia,
    removeMedia,
    saveTemplate,
  };
}
