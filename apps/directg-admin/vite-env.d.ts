/// <reference types="vite/client" />

// This file is managed by the SI project starter CLI.

interface ImportMetaEnv {
  /** "true"면 배포 빌드에서도 MSW mock을 켠다. 백엔드 API 준비 전 stage 확인용(운영 금지). */
  readonly VITE_ENABLE_MOCKS?: string;
  /** API base URL (예: https://directg-api.clickb.co.kr/api). 미설정 시 same-origin `/api`. */
  readonly VITE_API_BASE_URL?: string;
}
