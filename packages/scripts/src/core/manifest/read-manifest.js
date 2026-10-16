import path from "node:path";
import { readFile } from "node:fs/promises";

export const readManifest = async (appRoot) => {
  const manifestPath = path.join(appRoot, ".scaffold-manifest.json");

  let content;
  try {
    content = await readFile(manifestPath, "utf8");
  } catch (cause) {
    throw new Error(
      `Cannot read scaffold manifest at ${manifestPath}. Run 'create project' first.`,
      { cause },
    );
  }

  try {
    return { manifestPath, manifest: JSON.parse(content) };
  } catch (cause) {
    throw new Error(`Invalid JSON in scaffold manifest at ${manifestPath}.`, { cause });
  }
};
