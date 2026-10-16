import { createModulePlan } from "../../../core/module/create-module-plan.js";
import { printPlan } from "../../../core/plan/print-plan.js";
import { applyPlan } from "../../../core/write/apply-plan.js";
import { runSelfChecks } from "../../../core/doctor/run-self-checks.js";
import { runPostActions } from "../../../core/write/run-post-actions.js";
import { findWorkspaceRoot } from "../../../core/workspace/find-workspace-root.js";
import { runPromptSession } from "../../../core/prompts/interactive.js";

const promptForModuleValues = async (values, moduleName) => {
  if (values.yes) {
    return {
      values,
      moduleName,
    };
  }

  const questions = [];

  if (!values.app) {
    questions.push({
      key: "app",
      label: "Target app",
      defaultValue: values.app,
      validate: (value) => (value ? undefined : "app is required."),
    });
  }

  if (!moduleName) {
    questions.push({
      key: "moduleName",
      label: "Module name",
      defaultValue: moduleName,
      validate: (value) => (value ? undefined : "module name is required."),
    });
  }

  if (questions.length === 0) {
    return {
      values,
      moduleName,
    };
  }

  const answers = await runPromptSession(questions);

  return {
    values: {
      ...values,
      app: answers.app ?? values.app,
    },
    moduleName: answers.moduleName ?? moduleName,
  };
};

export const createModuleCommand = async ({ cwd, values, moduleName }) => {
  const prompted = await promptForModuleValues(values, moduleName);
  const root = await findWorkspaceRoot(cwd);
  const plan = await createModulePlan({
    root,
    appName: prompted.values.app,
    moduleName: prompted.moduleName,
    overwrite: Boolean(prompted.values.overwrite),
    install: Boolean(prompted.values.install),
  });

  printPlan(plan, {
    verbose: Boolean(prompted.values.verbose),
    dryRun: Boolean(prompted.values["dry-run"]),
  });

  if (prompted.values["dry-run"]) {
    return;
  }

  const { skipped } = await applyPlan(plan, { overwrite: Boolean(prompted.values.overwrite) });
  await runSelfChecks(plan);
  await runPostActions(plan);

  if (skipped.length > 0) {
    console.log("");
    console.log("Skipped (modified outside scaffold, use --overwrite to force):");
    for (const file of skipped) {
      console.log(`  - ${file}`);
    }
  }

  console.log("");
  console.log(`Created module '${prompted.moduleName}' in apps/${prompted.values.app}`);
};
