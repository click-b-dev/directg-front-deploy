import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppErrorBoundary } from "@app/error-boundary";
import { queryClient } from "@app/query-client";
import { AuthProvider } from "@shared/lib/auth/provider";
import { RouteGuard } from "@features/route-guard";
import { LayoutShell } from "@widgets/layout-shell";

type AppProvidersProps = PropsWithChildren;

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouteGuard>
            <LayoutShell>{children}</LayoutShell>
          </RouteGuard>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};
