import path from "node:path";
import { access } from "node:fs/promises";

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

export const resolveAppRoot = async ({ root, appName }) => {
  if (!appName) {
    throw new Error("Missing required option: app");
  }

  const appRoot = path.join(root, "apps", appName);
  if (!(await exists(appRoot))) {
    throw new Error(`App does not exist: apps/${appName}`);
  }

  return appRoot;
};
