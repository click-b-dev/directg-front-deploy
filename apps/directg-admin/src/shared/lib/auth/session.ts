import { AUTH_STORAGE_KEY } from "@shared/config/auth";

export type AuthUser = {
  id: string;
  name: string;
  role?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  user?: AuthUser | null;
};

const hasWindow = () => typeof window !== "undefined";

export const readSession = (): AuthSession | null => {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const writeSession = (session: AuthSession) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = async () => {
  return readSession()?.accessToken ?? null;
};

export const getRefreshToken = () => {
  return readSession()?.refreshToken ?? null;
};
