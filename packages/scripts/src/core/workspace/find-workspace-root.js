import path from "node:path";
import { access } from "node:fs/promises";

const exists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const findWorkspaceRoot = async (startDir) => {
  let currentDir = startDir;

  while (true) {
    const workspaceFile = path.join(currentDir, "pnpm-workspace.yaml");
    if (await exists(workspaceFile)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error("Could not find pnpm-workspace.yaml from the current directory.");
    }
    currentDir = parentDir;
  }
};
