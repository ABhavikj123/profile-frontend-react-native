
import { create } from "zustand";
import { saveTokens, clearTokens, getStoredTokens } from "../utils/tokenStorage";


export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}


export type AuthErrorType =
  | "NETWORK_ERROR"
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "TOKEN_REFRESH_FAILED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";


export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: unknown;
}

interface LoadingState {
  isLoading: boolean;
  isInitializing: boolean;
}


interface AuthState extends LoadingState {

  user: User | null;

  accessToken: string | null;
  refreshToken: string | null;

  isAuthenticated: boolean;

  error: AuthError | null;

  setUser: (user: User | null) => void;
  setTokens: (access: string | null, refresh: string | null) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setInitializing: (isInitializing: boolean) => void;
  setError: (error: AuthError | null) => void;
  clearAuthState: () => Promise<void>;
  initializeFromStorage: () => Promise<void>;
  isTokenValid: () => boolean;
}


export function normalizeAuthError(error: unknown): AuthError {

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number; data?: unknown } };
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    let message = "An error occurred. Please try again.";
    if (data && typeof data === "object") {
      if ("detail" in data && typeof data.detail === "string") {
        message = data.detail;
      } else if ("message" in data && typeof data.message === "string") {
        message = data.message;
      } else if ("error" in data && typeof data.error === "string") {
        message = data.error;
      }
    }
    switch (status) {
      case 401:
        return {
          type: "INVALID_CREDENTIALS",
          message: "Invalid email or password. Please try again.",
          originalError: error,
        };
      case 403:
        return {
          type: "UNAUTHORIZED",
          message: "You don't have permission to perform this action.",
          originalError: error,
        };
      case 422:
        return {
          type: "VALIDATION_ERROR",
          message: message || "Please check your input and try again.",
          originalError: error,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: "SERVER_ERROR",
          message: "Server error. Please try again later.",
          originalError: error,
        };
      default:
        return {
          type: "NETWORK_ERROR",
          message: message || "Network error. Please check your connection.",
          originalError: error,
        };
    }
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return {
        type: "NETWORK_ERROR",
        message: "Network error. Please check your connection and try again.",
        originalError: error,
      };
    }

    if (message.includes("token") || message.includes("expired")) {
      return {
        type: "TOKEN_EXPIRED",
        message: "Your session has expired. Please log in again.",
        originalError: error,
      };
    }

    return {
      type: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred.",
      originalError: error,
    };
  }

  return {
    type: "UNKNOWN_ERROR",
    message: "An unexpected error occurred. Please try again.",
    originalError: error,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({

  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: false,
  error: null,

 
  setUser: (user) => {
    set((state) => ({
      user,
      isAuthenticated: user !== null && state.accessToken !== null,
    }));
  },


  setTokens: async (accessToken, refreshToken) => {
    try {
      await saveTokens(accessToken, refreshToken);

      set((state) => ({
        accessToken,
        refreshToken,
        isAuthenticated: accessToken !== null && refreshToken !== null && state.user !== null,
        error: null,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error("[authStore] Failed to save tokens to storage:", error);
      }

      set((state) => ({
        accessToken,
        refreshToken,
        isAuthenticated: accessToken !== null && refreshToken !== null && state.user !== null,
      }));
    }
  },


  setLoading: (isLoading) => {
    set({ isLoading });
  },

 
  setInitializing: (isInitializing) => {
    set({ isInitializing });
  },

  setError: (error) => {
    set({ error });
  },


  clearAuthState: async () => {
    try {
      await clearTokens();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      if (__DEV__) {
        console.error("[authStore] Failed to clear tokens from storage:", error);
      }

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },

  
  initializeFromStorage: async () => {
    const state = get();
    if (state.isInitializing) {
      return; 
    }

    set({ isInitializing: true, error: null });

    try {
      const stored = await getStoredTokens();

      if (stored.accessToken && stored.refreshToken) {
        set({
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          isAuthenticated: false, 
          isInitializing: false,
        });
      } else {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[authStore] Failed to initialize from storage:", error);
      }
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitializing: false,
        error: null, 
      });
    }
  },

 
  isTokenValid: () => {
    const state = get();
    return state.accessToken !== null && state.refreshToken !== null;
  },
}));
