import { useEffect, type PropsWithChildren } from "react";
import { useAuthSession } from "@shared/lib/auth/provider";
import { canAccessRoute } from "@shared/lib/route-guard";

type RouteGuardProps = PropsWithChildren;

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const { isAuthenticated, isHydrated } = useAuthSession();
  const currentLocation =
    typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.hash}`;
  const access = canAccessRoute({
    currentLocation,
    isAuthenticated,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const liveLocation = `${window.location.pathname}${window.location.hash}`;

    if (!access.allowed && access.redirectTo && liveLocation !== access.redirectTo) {
      window.location.assign(access.redirectTo);
    }
  }, [access.allowed, access.redirectTo]);

  if (!isHydrated || typeof window === "undefined") {
    return <>{children}</>;
  }

  if (!access.allowed) {
    return null;
  }

  return <>{children}</>;
};
