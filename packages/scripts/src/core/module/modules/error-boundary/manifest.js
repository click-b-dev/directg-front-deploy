export const errorBoundaryModuleManifest = {
  name: "error-boundary",
  description: "에러 바운더리 컴포넌트",
  kind: "app-shell",
  recommendedPresets: ["admin", "dashboard", "portal"],
  recommendedTemplates: ["next", "vite", "tanstack"],
  dependencies: [],
  providerWrapper: {
    importName: "AppErrorBoundary",
    importPath: "@app/error-boundary",
    order: 10,
  },
};
