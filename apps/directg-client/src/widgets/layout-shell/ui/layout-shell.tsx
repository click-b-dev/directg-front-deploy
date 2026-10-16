import type { PropsWithChildren } from "react";
import { AppNavigation } from "@widgets/app-navigation";
import { env } from "@shared/config/env";
import { AuthStatusPanel } from "@widgets/auth-status";

type LayoutShellProps = PropsWithChildren;

export const LayoutShell = ({ children }: LayoutShellProps) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e2e8f0",
          padding: "24px 16px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <strong style={{ display: "block", fontSize: 18 }}>{env.appName}</strong>
          <span style={{ color: "#64748b", fontSize: 13 }}>{env.appPreset}</span>
        </div>
        <AppNavigation />
      </aside>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 64,
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <strong>{env.appName}</strong>
          <AuthStatusPanel />
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
};
