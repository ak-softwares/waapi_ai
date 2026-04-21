import { AD_UNIT_IDS } from "@/src/ads/admobConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useRef } from "react";
import {
  AdEventType,
  InterstitialAd,
} from "react-native-google-mobile-ads";

const LAST_MESSAGE_OPEN_AD_DATE_KEY = "last_message_open_ad_date";

const getTodayKey = () => {
  return new Date().toISOString().slice(0, 10);
};

export const useDailyMessageOpenAd = () => {
  const checkingRef = useRef(false);

  const maybeShowAd = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const todayKey = getTodayKey();
      const lastShownDate = await AsyncStorage.getItem(
        LAST_MESSAGE_OPEN_AD_DATE_KEY
      );

      if (lastShownDate === todayKey) return;

      const interstitial = InterstitialAd.createForAdRequest(
        AD_UNIT_IDS.interstitial
      );

      const unsubscribeLoaded = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          interstitial.show();
        }
      );

      const unsubscribeClosed = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        async () => {
          await AsyncStorage.setItem(LAST_MESSAGE_OPEN_AD_DATE_KEY, todayKey);
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
        }
      );

      const unsubscribeError = interstitial.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
        }
      );

      interstitial.load();
    } finally {
      checkingRef.current = false;
    }
  }, []);

  return { maybeShowAd };
};
