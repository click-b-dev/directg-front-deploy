import { access } from "node:fs/promises";

const assertExists = async (targetPath, label) => {
  try {
    await access(targetPath);
  } catch {
    throw new Error(`Self-check failed: missing ${label} at ${targetPath}`);
  }
};

export const runSelfChecks = async (plan) => {
  for (const check of plan.checks) {
    await assertExists(check.target, check.type);
  }
};
