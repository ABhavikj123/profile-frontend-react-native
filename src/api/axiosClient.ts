import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getStoredTokens, saveTokens, clearTokens } from "../utils/tokenStorage";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

const REQUEST_TIMEOUT_MS = 15000;

const MAX_RETRY_ATTEMPTS = 1;

let isRefreshing = false;

let refreshPromise: Promise<string | null> | null = null;

interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: InternalAxiosRequestConfig;
}

const failedQueue: QueuedRequest[] = [];

function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token && prom.config.headers) {
      prom.config.headers.Authorization = `Bearer ${token}`;
      axiosClient(prom.config).then(prom.resolve).catch(prom.reject);
    }
  });
  failedQueue.length = 0;
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const stored = await getStoredTokens();
      const refreshToken = stored.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      const data = response.data;
      const accessToken = data.accessToken ?? data.access_token ?? null;
      const newRefreshToken = data.refreshToken ?? data.refresh_token ?? refreshToken;

      if (!accessToken || !newRefreshToken) {
        throw new Error("Invalid refresh token response");
      }

      await saveTokens(accessToken, newRefreshToken);
      await useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      return accessToken;
    } catch (error) {
      try {
        await clearTokens();
        useAuthStore.getState().clearAuthState();
      } catch {}
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      try {
        const stored = await getStoredTokens();
        accessToken = stored.accessToken;

        if (accessToken && stored.refreshToken) {
          await useAuthStore.getState().setTokens(accessToken, stored.refreshToken);
        }
      } catch {}
    }

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.headers) {
      config.headers.Accept = "application/json";

      if (config.data && !config.headers["Content-Type"]) {
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        } else {
          config.headers["Content-Type"] = "application/json";
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isUnauthorized = status === 401;

    if (isUnauthorized && !originalRequest._retry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount > MAX_RETRY_ATTEMPTS) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        processQueue(error);
        return Promise.reject(error);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      try {
        return await axiosClient(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function isTokenRefreshInProgress(): boolean {
  return isRefreshing;
}
