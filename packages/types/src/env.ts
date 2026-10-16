/**
 * 환경변수 타입 계약.
 *
 * 정의:
 * - `@click-b/types`는 환경변수의 "타입 계약"만 제공하고, 실제 값 검증은 앱 또는 스크립트가 담당한다.
 * - 공개 변수와 서버 전용 변수는 같은 파일에 두더라도 타입 수준에서 역할을 구분한다.
 * - 프레임워크별 접두사 규칙은 공통 타입으로 모델링하고, 전역 선언 병합은 각 앱에서 수행한다.
 *
 * use case:
 * - Next/Vite 앱의 `env.d.ts`, `vite-env.d.ts`, `next-env.d.ts`에서 공통 계약을 확장할 때
 * - 생성 스크립트가 framework-specific env declaration을 만들 때 기반 타입으로 사용할 때
 * - 앱 템플릿 문서에서 공개 변수와 서버 변수를 구분해 설명할 때
 *
 * 지침:
 * - 클라이언트에서 노출되는 키는 `NEXT_PUBLIC_*`, `VITE_*`처럼 접두사 규칙을 반드시 따른다.
 * - 런타임 안전성은 zod 또는 앱별 env loader가 책임진다.
 * - `@click-b/types`에는 실제 환경변수 값을 읽는 코드나 전역 선언을 넣지 않는다.
 */

export type AppEnv = "local" | "dev" | "prod";

export interface ClientEnv {
  APP_ENV: AppEnv;
}

export interface ServerEnv {
  APP_ENV: AppEnv;
  NODE_ENV?: "development" | "production" | "test";
}

export type NextPublicEnvKey = `NEXT_PUBLIC_${string}`;

export type VitePublicEnvKey = `VITE_${string}`;

export type NextPublicEnv = ClientEnv &
  Partial<Record<NextPublicEnvKey, string>> & {
    NEXT_PUBLIC_API_BASE_URL: string;
  };

export type VitePublicEnv = ClientEnv &
  Partial<Record<VitePublicEnvKey, string>> & {
    VITE_API_BASE_URL: string;
  };
