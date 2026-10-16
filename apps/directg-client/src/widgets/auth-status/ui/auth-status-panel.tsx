import { useAuthSession } from "@shared/lib/auth/provider";

export const AuthStatusPanel = () => {
  const { isHydrated, isAuthenticated, session, signOut } = useAuthSession();

  if (!isHydrated) {
    return <span style={{ color: "#94a3b8", fontSize: 12 }}>Loading session...</span>;
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
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
        <span style={{ color: "#64748b", fontSize: 12 }}>{session?.user?.role ?? "member"}</span>
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
