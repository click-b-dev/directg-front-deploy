import type { PropsWithChildren, ReactNode } from "react";
import { usePermission } from "@shared/lib/use-permission";
import type { PermissionRole } from "@shared/lib/permission";

type PermissionGateProps = PropsWithChildren<{
  requiredRoles?: PermissionRole[];
  fallback?: ReactNode;
}>;

export const PermissionGate = ({
  children,
  requiredRoles = [],
  fallback = null,
}: PermissionGateProps) => {
  const allowed = usePermission(requiredRoles);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
