import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export const getCountryName = (code?: string) => {
  if (!code) return "Unknown";
  return countries.getName(code, "en") || "Unknown";
};