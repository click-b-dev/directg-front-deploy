export const layoutShellModuleManifest = {
  name: "layout-shell",
  description: "레이아웃 셸 위젯",
  kind: "ui-shell",
  recommendedPresets: ["admin", "dashboard", "portal"],
  recommendedTemplates: ["next", "vite", "tanstack"],
  dependencies: ["env", "menu"],
  providerWrapper: {
    importName: "LayoutShell",
    importPath: "@widgets/layout-shell",
    order: 30,
  },
};
