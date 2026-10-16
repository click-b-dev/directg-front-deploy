import type { PropsWithChildren } from "react";
import { AppErrorBoundary } from "@app/error-boundary";
import { AuthProvider } from "@shared/lib/auth/provider";
import { RouteGuard } from "@features/route-guard";
import { LayoutShell } from "@widgets/layout-shell";

type AppProvidersProps = PropsWithChildren;

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <RouteGuard>
          <LayoutShell>{children}</LayoutShell>
        </RouteGuard>
      </AuthProvider>
    </AppErrorBoundary>
  );
};
