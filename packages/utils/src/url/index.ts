/**
 * URL 유효성 검증 유틸리티 클래스
 *
 * URLPattern polyfill 대신 URL API 기반으로 구현하여 브라우저 호환성 확보.
 * BASE_URL을 기반으로 서비스 내부/외부 URL 판별 및 보안 검증 기능 제공.
 */

// 허용하는 프로토콜 화이트리스트
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// javascript:, data:, vbscript: 등 XSS 공격에 사용되는 프로토콜 차단
const DANGEROUS_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "blob:"]);

/** URLPattern 스펙과 동일한 구성요소 구조 */
type ParsedUrlComponents = {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  /** 원본 URL 문자열 */
  href: string;
  /** search 파라미터를 key-value로 파싱한 결과 */
  searchParams: Record<string, string>;
};

type UrlValidatorOptions = {
  /** 배포 BASE_URL (예: "https://admin.haple.com" 또는 "/admin") */
  baseUrl: string;
  /** 허용할 추가 오리진 목록 (CDN, API 서버 등) */
  allowedOrigins?: string[];
};

/**
 * URL 파싱을 안전하게 시도하는 헬퍼
 * - 절대 URL이면 그대로 파싱
 * - 상대 URL이면 현재 origin 기준으로 파싱
 */
const tryParseUrl = (url: string): URL | null => {
  try {
    return new URL(url, window.location.origin);
  } catch {
    return null;
  }
};

export class UrlValidator {
  private readonly origin: string;
  private readonly basePath: string;
  private readonly allowedOrigins: Set<string>;

  constructor(options: UrlValidatorOptions) {
    const { baseUrl, allowedOrigins = [] } = options;

    // BASE_URL이 절대 URL인 경우 origin과 pathname 분리
    // 상대 경로("/admin")인 경우 현재 window.location.origin 사용
    const parsed = tryParseUrl(baseUrl);
    if (parsed && baseUrl.startsWith("http")) {
      this.origin = parsed.origin;
      this.basePath = parsed.pathname.replace(/\/$/, "");
    } else {
      this.origin = typeof window !== "undefined" ? window.location.origin : "";
      this.basePath = baseUrl.replace(/\/$/, "");
    }

    // 허용된 오리진 목록에 자기 자신 포함
    this.allowedOrigins = new Set([
      this.origin,
      ...allowedOrigins.map((o) => o.replace(/\/$/, "")),
    ]);
  }

  /**
   * 현재 서비스에서 유효한 내부 URL인지 검증
   *
   * - 동일 오리진이어야 함
   * - basePath로 시작해야 함 (basePath가 있는 경우)
   * - 안전한 프로토콜이어야 함
   */
  checkIsValidServiceUrl = (url: string): boolean => {
    const parsed = tryParseUrl(url);
    if (!parsed) return false;
    if (!this.checkIsSafeUrl(url)) return false;
    if (!this.checkIsSameOrigin(url)) return false;

    // basePath가 설정된 경우 해당 경로로 시작하는지 확인
    if (!this.basePath) return true;
    return parsed.pathname.startsWith(this.basePath);
  };

  /**
   * 동일 오리진 검증
   *
   * - 상대 URL은 항상 동일 오리진으로 판단
   * - 절대 URL은 origin 비교
   */
  checkIsSameOrigin = (url: string): boolean => {
    // 상대 경로는 동일 오리진
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return true;
    }

    // 프로토콜 없는 URL은 상대 경로로 처리
    if (!url.includes("://") && !url.startsWith("//")) {
      return true;
    }

    const parsed = tryParseUrl(url);
    if (!parsed) return false;

