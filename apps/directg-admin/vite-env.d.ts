/// <reference types="vite/client" />

// This file is managed by the SI project starter CLI.

interface ImportMetaEnv {
  /** "true"일 때만 리뉴얼 어드민(`/renewal/*`)이 노출된다. 미설정 시 404. */
  readonly VITE_ENABLE_RENEWAL?: string;
  /** "true"면 배포 빌드에서도 MSW mock을 켠다. 백엔드 API 준비 전 stage 확인용(운영 금지). */
  readonly VITE_ENABLE_MOCKS?: string;
}
