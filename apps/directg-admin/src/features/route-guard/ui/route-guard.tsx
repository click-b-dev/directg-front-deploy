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
    // hydration 완료 전에는 리다이렉트하지 않는다. AuthProvider가 localStorage 세션을
    // 복원하기 전(초기 isAuthenticated=false)에 이 effect가 먼저 돌면, 유효 세션으로
    // 새로고침/딥링크 시에도 /login으로 잘못 튕긴다(legacy: 유효 세션이면 유지).
    if (typeof window === "undefined" || !isHydrated) {
      return;
    }

    const liveLocation = `${window.location.pathname}${window.location.hash}`;

    if (!access.allowed && access.redirectTo && liveLocation !== access.redirectTo) {
      window.location.assign(access.redirectTo);
    }
  }, [access.allowed, access.redirectTo, isHydrated]);

  if (!isHydrated || typeof window === "undefined") {
    return <>{children}</>;
  }

  if (!access.allowed) {
    return null;
  }

  return <>{children}</>;
};
