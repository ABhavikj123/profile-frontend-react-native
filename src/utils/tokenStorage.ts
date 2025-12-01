import { Platform } from "react-native";

type SecureStoreType = {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
};

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

const ACCESS_TOKEN_KEY = "app_access_token_v1";
const REFRESH_TOKEN_KEY = "app_refresh_token_v1";

let SecureStore: SecureStoreType | null = null;

function initializeSecureStore(): void {
  if (Platform.OS === "web" || SecureStore !== null) {
    return;
  }
  try {
    SecureStore = require("expo-secure-store") as SecureStoreType;
  } catch (error) {
    SecureStore = null;
    if (__DEV__) {
      console.warn("[tokenStorage] expo-secure-store not available:", error);
    }
  }
}

initializeSecureStore();

const isWeb = Platform.OS === "web";

const isSecureStoreAvailable = (): boolean => {
  return !isWeb && SecureStore !== null;
};

export async function saveTokens(
  accessToken: string | null,
  refreshToken: string | null
): Promise<void> {
  try {
    if (isWeb) {
      try {
        if (accessToken === null) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        } else {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        if (refreshToken === null) {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown localStorage error";
        if (__DEV__) {
          console.error("[tokenStorage] localStorage error:", errorMessage);
        }
        throw new Error(`Failed to save tokens: ${errorMessage}`);
      }
      return;
    }

    if (!isSecureStoreAvailable()) {
      const error = new Error(
        "expo-secure-store is not available on this platform"
      );
      if (__DEV__) {
        console.error("[tokenStorage]", error.message);
      }
      throw error;
    }

    if (accessToken === null) {
      await SecureStore!.deleteItemAsync(ACCESS_TOKEN_KEY);
    } else {
      await SecureStore!.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken === null) {
      await SecureStore!.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore!.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    if (__DEV__) {
      console.error("[tokenStorage] saveTokens error:", error);
    }
    throw error;
  }
}

export async function getStoredTokens(): Promise<StoredTokens> {
  try {
    if (isWeb) {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      return {
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
      };
    }

    if (!isSecureStoreAvailable()) {
      return { accessToken: null, refreshToken: null };
    }

    const accessToken = await SecureStore!.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore!.getItemAsync(REFRESH_TOKEN_KEY);

    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("[tokenStorage] getStoredTokens error:", error);
    }
    return { accessToken: null, refreshToken: null };
  }
}

export async function clearTokens(): Promise<void> {
  try {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }

    if (!isSecureStoreAvailable()) {
      return;
    }

    await SecureStore!.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore!.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    if (__DEV__) {
      console.warn("[tokenStorage] clearTokens error:", error);
    }
  }
}

export async function getAccessToken(): Promise<string | null> {
  const { accessToken } = await getStoredTokens();
  return accessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  const { refreshToken } = await getStoredTokens();
  return refreshToken;
}

export async function hasStoredTokens(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens.accessToken !== null || tokens.refreshToken !== null;
}
