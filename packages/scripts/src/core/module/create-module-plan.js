import path from "node:path";
import { resolveAppRoot } from "../app/resolve-app-root.js";
import { readManifest } from "../manifest/read-manifest.js";
import {
  expandModuleNames,
  getModuleDefinition,
  getSupportedModules,
  renderModuleFilesForDefinition,
  renderAppProvidersFile,
} from "./index.js";

const stringify = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const createModulePlan = async ({ root, appName, moduleName, overwrite, install }) => {
  if (!moduleName) {
    throw new Error(`Missing module name. Supported modules: ${getSupportedModules().join(", ")}`);
  }

  const definition = getModuleDefinition(moduleName);
  if (!definition) {
    throw new Error(
      `Unsupported module: ${moduleName}. Supported modules: ${getSupportedModules().join(", ")}`,
    );
  }

  const appRoot = await resolveAppRoot({ root, appName });
  const { manifestPath, manifest } = await readManifest(appRoot);
  const currentAppliedModules = manifest.appliedModules ?? [];
  const nextAppliedModules = expandModuleNames([...currentAppliedModules, moduleName]);
  const modulesToCreate = nextAppliedModules.filter(
    (candidateModuleName) => !currentAppliedModules.includes(candidateModuleName),
  );
  const creates = modulesToCreate.flatMap((candidateModuleName) =>
    renderModuleFilesForDefinition(getModuleDefinition(candidateModuleName), {
      moduleNames: nextAppliedModules,
      framework: manifest.framework,
      preset: manifest.preset,
    }).map((entry) => ({
      path: path.join(appRoot, entry.relativePath),
      content: entry.content,
    })),
  );
  const modulesToResync = currentAppliedModules.filter((candidateModuleName) =>
    nextAppliedModules.includes(candidateModuleName),
  );
  const nextTrackedModules = Array.from(new Set([...(manifest.modules ?? []), ...modulesToCreate]));
  const items = Array.from(
    new Set([...(manifest.items ?? []), ...modulesToCreate.map((name) => `module:${name}`)]),
  );
  const nextManifest = {
    ...manifest,
    items,
    modules: nextTrackedModules,
    appliedModules: nextAppliedModules,
    lastGeneratedAt: new Date().toISOString(),
  };

  return {
    summary: `Create integration module '${moduleName}' in app '${appName}'`,
    targetRoot: appRoot,
    requireEmptyTarget: false,
    preset: manifest.preset,
    creates,
    modifies: [
      {
        path: manifestPath,
        after: stringify(nextManifest),
        reason: `Track applied module '${moduleName}'`,
        scaffoldManaged: true,
      },
      {
        path: path.join(appRoot, "src", "app", "providers.tsx"),
        after: renderAppProvidersFile(nextAppliedModules),
        reason: "Sync app providers with applied modules",
        scaffoldManaged: true,
      },
      ...modulesToResync.flatMap((candidateModuleName) =>
        renderModuleFilesForDefinition(getModuleDefinition(candidateModuleName), {
          moduleNames: nextAppliedModules,
          framework: manifest.framework,
          preset: manifest.preset,
        }).map((entry) => ({
          path: path.join(appRoot, entry.relativePath),
          after: entry.content,
          reason: `Resync scaffold-managed files for '${candidateModuleName}'`,
          scaffoldManaged: true,
        })),
      ),
    ],
    checks: creates.map((entry) => ({
      type: "workspace",
      target: entry.path,
    })),
    postActions: install ? [{ type: "install", cwd: root }] : [],
    manifest: nextManifest,
    warnings: [
      overwrite
        ? "Overwrite mode is enabled."
        : "Existing module files are not overwritten unless --overwrite is provided.",
      manifest.modules?.includes(moduleName)
        ? "Module is listed in the preset manifest."
        : "Module is not listed in the preset manifest; treat this as a project-specific extension.",
      modulesToCreate.length > 1
        ? `Auto-included dependencies: ${modulesToCreate.filter((name) => name !== moduleName).join(", ")}`
        : "No additional module dependencies were required.",
      modulesToResync.length > 0
        ? "Existing scaffold-managed module files will be re-synced to reflect the new module graph."
        : "No existing scaffold-managed module files required re-sync.",
    ],
  };
};
