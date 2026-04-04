import { CURRENCY_CONFIG, CurrencyCode, PRICE_PER_CREDIT_USD } from "@/src/utiles/constans/wallet";

interface CreditsToAmountParams {
  credits: number;
  currency: CurrencyCode;
}

export const creditsToAmount = ({ credits, currency }: CreditsToAmountParams): number => {
  const usdAmount = credits * PRICE_PER_CREDIT_USD;
  const rate = CURRENCY_CONFIG[currency].rate;
  return Math.round((usdAmount / rate) * 100) / 100;
};

interface AmountToCreditsParams {
  amount: number;
  currency: CurrencyCode;
}

export const amountToCredits = ({ amount, currency }: AmountToCreditsParams): number => {
  const rate = CURRENCY_CONFIG[currency].rate;
  const usdAmount = amount * rate;
  return Math.floor(usdAmount / PRICE_PER_CREDIT_USD);
};

export const detectCurrency = (): CurrencyCode => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    if (locale.startsWith("en-IN")) return "INR";
    if (locale.startsWith("de") || locale.startsWith("fr")) return "EUR";
    if (locale.startsWith("en-US")) return "USD";
  } catch {
    // no-op fallback to USD
  }

  return "USD";
};
