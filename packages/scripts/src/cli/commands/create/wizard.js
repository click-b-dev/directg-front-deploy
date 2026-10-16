import path from "node:path";
import { createProjectPlan } from "../../../core/project/create-project-plan.js";
import { SUPPORTED_TEMPLATES } from "../../../core/project/create-project-plan.js";
import { printPlan } from "../../../core/plan/print-plan.js";
import { applyPlan } from "../../../core/write/apply-plan.js";
import { runSelfChecks } from "../../../core/doctor/run-self-checks.js";
import { runPostActions } from "../../../core/write/run-post-actions.js";
import { findWorkspaceRoot } from "../../../core/workspace/find-workspace-root.js";
import { runPromptSession, askMultiSelect } from "../../../core/prompts/interactive.js";
import { getModuleDefinition } from "../../../core/module/index.js";
import { getPresetNames, getPreset } from "../../../core/presets/index.js";
import {
  bold,
  cyan,
  green,
  gray,
  yellow,
  white,
  dim,
  banner,
  stepHeader,
  sectionDivider,
  ICONS,
} from "../../../core/prompts/style.js";

const PRESET_LABELS = {
  admin: "admin       — 관리자 패널, 백오피스",
  dashboard: "dashboard   — 대시보드, 모니터링",
  landing: "landing     — 랜딩페이지, 마케팅 사이트",
  portal: "portal      — 고객/파트너 포털",
};

const KEBAB_CASE_ERROR = "kebab-case 형식이어야 합니다. (예: my-app)";

const TEMPLATE_LABELS = {
  next: "Next.js (App Router)",
  vite: "Vite + React",
  tanstack: "Vite + TanStack Router",
};

