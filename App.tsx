// App.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Platform } from "react-native";

// Conditionally import expo-dev-client (only if available, not required)
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("expo-dev-client");
  } catch (e) {
    // expo-dev-client is optional, ignore if not installed
  }
}
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { getStoredTokens } from "./src/utils/tokenStorage";
import { useAuthStore } from "./src/store/authStore";
import "./global.css";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App(): React.ReactElement {
  const [booting, setBooting] = useState(true);

  // Zustand store (reactive)
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const stored = await getStoredTokens();
        if (!mounted) return;

        if (stored.accessToken && stored.refreshToken) {
          setTokens(stored.accessToken, stored.refreshToken);
          // user will load lazily from ProfileScreen or useAuth logic
        }
      } catch (e) {
      } finally {
        if (mounted) setBooting(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const isAuthenticated = Boolean(accessToken && refreshToken);

  if (booting) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
