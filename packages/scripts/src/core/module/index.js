import path from "node:path";

import { apiModuleManifest } from "./modules/api-module/manifest.js";
import { renderApiModule } from "./modules/api-module/render.js";
import { authModuleManifest } from "./modules/auth/manifest.js";
import { renderAuthModule } from "./modules/auth/render.js";
import { envModuleManifest } from "./modules/env/manifest.js";
import { renderEnvModule } from "./modules/env/render.js";
import { errorBoundaryModuleManifest } from "./modules/error-boundary/manifest.js";
import { renderErrorBoundaryModule } from "./modules/error-boundary/render.js";
import { layoutShellModuleManifest } from "./modules/layout-shell/manifest.js";
import { renderLayoutShellModule } from "./modules/layout-shell/render.js";
import { menuModuleManifest } from "./modules/menu/manifest.js";
import { renderMenuModule } from "./modules/menu/render.js";
import { permissionModuleManifest } from "./modules/permission/manifest.js";
import { renderPermissionModule } from "./modules/permission/render.js";
import { routeGuardModuleManifest } from "./modules/route-guard/manifest.js";
import { renderRouteGuardModule } from "./modules/route-guard/render.js";

const MODULE_DEFINITIONS = [
  {
    manifest: apiModuleManifest,
    render: renderApiModule,
  },
  {
    manifest: authModuleManifest,
    render: renderAuthModule,
  },
  {
    manifest: permissionModuleManifest,
    render: renderPermissionModule,
  },
  {
    manifest: routeGuardModuleManifest,
    render: renderRouteGuardModule,
  },
  {
    manifest: layoutShellModuleManifest,
    render: renderLayoutShellModule,
  },
  {
    manifest: errorBoundaryModuleManifest,
    render: renderErrorBoundaryModule,
  },
  {
    manifest: envModuleManifest,
    render: renderEnvModule,
  },
  {
    manifest: menuModuleManifest,
    render: renderMenuModule,
  },
];

const MODULE_MAP = Object.fromEntries(
  MODULE_DEFINITIONS.map((definition) => [definition.manifest.name, definition]),
);

export const getSupportedModules = () => Object.keys(MODULE_MAP);

export const getModuleDefinition = (moduleName) => MODULE_MAP[moduleName];

export const getModuleManifest = (moduleName) => MODULE_MAP[moduleName]?.manifest;

export const getAllModuleManifests = () =>
  MODULE_DEFINITIONS.map((definition) => definition.manifest);

export const getModuleDefinitions = (moduleNames) =>
  moduleNames.map((moduleName) => getModuleDefinition(moduleName)).filter(Boolean);

export const renderModuleFilesForDefinition = (definition, context = {}) => {
  return definition.render(context).creates;
};

const collectDependencyNames = (moduleName, collected) => {
  const definition = getModuleDefinition(moduleName);
  if (!definition || collected.has(moduleName)) {
    return;
  }

  for (const dependencyName of definition.manifest.dependencies ?? []) {
    collectDependencyNames(dependencyName, collected);
  }

  collected.add(moduleName);
};

export const expandModuleNames = (moduleNames) => {
  const collected = new Set();

  for (const moduleName of moduleNames) {
    collectDependencyNames(moduleName, collected);
  }

  return Array.from(collected);
};

export const createModuleFiles = ({ appRoot, moduleNames, framework, preset }) =>
  getModuleDefinitions(moduleNames).flatMap((definition) =>
    renderModuleFilesForDefinition(definition, { moduleNames, framework, preset }).map((entry) => ({
      path: path.join(appRoot, entry.relativePath),
      content: entry.content,
    })),
  );

export const renderAppProvidersFile = (moduleNames) => {
  const wrappers = getModuleDefinitions(moduleNames)
    .map((definition) => definition.manifest.providerWrapper)
    .filter(Boolean)
    .sort((left, right) => left.order - right.order);

  const importLines = wrappers.map(
    (wrapper) => `import { ${wrapper.importName} } from "${wrapper.importPath}";`,
  );

  let tree = "children";
  for (const wrapper of [...wrappers].reverse()) {
    const childExpression = tree === "children" ? "{children}" : tree;
    tree = `<${wrapper.importName}>${childExpression}</${wrapper.importName}>`;
  }

  return `import type { PropsWithChildren } from "react";
${importLines.length > 0 ? `${importLines.join("\n")}\n` : ""}
type AppProvidersProps = PropsWithChildren;

export const AppProviders = ({ children }: AppProvidersProps) => {
  return ${tree === "children" ? "<>{children}</>" : tree};
};
`;
};
