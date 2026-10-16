import { useAuthSession } from "@shared/lib/auth/provider";
import { hasPermission, type PermissionRole } from "./permission";

export const usePermission = (requiredRoles: PermissionRole[] = []) => {
  const { session } = useAuthSession();

  return hasPermission({
    currentRole: session?.user?.role ?? null,
    requiredRoles,
  });
};
