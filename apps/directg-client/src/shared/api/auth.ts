import { apiClient } from "./client";

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  user?: {
    id: string;
    name: string;
    role?: string;
  } | null;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
};

export const signIn = async (payload: SignInRequest) => {
  return apiClient.post<SignInResponse>("/auth/login", payload);
};

export const refreshAuthToken = async (payload: RefreshTokenRequest) => {
  return apiClient.post<RefreshTokenResponse>("/auth/token/refresh", payload);
};

export const signOut = async () => {
  await apiClient.void("post", "/auth/logout");
};
