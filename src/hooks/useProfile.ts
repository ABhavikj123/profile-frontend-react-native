import { useCallback } from "react";
import { useAuthStore, normalizeAuthError, User } from "../store/authStore";
import {
  useProfileStore,
  syncProfileWithAuth,
} from "../store/profileStore";
import {
  getProfile,
  updateProfile,
  UpdateProfilePayload,
} from "../api/profile";

export function useProfile() {
  const authUser = useAuthStore((s) => s.user);
  const authSetUser = useAuthStore((s) => s.setUser);

  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const isUpdating = useProfileStore((s) => s.isUpdating);
  const isRefreshing = useProfileStore((s) => s.isRefreshing);
  const error = useProfileStore((s) => s.error);

  const setProfile = useProfileStore((s) => s.setProfile);
  const setLoading = useProfileStore((s) => s.setLoading);
  const setUpdating = useProfileStore((s) => s.setUpdating);
  const setRefreshing = useProfileStore((s) => s.setRefreshing);
  const setError = useProfileStore((s) => s.setError);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const isStale = useProfileStore((s) => s.isStale);

  const fetchProfile = useCallback(
    async (force = false): Promise<User> => {
      if (!force && profile && !isStale()) {
        return profile;
      }

      try {
        setLoading(true);
        setError(null);

        const fetchedProfile = await getProfile();
        syncProfileWithAuth(fetchedProfile, authSetUser);

        return fetchedProfile;
      } catch (rawError) {
        const normalized = normalizeAuthError(rawError);
        setError(normalized);
        throw normalized;
      } finally {
        setLoading(false);
      }
    },
    [profile, isStale, setLoading, setError, authSetUser]
  );

  const refreshProfile = useCallback(async (): Promise<User> => {
    try {
      setRefreshing(true);
      setError(null);

      const refreshedProfile = await getProfile();
      syncProfileWithAuth(refreshedProfile, authSetUser);

      return refreshedProfile;
    } catch (rawError) {
      const normalized = normalizeAuthError(rawError);
      setError(normalized);
      throw normalized;
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing, setError, authSetUser]);

  const updateProfileData = useCallback(
    async (payload: UpdateProfilePayload): Promise<User> => {
      if (!payload.name && payload.bio === undefined) {
        const err = new Error("At least one field must be provided");
        const normalized = normalizeAuthError(err);
        setError(normalized);
        throw normalized;
      }

      try {
        setUpdating(true);
        setError(null);

        const updated = await updateProfile(payload);
        syncProfileWithAuth(updated, authSetUser);

        return updated;
      } catch (rawError) {
        const normalized = normalizeAuthError(rawError);
        setError(normalized);
        throw normalized;
      } finally {
        setUpdating(false);
      }
    },
    [setUpdating, setError, authSetUser]
  );

  const clearProfileData = useCallback(() => {
    clearProfile();
    setError(null);
  }, [clearProfile, setError]);

  const clearProfileError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    profile,
    error,
    isLoading,
    isUpdating,
    isRefreshing,

    fetchProfile,
    refreshProfile,
    updateProfileData,
    clearProfileData,
    clearProfileError,

    isStale,
  };
}
