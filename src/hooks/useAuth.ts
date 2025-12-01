import { useCallback } from "react";
import { useAuthStore, normalizeAuthError } from "../store/authStore";
import { loginRequest, signupRequest, logoutRequest } from "../api/auth";
import { getProfile } from "../api/profile";
import { User } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const error = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const clearAuthState = useAuthStore((s) => s.clearAuthState);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        const { accessToken, refreshToken } = await loginRequest({
          email: email.trim(),
          password,
        });

        await setTokens(accessToken, refreshToken);

        try {
          const profile = await getProfile();
          setUser(profile);
          return profile;
        } catch {
          return {
            id: "",
            name: "",
            email,
            bio: null,
            is_active: false,
            created_at: "",
            updated_at: "",
          };
        }
      } catch (rawError) {
        const normalizedError = normalizeAuthError(rawError);
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setTokens, setUser]
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      bio: string | null = null
    ): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        const { user: createdUser } = await signupRequest({
          name: name.trim(),
          email: email.trim(),
          password,
          bio,
        });

        if (!createdUser) {
          throw new Error("Signup failed: no user data returned");
        }

        return createdUser;
      } catch (rawError) {
        const normalizedError = normalizeAuthError(rawError);
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      try {
        await logoutRequest();
      } catch {}

      await clearAuthState();
      setError(null);
    } catch {
      try {
        await clearAuthState();
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearAuthState]);

  const loadInitialSession = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      await useAuthStore.getState().initializeFromStorage();

      const state = useAuthStore.getState();
      const hasValidTokens =
        state.accessToken !== null && state.refreshToken !== null;

      return hasValidTokens;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    user,
    error,
    isLoading,
    login,
    signup,
    logout,
    loadInitialSession,
    clearError,
  };
}
