import type { PropsWithChildren } from "react";

type AppErrorBoundaryProps = PropsWithChildren;

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  return <>{children}</>;
};
