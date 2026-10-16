export const renderPermissionModule = () => ({
  creates: [
    {
      relativePath: "src/shared/lib/permission.ts",
      content: `export type PermissionRole = string;

type PermissionCheckParams = {
  currentRole?: PermissionRole | null;
  requiredRoles?: PermissionRole[];
};

export const hasPermission = ({ currentRole, requiredRoles = [] }: PermissionCheckParams) => {
  if (requiredRoles.length === 0) {
    return true;
  }

  if (!currentRole) {
    return false;
  }

  return requiredRoles.includes(currentRole);
};

export const filterByPermission = <T extends { requiredRoles?: PermissionRole[] }>(
  items: T[],
  currentRole?: PermissionRole | null,
) => {
  return items.filter((item) =>
    hasPermission({
      currentRole,
      requiredRoles: item.requiredRoles,
    }),
  );
};
`,
    },
    {
      relativePath: "src/shared/lib/use-permission.ts",
      content: `import { useAuthSession } from "@shared/lib/auth/provider";
import { hasPermission, type PermissionRole } from "./permission";

export const usePermission = (requiredRoles: PermissionRole[] = []) => {
  const { session } = useAuthSession();

  return hasPermission({
    currentRole: session?.user?.role ?? null,
    requiredRoles,
  });
};
`,
    },
    {
      relativePath: "src/shared/ui/permission-gate.tsx",
      content: `import type { PropsWithChildren, ReactNode } from "react";
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
`,
    },
    {
      relativePath: "src/shared/ui/index.ts",
      content: `export { PermissionGate } from "./permission-gate";
`,
    },
  ],
});
