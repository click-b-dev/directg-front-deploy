const LOGIN_PATH = "/login";

const PUBLIC_PATHS = ["/login", "/demo"];

export const isPublicPath = (currentLocation: string) => {
  return PUBLIC_PATHS.some((path) => currentLocation.startsWith(path));
};

export const getLoginRedirectUrl = (currentLocation: string) => {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(currentLocation)}`;
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
