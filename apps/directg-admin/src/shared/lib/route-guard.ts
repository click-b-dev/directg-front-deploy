const LOGIN_PATH = "/login";

// 리뉴얼 로그인(/renewal/login)도 공개 경로다.
const PUBLIC_PATHS = ["/login", "/renewal/login", "/demo"];

export const isPublicPath = (currentLocation: string) => {
  return PUBLIC_PATHS.some((path) => currentLocation.startsWith(path));
};

const RENEWAL_LOGIN_PATH = "/renewal/login";

export const getLoginRedirectUrl = (currentLocation: string) => {
  // 리뉴얼 화면에서 로그인이 풀리면 리뉴얼 로그인으로 보낸다.
  const loginPath = currentLocation.startsWith("/renewal") ? RENEWAL_LOGIN_PATH : LOGIN_PATH;
  return `${loginPath}?redirect=${encodeURIComponent(currentLocation)}`;
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
