export const routeGuardModuleManifest = {
  name: "route-guard",
  description: "라우트 가드",
  kind: "integration",
  recommendedPresets: ["admin", "portal"],
  recommendedTemplates: ["next", "tanstack"],
  dependencies: ["auth"],
  providerWrapper: {
    importName: "RouteGuard",
    importPath: "@features/route-guard",
    order: 20,
  },
};
