export const adminPreset = {
  name: "admin",
  description: "관리자 패널, 백오피스 — SSR 불필요, 파일 기반 라우팅",
  defaultTemplate: "tanstack",
  modules: [
    "auth",
    "permission",
    "api-module",
    "route-guard",
    "layout-shell",
    "error-boundary",
    "env",
    "menu",
  ],
};
