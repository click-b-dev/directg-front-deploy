export const renderRouteGuardModule = ({ framework } = {}) => {
  const loginPath = framework === "vite" ? "/#login" : "/login";
  const demoPath = framework === "vite" ? "/#demo" : "/demo";
  const publicPaths =
    framework === "vite" ? [loginPath, demoPath, "/#overview"] : [loginPath, demoPath];

  return {
    creates: [
      {
        relativePath: "src/shared/lib/route-guard.ts",
        content: `const LOGIN_PATH = "${loginPath}";
const DEMO_PATH = "${demoPath}";

const PUBLIC_PATHS = ${JSON.stringify(publicPaths)};

export const isPublicPath = (currentLocation: string) => {
  return PUBLIC_PATHS.some((path) => currentLocation.startsWith(path));
};

export const getLoginRedirectUrl = (currentLocation: string) => {
  return \`\${LOGIN_PATH}?redirect=\${encodeURIComponent(currentLocation)}\`;
};

export const canAccessRoute = ({
  currentLocation,
  isAuthenticated,
}: {
  currentLocation: string;
  isAuthenticated: boolean;
}) => {
  if (isPublicPath(currentLocation)) {
    return {
      allowed: true,
      redirectTo: null,
    };
  }

  if (!isAuthenticated) {
    return {
      allowed: false,
      redirectTo: getLoginRedirectUrl(currentLocation),
    };
  }

  return {
    allowed: true,
    redirectTo: null,
  };
};
`,
      },
      {
        relativePath: "src/features/route-guard/ui/route-guard.tsx",
        content: `import { useEffect, type PropsWithChildren } from "react";
import { useAuthSession } from "@shared/lib/auth/provider";
import { canAccessRoute } from "@shared/lib/route-guard";

type RouteGuardProps = PropsWithChildren;

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const { isAuthenticated, isHydrated } = useAuthSession();
  const currentLocation =
    typeof window === "undefined" ? "/" : \`\${window.location.pathname}\${window.location.hash}\`;
  const access = canAccessRoute({
    currentLocation,
    isAuthenticated,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const liveLocation = \`\${window.location.pathname}\${window.location.hash}\`;

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
`,
      },
      {
        relativePath: "src/features/route-guard/index.ts",
        content: `export { RouteGuard } from "./ui/route-guard";
`,
      },
    ],
  };
};
