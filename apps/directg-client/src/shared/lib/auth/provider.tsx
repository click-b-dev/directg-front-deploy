import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import {
  refreshAuthToken,
  signIn as requestSignIn,
  signOut as requestSignOut,
  type SignInRequest,
} from "@shared/api/auth";
import { clearSession, readSession, writeSession, type AuthSession } from "./session";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  signIn: (payload: SignInRequest) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSessionState(readSession());
    setIsHydrated(true);
  }, []);

  const setSession = (nextSession: AuthSession | null) => {
    setSessionState(nextSession);

    if (nextSession) {
      writeSession(nextSession);
      return;
    }

    clearSession();
  };

  const signIn = async (payload: SignInRequest) => {
    const response = await requestSignIn(payload);
    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      expiresAt: response.expiresAt ?? null,
      user: response.user ?? null,
    };

    setSession(nextSession);
    return nextSession;
  };

  const signOut = async () => {
    try {
      await requestSignOut();
    } catch {
      // The local session must still be cleared even if the API request fails.
    }

    setSession(null);
  };

  const refreshSession = async () => {
    const currentSession = readSession();
    if (!currentSession?.refreshToken) {
      setSession(null);
      return;
    }

    const response = await refreshAuthToken({ refreshToken: currentSession.refreshToken });
    const nextSession = {
      ...currentSession,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? currentSession.refreshToken ?? null,
      expiresAt: response.expiresAt ?? currentSession.expiresAt ?? null,
    };

    setSession(nextSession);
  };

  const value: AuthContextValue = {
    session,
    isAuthenticated: Boolean(session?.accessToken),
    isHydrated,
    setSession,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthSession = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthSession must be used inside AuthProvider");
  }

  return value;
};
