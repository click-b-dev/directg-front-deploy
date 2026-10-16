import path from "node:path";
import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";

const isDirectoryNonEmpty = async (targetPath) => {
  try {
    const targetStat = await stat(targetPath);
    if (!targetStat.isDirectory()) {
      return true;
    }
    const entries = await readdir(targetPath);
    return entries.length > 0;
  } catch {
    return false;
  }
};

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

export const applyPlan = async (plan, { overwrite = false } = {}) => {
  if (
    plan.requireEmptyTarget !== false &&
    (await isDirectoryNonEmpty(plan.targetRoot)) &&
    !overwrite
  ) {
    throw new Error(
      `Target directory already exists and is not empty: ${path.relative(process.cwd(), plan.targetRoot)}`,
    );
  }

  for (const entry of plan.creates) {
    if ((await exists(entry.path)) && !overwrite) {
      throw new Error(
        `Refusing to overwrite existing file: ${path.relative(process.cwd(), entry.path)}`,
      );
    }
    await mkdir(path.dirname(entry.path), { recursive: true });
    await writeFile(entry.path, entry.content, "utf8");
  }

  const skipped = [];

  for (const entry of plan.modifies) {
    if ((await exists(entry.path)) && !overwrite && !entry.scaffoldManaged) {
      const current = await readFile(entry.path, "utf8");
      if (current !== entry.after) {
        skipped.push(path.relative(process.cwd(), entry.path));
        continue;
      }
    }
    await mkdir(path.dirname(entry.path), { recursive: true });
    await writeFile(entry.path, entry.after, "utf8");
  }

  return { skipped };
};
