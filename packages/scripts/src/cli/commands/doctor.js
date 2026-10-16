import { runDoctor } from "../../core/doctor/run-doctor.js";
import { findWorkspaceRoot } from "../../core/workspace/find-workspace-root.js";
import { runPromptSession } from "../../core/prompts/interactive.js";

const promptForDoctorValues = async (values) => {
  if (values.yes) {
    return values;
  }

  if (values.app) {
    return values;
  }

  const answers = await runPromptSession([
    {
      key: "app",
      label: "Target app",
      defaultValue: values.app,
      validate: (value) => (value ? undefined : "app is required."),
    },
  ]);

  return {
    ...values,
    app: answers.app,
  };
};

export const doctorCommand = async ({ cwd, values }) => {
  const resolvedValues = await promptForDoctorValues(values);
  const root = await findWorkspaceRoot(cwd);
  const result = await runDoctor({
    root,
    appName: resolvedValues.app,
  });

  console.log(`Doctor report for apps/${resolvedValues.app}`);
  console.log("");

  for (const message of result.passes) {
    console.log(`PASS ${message}`);
  }

  for (const message of result.warnings) {
    console.log(`WARN ${message}`);
  }

  for (const message of result.failures) {
    console.log(`FAIL ${message}`);
  }

  if (result.failures.length > 0) {
    throw new Error("Doctor found blocking issues.");
  }
};
