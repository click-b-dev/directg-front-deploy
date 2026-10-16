// ─── Types ───

export interface CookieOptions {
  /** 만료일까지 남은 일수 */
  days?: number;
  /** 만료 Date 객체 (days보다 우선) */
  expires?: Date;
  /** 쿠키 경로 (기본값: "/") */
  path?: string;
  /** 도메인 */
  domain?: string;
  /** HTTPS에서만 전송 (기본값: false) */
  secure?: boolean;
  /** SameSite 정책 (기본값: "Lax") */
  sameSite?: "Strict" | "Lax" | "None";
  /** HttpOnly (서버 설정용, 클라이언트에서는 무시됨) */
  httpOnly?: boolean;
}

export interface CookieKeyConfig<K extends string = string> {
  /** 쿠키 키 이름 */
  name: K;
  /** 이 키에 적용할 기본 옵션 */
  defaultOptions?: CookieOptions;
}

export interface CookieKeyMap<K extends string = string> {
  keys: Record<K, CookieKeyConfig<K>>;
  /** 모든 키에 공통 적용할 기본 옵션 */
  defaultOptions: CookieOptions;
  /** 키 이름 조회 */
  getName: (key: K) => string;
  /** 키별 옵션 병합 (공통 기본 + 키별 기본 + 호출 시 오버라이드) */
  getOptions: (key: K, overrides?: CookieOptions) => CookieOptions;
}

// ─── Cookie CRUD ───

const buildCookieString = (name: string, value: string, options: CookieOptions = {}): string => {
  const { days, expires, path = "/", domain, secure = false, sameSite = "Lax" } = options;

  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    cookieStr += `; expires=${expires.toUTCString()}`;
  } else if (days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    cookieStr += `; expires=${date.toUTCString()}`;
  }

  cookieStr += `; path=${path}`;
  if (domain) cookieStr += `; domain=${domain}`;
  if (secure) cookieStr += "; secure";
  cookieStr += `; samesite=${sameSite}`;

  // SameSite=None은 Secure 필수
  if (sameSite === "None" && !secure) {
    cookieStr += "; secure";
  }

  return cookieStr;
};

/** 쿠키 값 조회. SSR 환경이거나 존재하지 않으면 null 반환. */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const encoded = encodeURIComponent(name);
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) continue;

    const key = cookie.slice(0, eqIndex);
    if (key === encoded) {
      return decodeURIComponent(cookie.slice(eqIndex + 1));
    }
  }

  return null;
};

/** 쿠키 설정 */
export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
  if (typeof document === "undefined") return;
  document.cookie = buildCookieString(name, value, options);
};

/** 쿠키 삭제 (만료일을 과거로 설정) */
export const removeCookie = (
  name: string,
  options?: Pick<CookieOptions, "path" | "domain">,
): void => {
  if (typeof document === "undefined") return;
  const { path = "/", domain } = options ?? {};
  setCookie(name, "", { expires: new Date(0), path, domain });
};

/** 쿠키 존재 여부 확인 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/** 모든 쿠키를 key-value 객체로 반환 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof document === "undefined") return {};

  const result: Record<string, string> = {};
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) continue;

    const key = decodeURIComponent(cookie.slice(0, eqIndex));
    const value = decodeURIComponent(cookie.slice(eqIndex + 1));
    if (key) result[key] = value;
  }

  return result;
};

// ─── Cookie Key Manager ───

/**
 * 쿠키 키를 중앙 관리하는 맵 생성.
 * 키별 기본 옵션과 공통 기본 옵션을 설정하여 일관된 쿠키 정책을 적용한다.
 *
 * @example
 * const cookies = createCookieKeys({
 *   defaultOptions: { secure: true, sameSite: "Strict", path: "/" },
 *   keys: {
 *     accessToken: { defaultOptions: { days: 1 } },
 *     refreshToken: { defaultOptions: { days: 30 } },
 *     theme: { defaultOptions: { days: 365, secure: false } },
 *     locale: {},
 *   },
 * });
 *
 * // 키 이름 조회
 * cookies.getName("accessToken"); // "accessToken"
 *
 * // 옵션 병합: 공통 { secure, sameSite, path } + 키별 { days } + 오버라이드
 * setCookie(cookies.getName("accessToken"), token, cookies.getOptions("accessToken"));
 *
 * // Secure 일괄 적용 시 defaultOptions.secure = true 한 줄이면 끝
 */
export const createCookieKeys = <K extends string>(config: {
  keys: Record<K, Omit<CookieKeyConfig<K>, "name"> | Record<string, never>>;
  defaultOptions?: CookieOptions;
}): CookieKeyMap<K> => {
  const { defaultOptions = {} } = config;

  const keys = {} as Record<K, CookieKeyConfig<K>>;
  for (const key of Object.keys(config.keys) as K[]) {
    const entry = config.keys[key];
    keys[key] = {
      name: key,
      defaultOptions: "defaultOptions" in entry ? entry.defaultOptions : undefined,
    };
  }

  const getName = (key: K): string => keys[key].name;

  const getOptions = (key: K, overrides?: CookieOptions): CookieOptions => ({
    ...defaultOptions,
    ...keys[key].defaultOptions,
    ...overrides,
  });

  return { keys, defaultOptions, getName, getOptions };
};
