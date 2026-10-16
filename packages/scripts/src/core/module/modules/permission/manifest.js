export const permissionModuleManifest = {
  name: "permission",
  description: "권한 검사 유틸리티",
  kind: "integration",
  recommendedPresets: ["admin"],
  recommendedTemplates: ["next", "vite", "tanstack"],
  dependencies: ["auth"],
};
