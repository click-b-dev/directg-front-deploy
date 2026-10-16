export const authModuleManifest = {
  name: "auth",
  description: "인증 설정 및 세션 관리",
  kind: "integration",
  recommendedPresets: ["admin", "portal"],
  recommendedTemplates: ["next", "tanstack"],
  dependencies: ["api-module"],
  providerWrapper: {
    importName: "AuthProvider",
    importPath: "@shared/lib/auth/provider",
    order: 15,
  },
};
