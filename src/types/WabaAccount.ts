export type WaSetupStatus = {
  isTokenAvailable: boolean;
  isAppSubscription: boolean;
  isPhoneRegistered: boolean;
  isPhoneVerified?: boolean;
};

export type WabaPhoneNumber = {
  id: string;
  verified_name?: string;
  display_phone_number?: string;
  last_onboarded_time?: string;
  quality_rating?: string;
  code_verification_status?: "VERIFIED" | "UNVERIFIED" | string;
};

export type WabaAccount = {
  id: string;
  name?: string;
  account_review_status?: "APPROVED" | "PENDING" | "REJECTED" | string;
  phone_numbers?: WabaPhoneNumber[];
};
