import { create } from "zustand";
import { User, normalizeAuthError, AuthError } from "./authStore";

interface ProfileLoadingState {
  isLoading: boolean;
  isUpdating: boolean;
  isRefreshing: boolean;
}

interface ProfileState extends ProfileLoadingState {
  profile: User | null;
  lastFetched: number | null;
  error: AuthError | null;
  setProfile: (profile: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: AuthError | null) => void;
  clearProfile: () => void;
  markAsFetched: () => void;
  isStale: (maxAgeMs?: number) => boolean;
}

const DEFAULT_CACHE_AGE_MS = 5 * 60 * 1000;

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  isRefreshing: false,
  lastFetched: null,
  error: null,

  setProfile: (profile) => {
    set({
      profile,
      lastFetched: Date.now(),
      error: null,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setUpdating: (isUpdating) => {
    set({ isUpdating });
  },

  setRefreshing: (isRefreshing) => {
    set({ isRefreshing });
  },

  setError: (error) => {
    set({ error });
  },

  clearProfile: () => {
    set({
      profile: null,
      lastFetched: null,
      error: null,
      isLoading: false,
      isUpdating: false,
      isRefreshing: false,
    });
  },

  markAsFetched: () => {
    set({ lastFetched: Date.now() });
  },

  isStale: (maxAgeMs = DEFAULT_CACHE_AGE_MS) => {
    const state = get();
    if (!state.lastFetched || !state.profile) {
      return true;
    }
    return Date.now() - state.lastFetched > maxAgeMs;
  },
}));

export function syncProfileWithAuth(
  profile: User,
  authStoreSetUser: (user: User | null) => void
): void {
  useProfileStore.getState().setProfile(profile);
  authStoreSetUser(profile);
}

export function handleProfileError(error: unknown): AuthError {
  const normalized = normalizeAuthError(error);
  useProfileStore.getState().setError(normalized);
  return normalized;
}

export function clearProfileError(): void {
  useProfileStore.getState().setError(null);
}
