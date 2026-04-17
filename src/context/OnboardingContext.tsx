import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

type OnboardingContextType = {
  hasCompletedOnboarding: boolean;
  isReady: boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType>(
  {} as OnboardingContextType
);

export function OnboardingProvider({   
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadOnboardingState = async () => {
      const storedValue = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED_KEY
      );

      setHasCompletedOnboarding(storedValue === "true");
      setIsReady(true);
    };

    loadOnboardingState();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(
      ONBOARDING_COMPLETED_KEY,
      "true"
    );
    setHasCompletedOnboarding(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        isReady,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
