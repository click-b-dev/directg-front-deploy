/// <reference types="vite/client" />

// This file is managed by the SI project starter CLI.

interface ImportMetaEnv {
  /** "true"일 때만 리뉴얼 어드민(`/renewal/*`)이 노출된다. 미설정 시 404. */
  readonly VITE_ENABLE_RENEWAL?: string;
}