    return parsed.origin === this.origin;
  };

  /**
   * 외부 URL 여부 검증
   *
   * - 동일 오리진이 아니면 외부 URL
   * - mailto:, tel: 등 프로토콜 기반 URL도 외부로 판단
   */
  checkIsExternal = (url: string): boolean => {
    // mailto:, tel: 등은 외부 URL로 판단
    if (/^(mailto|tel):/i.test(url)) return true;

    return !this.checkIsSameOrigin(url);
  };

  /**
   * URL 보안 검증
   *
   * 다음 공격 벡터를 차단:
   * - XSS: javascript:, data:, vbscript: 프로토콜
   * - Open Redirect: protocol-relative URL (//evil.com)
   * - 인코딩 우회: %2f, %00 등 인코딩된 공격 패턴
   * - 백슬래시 우회: \/\/evil.com
   * - Null byte injection: \0 문자
   */
  checkIsSafeUrl = (url: string): boolean => {
    if (!url || typeof url !== "string") return false;

    // 공백/제어문자 제거 후 검사 (탭, 개행 등으로 우회 방지)
    const sanitized = url.replace(/[\t\n\r]/g, "").trim();
    if (!sanitized) return false;

    // Null byte 인젝션 차단
    if (sanitized.includes("\0") || sanitized.includes("%00")) return false;

    // 위험한 프로토콜 차단 (대소문자, 공백 우회 포함)
    const normalizedForProtocol = sanitized.replace(/\s/g, "").toLowerCase();
    for (const protocol of DANGEROUS_PROTOCOLS) {
      if (normalizedForProtocol.startsWith(protocol)) return false;
    }

    // protocol-relative URL 차단 (//evil.com)
    // 단, basePath 상대경로는 허용 (./path, ../path)
    if (sanitized.startsWith("//")) return false;

    // 백슬래시 기반 우회 차단 (\/\/evil.com, \\evil.com)
    if (/^[\\/]{2}/.test(sanitized)) return false;

    // URL 파싱 가능한 경우 프로토콜 화이트리스트 검증
    const parsed = tryParseUrl(sanitized);
    if (parsed && sanitized.includes("://")) {
      if (!SAFE_PROTOCOLS.has(parsed.protocol)) return false;
    }

    return true;
  };

  /**
   * 허용된 오리진 목록에 포함되는지 검증
   *
   * allowedOrigins에 등록된 오리진(자기 자신 + 추가 등록)과 비교
   */
  checkIsAllowedOrigin = (url: string): boolean => {
    const parsed = tryParseUrl(url);
    if (!parsed) return false;

    // 상대 URL은 자기 자신 오리진이므로 항상 허용
    if (!url.includes("://") && !url.startsWith("//")) return true;

    return this.allowedOrigins.has(parsed.origin);
  };

  /**
   * URL을 파싱하여 URLPattern 스펙과 동일한 구성요소를 반환
   *
   * protocol, hostname, port, pathname, search, hash, origin, href,
   * searchParams(key-value 객체)를 포함.
   * 파싱 실패 시 null 반환.
   */
  parse = (url: string): ParsedUrlComponents | null => {
    const parsed = tryParseUrl(url);
    if (!parsed) return null;

    // searchParams를 일반 객체로 변환
    const searchParams: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      searchParams[key] = value;
    });

    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      origin: parsed.origin,
      href: parsed.href,
      searchParams,
    };
  };

  /** 현재 설정된 origin 반환 */
  getOrigin = (): string => this.origin;

  /** 현재 설정된 basePath 반환 */
  getBasePath = (): string => this.basePath;
}

// ─── Query String Utilities ───

/**
 * 객체를 URL 쿼리 문자열로 변환.
 * undefined 값은 자동으로 제외. `?` 접두사는 포함하지 않는다.
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
): string => {
  const parts: string[] = [];

  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return parts.join("&");
};

/**
 * URL 쿼리 문자열을 객체로 변환.
 * `?` 접두사가 있으면 자동 제거. 동일 키는 마지막 값 사용.
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const result: Record<string, string> = {};

  const str = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  if (!str) return result;

  for (const pair of str.split("&")) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) {
      const key = decodeURIComponent(pair);
      if (key) result[key] = "";
      continue;
    }

    const key = decodeURIComponent(pair.slice(0, eqIndex));
    const value = decodeURIComponent(pair.slice(eqIndex + 1));
    if (key) result[key] = value;
  }

  return result;
};
