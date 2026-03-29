import { api } from "@/src/lib/api/apiClient";
import { ApiResponse } from "@/src/types/ApiResponse";
import { CreatedOrderResponse, RazorpayOptionsNative } from "@/src/types/Razorpay-native";
import { useState } from "react";
import RazorpayCheckout from "react-native-razorpay";

interface UseRazorpayPaymentParams {
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export function useRazorpayPayment() {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async ({
    amount,
    currency = "INR",
    name = "WA API",
    description = "Payment",
    onSuccess,
    onFailure,
  }: UseRazorpayPaymentParams) => {
    setLoading(true);

    try {
      // 1️⃣ Create Order (same as your Next.js)
      const orderResponse = await api.post("/razorpay/create-order", {
        amount,
        currency,
      });

      // Axios already parses JSON
      const orderBody: ApiResponse = orderResponse.data;

      if (!orderBody.success) {
        throw new Error(orderBody.message);
      }

      const orderData: CreatedOrderResponse = orderBody.data;

      // 2️⃣ Open Razorpay Checkout
      const options: RazorpayOptionsNative = {
        description: description ?? "",
        currency: orderData.currency,
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        name,
        order_id: orderData.id,

        prefill: {
          name: orderData.user?.name ?? "User",
          email: orderData.user?.email ?? "customer@example.com",
          contact: orderData.user?.phone ?? "9999999999",
        },

        theme: { color: "#3399cc" },
      };

      // 3️⃣ Open Payment UI
      const response = await RazorpayCheckout.open(options);
      
      // 4️⃣ Verify Payment (using api client)
      const { data: verifyBody } = await api.post<ApiResponse>(
        "/razorpay/verify-payment",
        response
      );

      if (verifyBody.success) {
        onSuccess?.();
      } else {
        onFailure?.(verifyBody.message || "Verification failed");
      }
    } catch (err: any) {
      console.log("eroro: ", err)
      onFailure?.(err?.description || err?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
}