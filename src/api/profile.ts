import axiosClient from "./axiosClient";
import { User } from "../store/authStore";
import { AxiosError } from "axios";

export interface UpdateProfilePayload {
  name?: string;
  bio?: string | null;
}

interface BackendProfileResponse {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

function normalizeProfileResponse(data: unknown): User {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid profile response: empty or invalid data");
  }

  const profile = data as Partial<BackendProfileResponse>;

  if (!profile.id || typeof profile.id !== "string") {
    throw new Error("Invalid profile response: missing or invalid id");
  }

  if (!profile.name || typeof profile.name !== "string") {
    throw new Error("Invalid profile response: missing or invalid name");
  }

  if (!profile.email || typeof profile.email !== "string") {
    throw new Error("Invalid profile response: missing or invalid email");
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio ?? null,
    is_active: profile.is_active,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export async function getProfile(): Promise<User> {
  try {
    const response = await axiosClient.get<BackendProfileResponse>("/profile/me");
    return normalizeProfileResponse(response.data);
  } catch (error) {
    if (error instanceof AxiosError) throw error;
    if (error instanceof Error) throw error;
    throw new Error("Failed to fetch profile");
  }
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<User> {
  if (!payload.name && payload.bio === undefined) {
    throw new Error("Update payload must contain at least one field");
  }

  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();
    if (trimmedName.length === 0) {
      throw new Error("Name cannot be empty");
    }
    if (trimmedName.length > 255) {
      throw new Error("Name is too long");
    }
  }

  if (payload.bio !== undefined && payload.bio !== null) {
    const trimmedBio = payload.bio.trim();
    if (trimmedBio.length > 1000) {
      throw new Error("Bio is too long");
    }
  }

  try {
    const response = await axiosClient.put<BackendProfileResponse>(
      "/profile/me",
      payload
    );

    return normalizeProfileResponse(response.data);
  } catch (error) {
    if (error instanceof AxiosError) throw error;
    if (error instanceof Error) throw error;
    throw new Error("Failed to update profile");
  }
}
