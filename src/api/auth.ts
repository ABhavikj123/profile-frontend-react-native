import axiosClient from "./axiosClient";
import { User } from "../store/authStore";
import { AxiosError } from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  bio?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface SignupResponse {
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface BackendAuthResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  token_type?: string;
  user?: User;
  profile?: User;
  id?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

function normalizeAuthResponse(data: unknown): {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
} {
  if (!data || typeof data !== "object") {
    return { accessToken: null, refreshToken: null, user: null };
  }

  const response = data as BackendAuthResponse;

  const accessToken = response.accessToken ?? response.access_token ?? null;
  const refreshToken = response.refreshToken ?? response.refresh_token ?? null;

  let user: User | null = response.user ?? response.profile ?? null;

  if (!user && response.id && response.name && response.email) {
    user = {
      id: response.id,
      name: response.name,
      email: response.email,
      bio: response.bio ?? null,
      is_active: response.is_active,
      created_at: response.created_at,
      updated_at: response.updated_at,
    };
  }

  return { accessToken, refreshToken, user };
}

function normalizeUser(data: unknown): User {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid user data in response");
  }

  const userData = data as Partial<User>;

  if (!userData.id || !userData.name || !userData.email) {
    throw new Error("Missing required user fields in response");
  }

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    bio: userData.bio ?? null,
    is_active: userData.is_active,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
  };
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axiosClient.post<BackendAuthResponse>(
      "/auth/login",
      payload
    );

    const { accessToken, refreshToken, user } = normalizeAuthResponse(response.data);

    if (!accessToken || !refreshToken) {
      throw new Error("Invalid login response: missing tokens");
    }

    const result: LoginResponse = { accessToken, refreshToken };

    if (user) result.user = user;

    return result;
  } catch (error) {
    if (error instanceof AxiosError) throw error;
    throw new Error(error instanceof Error ? error.message : "Login request failed");
  }
}

export async function signupRequest(payload: SignupPayload): Promise<SignupResponse> {
  try {
    const response = await axiosClient.post<BackendAuthResponse>(
      "/auth/signup",
      payload
    );

    const { user } = normalizeAuthResponse(response.data);

    if (!user) {
      const fallback = normalizeUser(response.data);
      return { user: fallback };
    }

    return { user };
  } catch (error) {
    if (error instanceof AxiosError) throw error;
    throw new Error(error instanceof Error ? error.message : "Signup request failed");
  }
}

export async function logoutRequest(): Promise<boolean> {
  try {
    const response = await axiosClient.post("/auth/logout");
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
}

export async function refreshRequest(
  refreshToken: string
): Promise<RefreshResponse | null> {
  try {
    const response = await axiosClient.post<BackendAuthResponse>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } =
      normalizeAuthResponse(response.data);

    if (!accessToken || !newRefreshToken) return null;

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    return null;
  }
}
