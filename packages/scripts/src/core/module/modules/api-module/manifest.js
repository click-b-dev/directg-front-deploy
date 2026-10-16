export const apiModuleManifest = {
  name: "api-module",
  description: "API 클라이언트 설정",
  kind: "integration",
  recommendedPresets: ["admin", "dashboard", "portal"],
  recommendedTemplates: ["next", "vite", "tanstack"],
  dependencies: ["env"],
};
