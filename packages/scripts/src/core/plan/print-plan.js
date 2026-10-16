import path from "node:path";

const MAX_DETAILED_CREATE_LINES = 40;
const relative = (filePath) => path.relative(process.cwd(), filePath) || ".";

const getCreateGroupLabel = (filePath, targetRoot) => {
  const relativeToTarget = path.relative(targetRoot, filePath);
  const segments = relativeToTarget.split(path.sep).filter(Boolean);

  if (segments.length <= 1) {
    return "(root)";
  }

  if (segments[0] === ".husky") {
    return ".husky";
  }

  if ((segments[0] === "packages" || segments[0] === "apps") && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0];
};

const printCreateSummary = (plan) => {
  const groups = new Map();

  for (const entry of plan.creates) {
    const label = getCreateGroupLabel(entry.path, plan.targetRoot);
    groups.set(label, (groups.get(label) ?? 0) + 1);
  }

  console.log(`  - ${plan.creates.length} files total`);
  for (const [label, count] of groups) {
    console.log(`  - ${label}: ${count} files`);
  }
  console.log("  - Use --verbose to print every file path.");
};

export const printPlan = (plan, { verbose = false, dryRun = false } = {}) => {
  console.log(plan.summary);
  console.log(`Target: ${relative(plan.targetRoot)}`);
  if (plan.preset) {
    console.log(`Preset: ${plan.preset}`);
  }

  console.log("");
  console.log("Creates:");
  if (verbose || plan.creates.length <= MAX_DETAILED_CREATE_LINES) {
    for (const entry of plan.creates) {
      console.log(`  - ${relative(entry.path)}`);
    }
  } else {
    printCreateSummary(plan);
  }

  if (plan.modifies.length > 0) {
    console.log("");
    console.log("Modifies:");
    for (const entry of plan.modifies) {
      console.log(`  - ${relative(entry.path)} (${entry.reason})`);
    }
  }

  if (plan.checks.length > 0) {
    console.log("");
    console.log("Checks:");
    for (const check of plan.checks) {
      console.log(`  - ${check.type}: ${relative(check.target)}`);
    }
  }

  if (plan.postActions.length > 0) {
    console.log("");
    console.log("Post actions:");
    for (const action of plan.postActions) {
      console.log(`  - ${action.type}: ${relative(action.cwd)}`);
    }
  }

  if (plan.warnings.length > 0) {
    console.log("");
    console.log("Warnings:");
    for (const warning of plan.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (verbose) {
    console.log("");
    console.log("Manifest:");
    console.log(JSON.stringify(plan.manifest, null, 2));
  }

  if (dryRun) {
    console.log("");
    console.log("Dry run only. No files were written.");
  }
};