export const wizardCommand = async ({ cwd, values }) => {
  const root = await findWorkspaceRoot(cwd);

  console.log(banner("click-b 프로젝트 생성 위자드"));

  // ── Step 1: 프로젝트 경로 ──
  console.log(stepHeader(1, 4, "프로젝트 경로"));
  console.log("");

  const pathAnswers = await runPromptSession([
    {
      key: "targetPath",
      label: "설치 경로",
      defaultValue: path.resolve(root, ".."),
      validate: (value) => (value ? undefined : "경로를 입력해주세요."),
    },
  ]);

  console.log("");
  console.log(sectionDivider());
  console.log("");

  // ── Step 2: 기본 설정 ──
  console.log(stepHeader(2, 4, "기본 설정"));
  console.log("");

  const baseAnswers = await runPromptSession([
    {
      key: "name",
      label: "앱 이름",
      validate: (value) => (/^[a-z][a-z0-9-]*$/.test(value) ? undefined : KEBAB_CASE_ERROR),
    },
    {
      key: "preset",
      label: "프리셋",
      defaultValue: "admin",
      type: "select",
      options: getPresetNames().map((presetName) => ({
        value: presetName,
        label: PRESET_LABELS[presetName] ?? presetName,
      })),
      validate: (value) => (value ? undefined : "프리셋을 선택해주세요."),
    },
  ]);

  console.log("");
  console.log(sectionDivider());
  console.log("");

  // ── Step 3: 템플릿 선택 ──
  console.log(stepHeader(3, 4, "템플릿 선택"));
  console.log("");

  const preset = getPreset(baseAnswers.preset);
  const recommended = preset.defaultTemplate;

  const templateAnswers = await runPromptSession([
    {
      key: "template",
      label: "프레임워크",
      defaultValue: recommended,
      type: "select",
      options: SUPPORTED_TEMPLATES.map((templateName) => {
        const label = TEMPLATE_LABELS[templateName] ?? templateName;
        return {
          value: templateName,
          label: templateName === recommended ? `${label} ${yellow("← 추천")}` : label,
        };
      }),
      validate: (value) => (value ? undefined : "템플릿을 선택해주세요."),
    },
  ]);

  console.log("");
  console.log(sectionDivider());
  console.log("");

  // ── Step 4: 모듈 선택 ──
  console.log(stepHeader(4, 4, "모듈 선택"));
  console.log("");

  const presetModules = preset.modules;
  let selectedModules = [];

  if (presetModules.length > 0) {
    const moduleOptions = presetModules.map((moduleName) => {
      const description = getModuleDefinition(moduleName)?.manifest.description ?? moduleName;
      return {
        value: moduleName,
        label: `${moduleName} ${gray(`— ${description}`)}`,
        checked: true,
      };
    });

    selectedModules = await askMultiSelect("모듈 선택", moduleOptions);
  }

  // ── 요약 ──
  const targetDir = path.resolve(pathAnswers.targetPath, baseAnswers.name);
  const templateLabel = TEMPLATE_LABELS[templateAnswers.template] ?? templateAnswers.template;

  console.log("");
  console.log(sectionDivider());
  console.log("");
  console.log(`  ${cyan(bold("설정 요약"))}`);
  console.log("");
  console.log(`  ${gray("경로")}       ${white(targetDir)}`);
  console.log(`  ${gray("앱 이름")}    ${white(baseAnswers.name)}`);
  console.log(`  ${gray("프리셋")}     ${white(baseAnswers.preset)}`);
  console.log(`  ${gray("템플릿")}     ${white(templateLabel)}`);

  if (selectedModules.length > 0) {
    console.log(`  ${gray("모듈")}       ${green(selectedModules.join(", "))}`);
  } else {
    console.log(`  ${gray("모듈")}       ${dim("(없음)")}`);
  }

  console.log("");

  // ── 최종 확인 ──
  const confirmAnswer = await runPromptSession([
    {
      key: "confirm",
      label: "프로젝트를 생성하시겠습니까?",
      defaultValue: "yes",
      type: "select",
      options: [
        { value: "yes", label: "생성" },
        { value: "no", label: "취소" },
      ],
    },
  ]);

  if (confirmAnswer.confirm !== "yes") {
    console.log("");
    console.log(`  ${yellow(ICONS.cross)} 취소되었습니다.`);
    console.log("");
    return;
  }

  // ── 프로젝트 생성 ──
  console.log("");
  console.log(`  ${cyan(ICONS.arrow)} 프로젝트 생성 중...`);

  const plan = await createProjectPlan({
    root,
    name: baseAnswers.name,
    presetName: baseAnswers.preset,
    templateOverride: templateAnswers.template,
    targetDir,
    selectedModules,
    overwrite: Boolean(values.overwrite),
    install: Boolean(values.install),
  });

  if (values["dry-run"]) {
    printPlan(plan, { verbose: Boolean(values.verbose), dryRun: true });
    return;
  }

  const { skipped } = await applyPlan(plan, { overwrite: Boolean(values.overwrite) });
  await runSelfChecks(plan);
  await runPostActions(plan);

  if (skipped.length > 0) {
    console.log("");
    console.log("Skipped (modified outside scaffold, use --overwrite to force):");
    for (const file of skipped) {
      console.log(`  - ${file}`);
    }
  }

  // ── 완료 ──
  console.log("");
  console.log(`  ${green(ICONS.check)} ${bold("프로젝트가 생성되었습니다!")}`);
  console.log("");
  console.log(`  ${gray("경로")}     ${cyan(plan.targetRoot)}`);
  console.log(`  ${gray("앱")}       ${cyan(`apps/${baseAnswers.name}`)}`);
  console.log(`  ${gray("프리셋")}   ${plan.manifest.preset}`);
  console.log(`  ${gray("템플릿")}   ${templateLabel}`);
  if (selectedModules.length > 0) {
    console.log(`  ${gray("모듈")}     ${selectedModules.join(", ")}`);
  }
  console.log("");
  console.log(`  ${dim("다음 단계:")}`);
  console.log(`  ${cyan("$")} cd ${plan.targetRoot}`);
  console.log(`  ${cyan("$")} pnpm install`);
  console.log("");
};
