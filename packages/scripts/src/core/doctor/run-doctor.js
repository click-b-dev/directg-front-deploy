import path from "node:path";
import { access } from "node:fs/promises";
import { resolveAppRoot } from "../app/resolve-app-root.js";
import { readManifest } from "../manifest/read-manifest.js";
import { getModuleDefinition, renderModuleFilesForDefinition } from "../module/index.js";

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const getRouteCheck = (appRoot, framework) => {
  if (framework === "next") {
    return {
      label: "next route entry",
      path: path.join(appRoot, "src", "app", "page.tsx"),
    };
  }

  if (framework === "vite") {
    return {
      label: "vite route entry",
      path: path.join(appRoot, "src", "app", "app.tsx"),
    };
  }

  if (framework === "tanstack") {
    return {
      label: "tanstack route entry",
      path: path.join(appRoot, "src", "routes", "index.tsx"),
    };
  }

  return null;
};

export const runDoctor = async ({ root, appName }) => {
  const appRoot = await resolveAppRoot({ root, appName });
  const { manifest } = await readManifest(appRoot);

  const passes = [];
  const warnings = [];
  const failures = [];

  const requiredChecks = [
    { label: "manifest file", path: path.join(appRoot, ".scaffold-manifest.json") },
    { label: "screens layer", path: path.join(appRoot, "src", "screens") },
  ];
  const routeCheck = getRouteCheck(appRoot, manifest.framework);

  if (routeCheck) {
    requiredChecks.push(routeCheck);
  } else {
    warnings.push(`framework '${manifest.framework}' has no doctor route check yet`);
  }

  for (const check of requiredChecks) {
    if (await exists(check.path)) {
      passes.push(`${check.label} exists`);
    } else {
      failures.push(`${check.label} is missing (${path.relative(root, check.path)})`);
    }
  }

  const trackedModules = Array.from(
    new Set([...(manifest.modules ?? []), ...(manifest.appliedModules ?? [])]),
  );
  const appliedModules = manifest.appliedModules ?? [];

  for (const moduleName of trackedModules) {
    const definition = getModuleDefinition(moduleName);
    if (!definition) {
      warnings.push(`planned module '${moduleName}' has no local renderer yet`);
      continue;
    }

    const expectedFiles = renderModuleFilesForDefinition(definition, {
      moduleNames: trackedModules,
      framework: manifest.framework,
      preset: manifest.preset,
    }).map((entry) => path.join(appRoot, entry.relativePath));
    const missingFiles = [];
    for (const filePath of expectedFiles) {
      if (!(await exists(filePath))) {
        missingFiles.push(path.relative(root, filePath));
      }
    }

    if (missingFiles.length === 0) {
      passes.push(`module '${moduleName}' is present`);
    } else if (appliedModules.includes(moduleName)) {
      failures.push(
        `module '${moduleName}' is marked as applied but files are missing: ${missingFiles.join(", ")}`,
      );
    } else {
      warnings.push(`module '${moduleName}' is planned but not generated yet`);
    }
  }

  return { passes, warnings, failures };
};
