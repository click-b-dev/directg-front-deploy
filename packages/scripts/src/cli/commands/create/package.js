import { createPackagePlan } from "../../../core/package/create-package-plan.js";
import { printPlan } from "../../../core/plan/print-plan.js";
import { applyPlan } from "../../../core/write/apply-plan.js";
import { runSelfChecks } from "../../../core/doctor/run-self-checks.js";
import { runPostActions } from "../../../core/write/run-post-actions.js";
import { findWorkspaceRoot } from "../../../core/workspace/find-workspace-root.js";
import { runPromptSession } from "../../../core/prompts/interactive.js";

const KEBAB_CASE_ERROR = "kebab-case 형식이어야 합니다. (예: my-lib)";

const promptForPackageValues = async (values) => {
  if (values.yes) {
    return values;
  }

  const questions = [];

  if (!values.name) {
    questions.push({
      key: "name",
      label: "패키지 이름",
      defaultValue: values.name,
      validate: (value) => (/^[a-z][a-z0-9-]*$/.test(value) ? undefined : KEBAB_CASE_ERROR),
    });
  }

  if (values.react === undefined) {
    questions.push({
      key: "react",
      label: "React 패키지 여부",
      defaultValue: "no",
      type: "select",
      options: [
        { value: "no", label: "아니오" },
        { value: "yes", label: "예" },
      ],
    });
  }

  if (questions.length === 0) {
    return values;
  }

  const answers = await runPromptSession(questions);

  return {
    ...values,
    ...answers,
  };
};
export const createPackageCommand = async ({ cwd, values }) => {
  const resolvedValues = await promptForPackageValues(values);
  const root = await findWorkspaceRoot(cwd);
  const name = resolvedValues.name;
  const withReact = resolvedValues.react === true || resolvedValues.react === "yes";

  if (!name) {
    throw new Error("패키지 이름이 필요합니다.");
  }
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error("패키지 이름은 kebab-case 형식이어야 합니다.");
  }

  const plan = await createPackagePlan({
    root,
    name,
    withReact,
    install: Boolean(resolvedValues.install),
  });

  printPlan(plan, {
    verbose: Boolean(resolvedValues.verbose),
    dryRun: Boolean(resolvedValues["dry-run"]),
  });

  if (resolvedValues["dry-run"]) {
    return;
  }

  const { skipped } = await applyPlan(plan, { overwrite: Boolean(resolvedValues.overwrite) });
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
  console.log(`packages/${name} 생성 완료!`);
  console.log(`React: ${withReact ? "예" : "아니오"}`);
  console.log("");
  console.log("다음 단계: pnpm install");
};
