import { createProjectPlan } from "../../../core/project/create-project-plan.js";
import {
  DOMAIN_MODULE_SELECTIONS,
  PACKAGE_SELECTIONS,
  SOURCE_PACKAGE_DIRS,
  SUPPORTED_TEMPLATES,
  expandDomainModuleNames,
  expandPackageNames,
} from "../../../core/project/create-project-plan.js";
import { printPlan } from "../../../core/plan/print-plan.js";
import { applyPlan } from "../../../core/write/apply-plan.js";
import { runSelfChecks } from "../../../core/doctor/run-self-checks.js";
import { runPostActions } from "../../../core/write/run-post-actions.js";
import { findWorkspaceRoot } from "../../../core/workspace/find-workspace-root.js";
import { askMultiSelect, runPromptSession } from "../../../core/prompts/interactive.js";
import { getPresetNames, getPreset } from "../../../core/presets/index.js";
import { expandModuleNames, getAllModuleManifests } from "../../../core/module/index.js";
import path from "node:path";

const KEBAB_CASE_ERROR = "kebab-case 형식이어야 합니다. (예: my-app)";

const TEMPLATE_LABELS = {
  next: "Next.js (App Router)",
  vite: "Vite + React",
  tanstack: "Vite + TanStack Router",
};

const PRESET_LABELS = {
  admin: "admin       — 관리자 패널, 백오피스",
  dashboard: "dashboard   — 대시보드, 모니터링",
  landing: "landing     — 랜딩페이지, 마케팅 사이트",
  portal: "portal      — 고객/파트너 포털",
};

const parseModuleList = (value) => {
  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((moduleName) => moduleName.trim())
    .filter(Boolean);
};

const resolveRequestedModules = (values) => parseModuleList(values.modules ?? values.module);
const resolveRequestedPackages = (values) => parseModuleList(values.packages ?? values.package);
const resolveRequestedDomains = (values) => parseModuleList(values.domains);

const promptForModules = async (values) => {
  if (resolveRequestedModules(values)) {
    return values;
  }

  const preset = getPreset(values.preset);
  const template = values.template ?? preset.defaultTemplate;
  const recommendedModules = new Set(expandModuleNames(preset.modules));
  const options = getAllModuleManifests().map((manifest) => {
    const recommended =
      recommendedModules.has(manifest.name) ||
      manifest.recommendedPresets?.includes(preset.name) ||
      manifest.recommendedTemplates?.includes(template);

    return {
      value: manifest.name,
      checked: recommendedModules.has(manifest.name),
      label: `${manifest.name} — ${manifest.description}${recommended ? " (추천)" : ""}`,
    };
  });

  const selectedModules = await askMultiSelect("필요한 기능 모듈", options);

  return {
    ...values,
    selectedModules,
  };
};

const promptForPackages = async (values) => {
  if (resolveRequestedPackages(values)) {
    return values;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      ...values,
      selectedPackages: SOURCE_PACKAGE_DIRS,
    };
  }

  const options = PACKAGE_SELECTIONS.map((entry) => ({
    value: entry.name,
    checked: SOURCE_PACKAGE_DIRS.includes(entry.name),
    label: `${entry.name} — ${entry.description}${entry.name === "domain" ? " (도메인 모듈)" : ""}`,
  }));

  const selectedPackages = await askMultiSelect("가져올 공유 패키지", options);

  return {
    ...values,
    selectedPackages: expandPackageNames(selectedPackages),
  };
};

const promptForDomains = async (values) => {
  const requestedDomains = resolveRequestedDomains(values);
  if (requestedDomains) {
    const packageNames = resolveRequestedPackages(values) ?? values.selectedPackages ?? [];
    return {
      ...values,
      selectedPackages: expandPackageNames([...packageNames, "domain"]),
      selectedDomains: expandDomainModuleNames(requestedDomains),
    };
  }

  if (!values.selectedPackages?.includes("domain")) {
    return values;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      ...values,
      selectedDomains: expandDomainModuleNames(),
    };
  }

  const options = DOMAIN_MODULE_SELECTIONS.map((entry) => ({
    value: entry.name,
    checked: true,
    label: `${entry.name} — ${entry.description}`,
  }));

  const selectedDomains = await askMultiSelect("가져올 도메인 모듈", options);

  return {
    ...values,
    selectedDomains: expandDomainModuleNames(selectedDomains),
  };
};

const promptForProjectValues = async (values, root) => {
  if (values.yes) {
    return values;
  }

  // Phase 1: name + preset
  const phase1 = [];

  if (!values.name) {
    phase1.push({
      key: "name",
      label: "앱 이름",
      defaultValue: values.name,
      validate: (value) => (/^[a-z][a-z0-9-]*$/.test(value) ? undefined : KEBAB_CASE_ERROR),
    });
  }

  if (!values.preset) {
    phase1.push({
      key: "preset",
      label: "프리셋",
      defaultValue: "admin",
      type: "select",
      options: getPresetNames().map((presetName) => ({
        value: presetName,
        label: PRESET_LABELS[presetName] ?? presetName,
      })),
      validate: (value) => (value ? undefined : "프리셋을 선택해주세요."),
    });
  }

  const phase1Answers = phase1.length > 0 ? await runPromptSession(phase1) : {};
  const merged = { ...values, ...phase1Answers };

  // Phase 2: template (with preset-aware recommendation)
  if (!merged.template) {
    const preset = getPreset(merged.preset);
    const recommended = preset.defaultTemplate;

    const templateOptions = SUPPORTED_TEMPLATES.map((templateName) => {
      const label = TEMPLATE_LABELS[templateName] ?? templateName;
      return {
        value: templateName,
        label: templateName === recommended ? `${label} ← 추천` : label,
      };
    });

    const phase2Answers = await runPromptSession([
      {
        key: "template",
        label: "템플릿",
        defaultValue: recommended,
        type: "select",
        options: templateOptions,
        validate: (value) => (value ? undefined : "템플릿을 선택해주세요."),
      },
    ]);

    return promptForProjectPath(
      await promptForDomains(
        await promptForPackages(await promptForModules({ ...merged, ...phase2Answers })),
      ),
      root,
    );
  }

  return promptForProjectPath(
    await promptForDomains(await promptForPackages(await promptForModules(merged))),
    root,
  );
};

const promptForProjectPath = async (values, root) => {
  if (values.path) {
    return values;
  }

  const answers = await runPromptSession([
    {
      key: "path",
      label: "프로젝트 경로",
      defaultValue: path.resolve(root, "..", values.name),
      validate: (value) => (value ? undefined : "프로젝트 경로를 입력해주세요."),
    },
  ]);

  return {
    ...values,
    ...answers,
  };
};

export const createProjectCommand = async ({ cwd, values }) => {
  const root = await findWorkspaceRoot(cwd);
  const resolvedValues = await promptForProjectValues(values, root);
  const plan = await createProjectPlan({
    root,
    name: resolvedValues.name,
    presetName: resolvedValues.preset,
    templateOverride: resolvedValues.template,
    targetDir: resolvedValues.path,
    selectedModules: resolveRequestedModules(resolvedValues) ?? resolvedValues.selectedModules,
    selectedPackages: resolveRequestedPackages(resolvedValues) ?? resolvedValues.selectedPackages,
    selectedDomains: resolveRequestedDomains(resolvedValues) ?? resolvedValues.selectedDomains,
    overwrite: Boolean(resolvedValues.overwrite),
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
  console.log(`Created project at ${plan.targetRoot}`);
  console.log(`App: apps/${resolvedValues.name}`);
  console.log(`Preset: ${plan.manifest.preset ?? "unknown"}`);
};
