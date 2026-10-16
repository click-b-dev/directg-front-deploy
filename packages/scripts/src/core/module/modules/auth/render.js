export const renderAuthModule = ({ framework } = {}) => {
  const loginHref = framework === "vite" ? "/#login" : "/login";

  return {
    creates: [
      {
        relativePath: "src/shared/config/auth.ts",
        content: `export const AUTH_STORAGE_KEY = "click-b.auth";
export const AUTH_LOGIN_PATH = "/login";
export const AUTH_HASH_LOGIN_PATH = "/#login";
export const AUTH_REFRESH_PATH = "/auth/token/refresh";
`,
      },
      {
        relativePath: "src/shared/lib/auth/session.ts",
        content: `import { AUTH_STORAGE_KEY } from "@shared/config/auth";

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
`,
      },
      {
        relativePath: "src/shared/lib/auth/provider.tsx",
        content: `import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { refreshAuthToken, signIn as requestSignIn, signOut as requestSignOut, type SignInRequest } from "@shared/api/auth";
import {
  clearSession,
  readSession,
  writeSession,
  type AuthSession,
} from "./session";

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
`,
      },
      {
        relativePath: "src/widgets/auth-status/ui/auth-status-panel.tsx",
        content: `import { useAuthSession } from "@shared/lib/auth/provider";

export const AuthStatusPanel = () => {
  const { isHydrated, isAuthenticated, session, signOut } = useAuthSession();

  if (!isHydrated) {
    return <span style={{ color: "#94a3b8", fontSize: 12 }}>Loading session...</span>;
  }

  if (!isAuthenticated) {
    return (
      <a
        href="${loginHref}"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 999,
          backgroundColor: "#0f172a",
          color: "#ffffff",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Sign in
      </a>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ textAlign: "right" }}>
        <strong style={{ display: "block", fontSize: 13 }}>
          {session?.user?.name ?? "Authenticated user"}
        </strong>
        <span style={{ color: "#64748b", fontSize: 12 }}>
          {session?.user?.role ?? "member"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          void signOut();
        }}
        style={{
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
};
`,
      },
      {
        relativePath: "src/widgets/auth-status/index.ts",
        content: `export { AuthStatusPanel } from "./ui/auth-status-panel";
`,
      },
      {
        relativePath: "src/shared/api/auth.ts",
        content: `import { apiClient } from "./client";

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
`,
      },
    ],
  };
};
