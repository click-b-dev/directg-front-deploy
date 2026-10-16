export type PermissionRole = string;

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
