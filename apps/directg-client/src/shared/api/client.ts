import { createApiClient } from "@click-b/api-client";
import { env } from "@shared/config/env";

const normalizePrefix = (value: string) => value.replace(/\/$/, "");

const API_PREFIX = normalizePrefix(env.apiBaseUrl);

/**
 * apiClient prefix. 브라우저는 상대(`/api`, 현재 origin), 서버(SSR)는 절대 URL이 필요하다.
 * 개발/mock 구간에서는 MSW가 origin 무관 가로채므로 `INTERNAL_API_ORIGIN`(기본 localhost) 기준
 * 절대 prefix를 구성한다. 백엔드 연결 시 `INTERNAL_API_ORIGIN`을 실제 API origin으로 설정한다.
 * fetcher는 leading slash 없는 상대 경로(예: `main/banners`)를 넘긴다.
 */
const resolvePrefix = () => {
  if (typeof window !== "undefined") return API_PREFIX;
  const origin = process.env.INTERNAL_API_ORIGIN ?? "http://localhost:3000";
  return `${origin}${API_PREFIX}`;
};

export const apiClient = createApiClient({ prefix: resolvePrefix() });
