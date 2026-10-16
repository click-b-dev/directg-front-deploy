import path from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";
import { createModuleFiles, expandModuleNames, renderAppProvidersFile } from "../module/index.js";
import { getPreset } from "../presets/index.js";

export const SUPPORTED_TEMPLATES = ["next", "vite", "tanstack"];
export const TEMPLATE_SOURCE_APPS = {
  next: "next-web",
  vite: "vite-web",
  tanstack: "tanstack-web",
};

export const SOURCE_PACKAGE_DIRS = [
  "config",
  "types",
  "utils",
  "ui",
  "hook",
  "domain",
  "api-client",
  "scripts",
];

const PACKAGE_DEPENDENCIES = {
  "api-client": ["config", "types"],
  config: [],
  domain: ["config"],
  hook: ["config", "types", "utils"],
  scripts: ["config"],
  types: ["config"],
  ui: ["config", "types", "utils"],
  utils: ["config", "types"],
};

export const PACKAGE_SELECTIONS = [
  { name: "config", description: "ESLint/Prettier/TSConfig 공유 설정" },
  { name: "types", description: "공통 타입 primitive" },
  { name: "utils", description: "공통 유틸리티" },
  { name: "ui", description: "공유 UI primitive와 state machine" },
  { name: "hook", description: "브라우저/UI 공통 hook" },
  { name: "domain", description: "headless 도메인 규칙 모듈" },
  { name: "api-client", description: "API client와 공통 fetch helper" },
  { name: "scripts", description: "scaffold/doctor CLI" },
];

export const DOMAIN_MODULE_SELECTIONS = [
  {
    name: "identity",
    description: "휴대폰/생년월일/비밀번호 입력 primitive",
  },
  {
    name: "terms-agreement",
    description: "약관 동의값, 전체동의, 필수동의 계산",
  },
  {
    name: "verification-code",
    description: "인증번호 발송/검증 상태와 만료 countdown",
  },
];

const ROOT_SCRIPT_FILES = [
  "scripts/boilerplate-sync-detect.mjs",
  "scripts/domain-modules-check.mjs",
  "scripts/harness-forge-check.mjs",
  "scripts/slack-notify.mjs",
  "scripts/sync-codex-skills.mjs",
];

const ROOT_TEXT_FILES = [
  ".gitignore",
  ".prettierignore",
  "eslint.config.js",
  "prettier.config.js",
  "tsconfig.base.json",
  "LICENSE",
];

const ROOT_DIRS = [".husky"];
const HARNESS_DIRS = [".agent-source", ".claude", ".codex"];
const EXCLUDED_SOURCE_FILES = new Set(["settings.local.json"]);
const EXCLUDED_SOURCE_NAMES = new Set(["node_modules", ".next", ".tanstack", ".vite", "dist"]);
const EXCLUDED_APP_FILES = new Set(["package.json", "tsconfig.json", "eslint.config.js"]);

const assertKebabCase = (value, fieldName) => {
  if (!value) {
    throw new Error(`Missing required option: ${fieldName}`);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    throw new Error(`${fieldName} must be kebab-case.`);
  }
};

const toPascalCase = (value) =>
  value
    .split(/[-/]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

// 파일명은 항상 kebab-case (컴포넌트 식별자만 PascalCase).
// unicorn/filename-case ESLint 룰과 일치시키기 위함.
const toKebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_/]+/g, "-")
    .toLowerCase();

const stringify = (value) => `${JSON.stringify(value, null, 2)}\n`;
const dedupeCreates = (creates) =>
  Array.from(new Map(creates.map((entry) => [entry.path, entry])).values());

const createManifest = ({ preset, template, name, modules, packages }) => ({
  preset: preset.name,
  specVersion: "0.2.0-si-project-init",
  generatedAt: new Date().toISOString(),
  generatedBy: "@click-b/scripts",
  items: [
    `project:${name}`,
    `template:${template}`,
    ...modules.map((moduleName) => `module:${moduleName}`),
    ...packages.map((packageName) => `package:${packageName}`),
  ],
  framework: template,
  modules,
  appliedModules: modules,
  packages,
  screensLayerName: "screens",
});

const createManifestWithDomains = ({ preset, template, name, modules, packages, domains }) => ({
  ...createManifest({ preset, template, name, modules, packages }),
  items: [
    `project:${name}`,
    `template:${template}`,
    ...modules.map((moduleName) => `module:${moduleName}`),
    ...packages.map((packageName) => `package:${packageName}`),
    ...domains.map((domainName) => `domain:${domainName}`),
  ],
  domains,
});

const getTemplateSourceRoot = (sourceRoot, template) => {
  const sourceApp = TEMPLATE_SOURCE_APPS[template];
  if (!sourceApp) {
    throw new Error(`Template source is not configured: ${template}`);
  }

  return path.join(sourceRoot, "apps", sourceApp);
};

const collectTextFiles = async (sourceRoot, relativeRoot = "", entries = []) => {
  const currentRoot = path.join(sourceRoot, relativeRoot);
  const currentEntries = await readdir(currentRoot, { withFileTypes: true });

  for (const entry of currentEntries) {
    if (EXCLUDED_SOURCE_NAMES.has(entry.name)) {
      continue;
    }
    if (entry.isFile() && EXCLUDED_SOURCE_FILES.has(entry.name)) {
      continue;
    }

    const nextRelativePath = relativeRoot ? path.join(relativeRoot, entry.name) : entry.name;
    const sourcePath = path.join(sourceRoot, nextRelativePath);

    if (entry.isDirectory()) {
      await collectTextFiles(sourceRoot, nextRelativePath, entries);
      continue;
    }

    entries.push({
      relativePath: nextRelativePath,
      content: await readFile(sourcePath, "utf8"),
    });
  }

  return entries;
};

const pathExists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
};

// harness 디렉토리(.agent-source/.claude/.codex)와 .husky 는 harness-forge 등으로
// 생성되는 산출물이라 소스 보일러플레이트에 항상 존재한다는 보장이 없다.
// 없으면 크래시하지 않고 건너뛴다.
const collectOptionalDirFiles = async (sourceRoot) => {
  if (!(await pathExists(sourceRoot))) {
    return [];
  }

  return collectTextFiles(sourceRoot);
};

export const expandPackageNames = (packageNames) => {
  const requested = packageNames?.length ? packageNames : SOURCE_PACKAGE_DIRS;
  const collected = new Set();

  const collect = (packageName) => {
    if (!SOURCE_PACKAGE_DIRS.includes(packageName) || collected.has(packageName)) {
      return;
    }

    for (const dependencyName of PACKAGE_DEPENDENCIES[packageName] ?? []) {
      collect(dependencyName);
    }

    collected.add(packageName);
  };

  for (const packageName of requested) {
    collect(packageName);
  }

  return SOURCE_PACKAGE_DIRS.filter((packageName) => collected.has(packageName));
};

export const expandDomainModuleNames = (domainNames) => {
  const supportedDomainNames = DOMAIN_MODULE_SELECTIONS.map((entry) => entry.name);
  if (!domainNames?.length) {
    return supportedDomainNames;
  }

  return supportedDomainNames.filter((domainName) => domainNames.includes(domainName));
};

const collectRootFiles = async (sourceRoot, projectRoot) => {
  const creates = [];

  for (const relativePath of ROOT_TEXT_FILES) {
    const sourcePath = path.join(sourceRoot, relativePath);
    // .prettierignore 처럼 선택적 루트 설정 파일은 없을 수 있으므로 건너뛴다.
    if (!(await pathExists(sourcePath))) {
      continue;
    }

    creates.push({
      path: path.join(projectRoot, relativePath),
      content: await readFile(sourcePath, "utf8"),
    });
  }

  for (const relativeDir of ROOT_DIRS) {
    const files = await collectOptionalDirFiles(path.join(sourceRoot, relativeDir));
    creates.push(
      ...files.map((entry) => ({
        path: path.join(projectRoot, relativeDir, entry.relativePath),
        content: entry.content,
      })),
    );
  }

  for (const relativePath of ROOT_SCRIPT_FILES) {
    creates.push({
      path: path.join(projectRoot, relativePath),
      content: await readFile(path.join(sourceRoot, relativePath), "utf8"),
    });
  }

  return creates;
};

const collectHarnessFiles = async (sourceRoot, projectRoot) => {
  const creates = [];

  for (const relativeDir of HARNESS_DIRS) {
    const files = await collectOptionalDirFiles(path.join(sourceRoot, relativeDir));
    creates.push(
      ...files.map((entry) => ({
        path: path.join(projectRoot, relativeDir, entry.relativePath),
        content: entry.content,
      })),
    );
  }

  return creates;
};

const renderDomainPackageJson = (content, domains) => {
  const packageJson = JSON.parse(content);
  const domainExports = Object.fromEntries(
    domains.map((domainName) => [`./${domainName}`, `./src/${domainName}/index.ts`]),
  );
  const domainTypes = Object.fromEntries(
    domains.map((domainName) => [domainName, [`./src/${domainName}/index.ts`]]),
  );

  return stringify({
    ...packageJson,
    exports: {
      ".": "./src/index.ts",
      ...domainExports,
    },
    typesVersions: {
      "*": domainTypes,
    },
  });
};

const renderDomainIndex = (domains) =>
  domains.map((domainName) => `export * from "./${domainName}";`).join("\n") +
  (domains.length > 0 ? "\n" : "");

const renderDomainModulesDoc = (domains) => {
  const selected = new Set(domains);
  const rows = DOMAIN_MODULE_SELECTIONS.filter((entry) => selected.has(entry.name)).map((entry) => {
    const useCase = {
      identity: "회원가입, 비밀번호 재설정, 본인 인증",
      "terms-agreement": "회원가입 약관, 정책 동의 화면",
      "verification-code": "SMS/이메일 OTP, 재발송 제한",
    }[entry.name];

    return `| \`${entry.name}\` | \`@click-b/domain/${entry.name}\` | ${entry.description} | ${useCase} |`;
  });

  return `# @click-b/domain Modules

\`@click-b/domain\`은 앱 화면에 박혀 있던 반복 업무 규칙을 재사용 가능한 headless 모듈로 분리한다.

## 원칙

- UI, 라우터, API client, React Query에 의존하지 않는다.
- 서버 요청은 호출 측에서 함수로 주입한다.
- 앱별 schema 조립은 앱/엔티티 레이어가 맡고, 여기에는 schema 라이브러리를 추가하지 않는다.
- 화면에서 바로 쓸 수 있는 custom hook과 테스트하기 쉬운 순수 함수를 같이 제공한다.

## 모듈 맵

| 모듈 | import 경로 | 책임 | 대표 use-case |
| --- | --- | --- | --- |
${rows.length > 0 ? rows.join("\n") : "| 선택된 모듈 없음 | - | - | - |"}

## 경계

- \`@click-b/hook\`: 브라우저/UI primitive 전용.
- \`@click-b/domain\`: 프로젝트 도메인 규칙 전용.
- \`apps/*/src/entities\`: 실제 API 계약, query/mutation, zod schema 전용.
`;
};

const collectDomainPackageFiles = async (sourceRoot, projectRoot, domains) => {
  const files = await collectTextFiles(path.join(sourceRoot, "packages", "domain"));
  const selectedDomains = new Set(domains);
  const supportedDomains = new Set(DOMAIN_MODULE_SELECTIONS.map((entry) => entry.name));
  const creates = [];

  for (const entry of files) {
    const segments = entry.relativePath.split(path.sep);
    if (
      segments[0] === "src" &&
      supportedDomains.has(segments[1]) &&
      !selectedDomains.has(segments[1])
    ) {
      continue;
    }

    let content = entry.content;
    if (entry.relativePath === "package.json") {
      content = renderDomainPackageJson(content, domains);
    } else if (entry.relativePath === path.join("src", "index.ts")) {
      content = renderDomainIndex(domains);
    } else if (entry.relativePath === "MODULES.md") {
      content = renderDomainModulesDoc(domains);
    }

    creates.push({
      path: path.join(projectRoot, "packages", "domain", entry.relativePath),
      content,
    });
  }

  return creates;
};

const collectPackageFiles = async (sourceRoot, projectRoot, packageNames, domains) => {
  const creates = [];

  for (const packageName of packageNames) {
    if (packageName === "domain") {
      creates.push(...(await collectDomainPackageFiles(sourceRoot, projectRoot, domains)));
      continue;
    }

    const files = await collectTextFiles(path.join(sourceRoot, "packages", packageName));
    creates.push(
      ...files.map((entry) => ({
        path: path.join(projectRoot, "packages", packageName, entry.relativePath),
        content: entry.content,
      })),
    );
  }

  return creates;
};

const collectTemplateAppFiles = async (sourceRoot, template, appRoot) => {
  const templateRoot = getTemplateSourceRoot(sourceRoot, template);
  const files = await collectTextFiles(templateRoot);

  return files
    .filter((entry) => !EXCLUDED_APP_FILES.has(entry.relativePath))
    .map((entry) => ({
      path: path.join(appRoot, entry.relativePath),
      content: entry.content,
    }));
};

const readTemplateText = async (sourceRoot, template, relativePath) => {
  const sourcePath = path.join(getTemplateSourceRoot(sourceRoot, template), relativePath);

  try {
    return await readFile(sourcePath, "utf8");
  } catch {
    throw new Error(`Template source file is missing: ${path.relative(sourceRoot, sourcePath)}`);
  }
};

const readTemplateJson = async (sourceRoot, template, relativePath) =>
  JSON.parse(await readTemplateText(sourceRoot, template, relativePath));

const createWorkspacePackageJson = async (sourceRoot, name) => {
  const rootPackage = JSON.parse(await readFile(path.join(sourceRoot, "package.json"), "utf8"));

  return stringify({
    name,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: `pnpm --filter @click-b/${name} dev`,
      build: `pnpm --filter @click-b/${name} build`,
      lint: "eslint .",
      "lint:fix": "eslint --fix .",
      format: "prettier --write .",
      "format:check": "prettier --check .",
      "scaffold:module": `node packages/scripts/src/index.js create module --app ${name}`,
      "scaffold:package": "node packages/scripts/src/index.js create package",
      "scaffold:doctor": `node packages/scripts/src/index.js doctor --app ${name}`,
      "modules:check": `node scripts/domain-modules-check.mjs && node packages/scripts/src/index.js doctor --app ${name}`,
      "codex:skills:sync": "node scripts/sync-codex-skills.mjs",
      "codex:skills:check": "node scripts/sync-codex-skills.mjs --check",
      "harness:check": "node scripts/harness-forge-check.mjs",
      "harness:check:source": "node scripts/harness-forge-check.mjs --source",
      "boilerplate:detect": "node scripts/boilerplate-sync-detect.mjs",
      prepare: "husky",
      test: rootPackage.scripts?.test ?? 'echo "Error: no test specified" && exit 1',
    },
    "lint-staged": rootPackage["lint-staged"],
    packageManager: rootPackage.packageManager,
    devDependencies: rootPackage.devDependencies,
  });
};

const createWorkspaceReadme = (name, template, presetName) =>
  `# ${name}

Generated from Click-B Start-Kit.

## Project

- preset: ${presetName}
- template: ${template}
- app package: @click-b/${name}

## Commands

\`\`\`bash
pnpm install
pnpm dev
pnpm build
pnpm scaffold:module
pnpm scaffold:package
pnpm scaffold:doctor
pnpm modules:check
pnpm harness:check
pnpm codex:skills:sync
\`\`\`
`;

const createWorkspaceAgents = (name, template, presetName) =>
  `# Project Instructions

## Overview

Independent pnpm workspace generated from Click-B Start-Kit.

- Primary app: \`apps/${name}\`, package \`@click-b/${name}\`
- Template: \`${template}\`
- Preset: \`${presetName}\`
- Shared packages live under \`packages/*\`.

## Commands

\`\`\`bash
pnpm dev
pnpm build             # app build
pnpm lint              # workspace lint
pnpm format
pnpm scaffold:module
pnpm scaffold:package
pnpm scaffold:doctor
pnpm modules:check
pnpm harness:check
pnpm codex:skills:sync
\`\`\`

## Architecture

- FSD screen layer name is \`screens\`
- app path aliases use \`@app/*\` ~ \`@shared/*\`
- FSD import direction is \`app -> screens -> widgets -> features -> entities -> shared\`
- same-layer cross-imports are not allowed below widgets
- shared packages live under \`packages/*\`
- reusable domain rules live under \`packages/domain\`

## Dependency Security

\`pnpm add\`, \`pnpm install\`, \`pnpm update\`, or dependency edits require a supply-chain check first. Verify the package/version against npm, GitHub Security Advisories, Socket.dev, and recent security reports. Do not install versions connected to known incidents; if unsure, ask before installing.

## Tool Routing

- \`.agent-source/*\` is the single harness origin.
- \`.claude/*\` and \`.codex/*\` are generated runtime harnesses from the same origin.
- Do not hand-edit runtime harness output when changing policy; update \`.agent-source/*\` and regenerate.
- Keep \`.agent-source\` to current contracts in \`source.md\` and optional reusable \`reference.md\`; do not add \`design.md\`.
- Start Figma/screen/page implementation requests with \`$ideate\` and wait for user confirmation before Figma lookup, file edits, or implementation commands.
- After common package, harness, skill, automation, or instruction changes, audit boilerplate sync candidates for \`click-b/fe-boilerplate\`. Personal-only notes belong in \`*.local.md\`.
`;

const createProjectSource = (name, template, presetName, packageNames, domains) =>
  `# Project Source

> Generated project origin. \`.claude/PROMPT.md\` and \`.codex/README.md\` are runtime harnesses derived from this source.

## Repository Facts

- Workspace: independent pnpm monorepo generated from Click-B Start-Kit.
- Primary app: \`apps/${name}\`, package \`@click-b/${name}\`, template \`${template}\`, preset \`${presetName}\`.
- Shared packages: ${packageNames.map((packageName) => `\`packages/${packageName}\``).join(", ")}.
- Domain modules: ${domains.length > 0 ? domains.map((domainName) => `\`${domainName}\``).join(", ") : "none"}.
- App aliases: \`@/*\`, \`@app/*\`, \`@screens/*\`, \`@widgets/*\`, \`@features/*\`, \`@entities/*\`, \`@shared/*\`.
- FSD layer direction: \`app -> screens -> widgets -> features -> entities -> shared\`.
- Reusable domain rules live under \`packages/domain\` when that package is selected.

## Commands

- App: \`pnpm dev\`, \`pnpm build\`, \`pnpm lint\`.
- Scaffold: \`pnpm scaffold:module\`, \`pnpm scaffold:package\`, \`pnpm scaffold:doctor\`.
- Domain/harness: \`pnpm modules:check\`, \`pnpm harness:check\`, \`pnpm codex:skills:sync\`.

## Runtime Rules

- Skills live in each runtime's skill directory. If the user names a skill or the request matches a skill trigger, read that skill before related work.
- Figma/screen/page implementation starts with \`ideate\`. Do not perform Figma lookup, image download, file edits, or implementation shell commands before the ideate summary is confirmed by the user.
- When Figma is the implementation source, extract node text, images, icons, colors, spacing, radius, typography, and layout before coding. Do not invent copy, sample data, images, icons, or decorative elements not present in the design.
- Before creating app-layer raw form/control elements, search app-local \`@shared/ui\` and \`@click-b/ui\` primitives and reuse them when they can express the control.
- Keep reusable \`packages/*\` APIs product-neutral. Put product context in app code, not package public APIs, README, comments, or fixtures.
- \`.agent-source\` uses current-contract \`source.md\` files and optional reusable \`reference.md\` files. Do not keep \`design.md\` under \`.agent-source\`.
- \`*.local.md\` is local-only and excluded from git tracking and boilerplate-sync candidates.
- Finish common package, harness source, runtime instruction, skill, automation script, or agent instruction work with a boilerplate sync audit targeting \`click-b/fe-boilerplate\`.

## Routing

1. Explicit skill request: read and follow that skill first.
2. Figma/screen/page implementation: run \`ideate\` and wait for user confirmation before implementation.
3. Source/harness work: edit \`.agent-source/*\` first, then regenerate or verify runtime outputs.
4. Simple request: inspect affected files and execute directly.
5. Feature or page work: read relevant \`docs/*\`, then follow \`feature-dev\`.
6. Review or verification: follow \`code-review\` or \`qa-gate\`.
7. Commit work: follow \`git-commit\` and ask before committing.
8. Boilerplate sync audit: after common/harness/skill/script/instruction changes, detect candidates and ask whether to sync to \`click-b/fe-boilerplate\`.

## Non-goals

- Do not keep references to the source boilerplate template apps as the active generated app.
- Do not treat \`.claude/*\` or \`.codex/*\` as independent policy origins.
- Do not copy local machine settings into shared runtime harness policy.
`;

const createCodexReadme = (name, template, presetName, packageNames, domains) =>
  `# Codex Harness

This directory is the Codex runtime harness for the generated project. The single origin is \`.agent-source/*\`; \`.codex/*\` is a self-contained runtime artifact generated from that origin.

## Repository Facts

- Workspace: independent pnpm monorepo.
- Primary app: \`apps/${name}\`, package \`@click-b/${name}\`, template \`${template}\`, preset \`${presetName}\`.
- Shared packages: ${packageNames.map((packageName) => `\`packages/${packageName}\``).join(", ")}.
- Domain modules: ${domains.length > 0 ? domains.map((domainName) => `\`${domainName}\``).join(", ") : "none"}.
- App aliases: \`@/*\`, \`@app/*\`, \`@screens/*\`, \`@widgets/*\`, \`@features/*\`, \`@entities/*\`, \`@shared/*\`.

## Codex Runtime Rules

- Use \`rtk\` before shell commands in this repository.
- Prefer \`rg\` / \`rg --files\` for search.
- Use \`apply_patch\` for manual file edits.
- Preserve user changes in the worktree.
- Skills live at \`.codex/skills/*/SKILL.md\`; run \`rtk pnpm codex:skills:sync\` to install/update them for autocomplete.
- Before feature, page, auth, session, global-state, design, or QA work, read relevant \`docs/*\` references when they exist.
- \`.codex/*\` and \`.claude/*\` are independent runtime outputs from \`.agent-source/*\`; if policy changes, update the origin and regenerate.
- Start Figma/screen/page implementation requests with \`$ideate\`; wait for user confirmation before Figma lookup, image download, file edits, or implementation commands.
- Use \`.agent-source/**/source.md\` for current contracts and optional \`reference.md\` for reusable templates; do not add \`design.md\`.
- If common package, harness, skill, automation, or instruction changes create boilerplate candidates, ask whether to sync them to \`click-b/fe-boilerplate\`.
- Keep personal-only notes in \`*.local.md\`; those files are local-only and excluded from boilerplate-sync candidates.

## Dependency Security

\`pnpm add\`, \`pnpm install\`, \`pnpm update\`, or dependency edits require a supply-chain check first. Verify the package/version against npm, GitHub Security Advisories, Socket.dev, and recent security reports. Do not install versions connected to known incidents; if unsure, ask before installing.

## Routing

1. Simple request: inspect affected files and execute directly.
2. Figma/screen/page implementation: follow \`$ideate\` before Figma lookup or implementation.
3. Feature or page work: follow \`$feature-dev\`.
4. Review or verification: follow \`$code-review\` or \`$qa-gate\`.
5. Commit work: follow \`$git-commit\` and ask before committing.
6. Boilerplate sync audit: follow \`$boilerplate-sync-candidate\` after common/harness/skill/script/instruction changes.

## Verification Commands

\`\`\`bash
rtk pnpm build
rtk pnpm lint
rtk pnpm modules:check
rtk pnpm harness:check
rtk pnpm --filter @click-b/domain test
\`\`\`
`;

const createClaudePrompt = (name, template, presetName, packageNames, domains) =>
  `# Claude Code Harness

This file is the Claude Code runtime harness for the generated project. The single origin is \`.agent-source/*\`; \`.claude/*\` and \`.codex/*\` are generated runtime artifacts from the same origin.

## Repository Facts

- Workspace: independent pnpm monorepo.
- Primary app: \`apps/${name}\`, package \`@click-b/${name}\`, template \`${template}\`, preset \`${presetName}\`.
- Shared packages: ${packageNames.map((packageName) => `\`packages/${packageName}\``).join(", ")}.
- Domain modules: ${domains.length > 0 ? domains.map((domainName) => `\`${domainName}\``).join(", ") : "none"}.
- App aliases: \`@/*\`, \`@app/*\`, \`@screens/*\`, \`@widgets/*\`, \`@features/*\`, \`@entities/*\`, \`@shared/*\`.

## Claude Runtime Rules

- Skills live at \`.claude/skills/<name>/SKILL.md\`.
- Agents live at \`.claude/agents/\`.
- References live at \`.claude/references/*.md\`.
- Before feature, page, auth, session, global-state, design, or QA work, read relevant \`docs/*\` references when they exist.
- Do not hand-edit generated harness policy when changing durable instructions; update \`.agent-source/*\` and regenerate.
- Start Figma/screen/page implementation requests with \`/ideate\`; wait for user confirmation before Figma lookup, image download, file edits, or implementation commands.
- Use \`.agent-source/**/source.md\` for current contracts and optional \`reference.md\` for reusable templates; do not add \`design.md\`.
- If common package, harness, skill, automation, or instruction changes create boilerplate candidates, ask whether to sync them to \`click-b/fe-boilerplate\`.
- Keep personal-only notes in \`*.local.md\`; those files are local-only and excluded from boilerplate-sync candidates.

## Dependency Security

\`pnpm add\`, \`pnpm install\`, \`pnpm update\`, or dependency edits require a supply-chain check first. Verify the package/version against npm, GitHub Security Advisories, Socket.dev, and recent security reports. Do not install versions connected to known incidents; if unsure, ask before installing.

## Verification Commands

\`\`\`bash
pnpm build
pnpm lint
pnpm modules:check
pnpm harness:check
pnpm --filter @click-b/domain test
\`\`\`
`;

const createHarnessOverrideFiles = (
  projectRoot,
  name,
  template,
  presetName,
  packageNames,
  domains,
) => [
  {
    path: path.join(projectRoot, ".agent-source", "project", "source.md"),
    content: createProjectSource(name, template, presetName, packageNames, domains),
  },
  {
    path: path.join(projectRoot, ".codex", "README.md"),
    content: createCodexReadme(name, template, presetName, packageNames, domains),
  },
  {
    path: path.join(projectRoot, ".claude", "PROMPT.md"),
    content: createClaudePrompt(name, template, presetName, packageNames, domains),
  },
];

const createWorkspaceFiles = async (sourceRoot, projectRoot, name, template, presetName) => [
  {
    path: path.join(projectRoot, "package.json"),
    content: await createWorkspacePackageJson(sourceRoot, name),
  },
  {
    path: path.join(projectRoot, "pnpm-workspace.yaml"),
    content: await readFile(path.join(sourceRoot, "pnpm-workspace.yaml"), "utf8"),
  },
  {
    path: path.join(projectRoot, "README.md"),
    content: createWorkspaceReadme(name, template, presetName),
  },
  {
    path: path.join(projectRoot, "AGENTS.md"),
    content: createWorkspaceAgents(name, template, presetName),
  },
];

const createPackageJsonFromTemplate = async (sourceRoot, template, name, packageNames) => {
  const packageJson = await readTemplateJson(sourceRoot, template, "package.json");
  const selectedPackageNames = new Set(packageNames);
  const pruneWorkspaceDependencies = (dependencies) => {
    if (!dependencies) {
      return dependencies;
    }

    return Object.fromEntries(
      Object.entries(dependencies).filter(([dependencyName]) => {
        if (!dependencyName.startsWith("@click-b/")) {
          return true;
        }

        const packageName = dependencyName.replace("@click-b/", "");
        return selectedPackageNames.has(packageName);
      }),
    );
  };

  const nextPackageJson = {
    ...packageJson,
    name: `@click-b/${name}`,
    dependencies: pruneWorkspaceDependencies(packageJson.dependencies),
    devDependencies: pruneWorkspaceDependencies(packageJson.devDependencies),
  };

  if (template === "tanstack") {
    nextPackageJson.devDependencies = {
      ...nextPackageJson.devDependencies,
      "@tanstack/router-plugin":
        nextPackageJson.devDependencies?.["@tanstack/router-plugin"] ?? "^1.120.0",
    };
  }

  return stringify(nextPackageJson);
};

const createTsconfigFromTemplate = async (sourceRoot, template) => {
  const tsconfig = await readTemplateJson(sourceRoot, template, "tsconfig.json");
  const paths = tsconfig.compilerOptions?.paths ?? {};

  if (!paths["@screens/*"]) {
    throw new Error(`Template tsconfig must define @screens/* alias: ${template}`);
  }

  return stringify(tsconfig);
};

const createEslintConfigFromTemplate = async (sourceRoot, template) =>
  readTemplateText(sourceRoot, template, "eslint.config.js");

const renderLayout = (projectName) =>
  `import type { PropsWithChildren } from "react";

type RootLayoutProps = PropsWithChildren;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body data-project="${projectName}">{children}</body>
    </html>
  );
}
`;

const renderNextRoutePage = () =>
  `import { HomeScreen } from "@screens/home";

export default function HomePage() {
  return <HomeScreen />;
}
`;

const renderNextEnv = () =>
  `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// This file is managed by the SI project starter CLI.
`;

const renderViteConfig = () =>
  `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@screens": fileURLToPath(new URL("./src/screens", import.meta.url)),
      "@widgets": fileURLToPath(new URL("./src/widgets", import.meta.url)),
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
      "@entities": fileURLToPath(new URL("./src/entities", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
});
`;

const renderViteEnv = () =>
  `/// <reference types="vite/client" />

// This file is managed by the SI project starter CLI.
`;

const renderMainTsx = () =>
  `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const renderAppTsx = ({ modules = [] } = {}) => {
  const withAuth = modules.includes("auth");

  return `import { AppProviders } from "./providers";
import { DemoScreen } from "@screens/demo";
import { HomeScreen } from "@screens/home";
import { SettingsScreen } from "@screens/settings";
${withAuth ? 'import { LoginScreen } from "@screens/login";\n' : ""}

export const App = () => {
  return (
    <AppProviders>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <HomeScreen />
        <DemoScreen />
        <SettingsScreen />
${withAuth ? "        <LoginScreen />\n" : ""}      </div>
    </AppProviders>
  );
};
`;
};

const renderIndexHtml = (projectName) =>
  `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
`;

const renderTanstackViteConfig = () =>
  `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [TanStackRouterVite({}), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@screens": fileURLToPath(new URL("./src/screens", import.meta.url)),
      "@widgets": fileURLToPath(new URL("./src/widgets", import.meta.url)),
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
      "@entities": fileURLToPath(new URL("./src/entities", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },
});
`;

const renderTanstackMainTsx = () =>
  `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
`;

const renderTanstackRootRoute = () =>
  `import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppProviders } from "@app/providers";

export const Route = createRootRoute({
  component: () => (
    <AppProviders>
      <Outlet />
    </AppProviders>
  ),
});
`;

const renderTanstackIndexRoute = () =>
  `import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@screens/home";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});
`;

const renderTanstackSettingsRoute = () =>
  `import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@screens/settings";

export const Route = createFileRoute("/settings")({
  component: SettingsScreen,
});
`;

const renderTanstackDemoRoute = () =>
  `import { createFileRoute } from "@tanstack/react-router";
import { DemoScreen } from "@screens/demo";

export const Route = createFileRoute("/demo")({
  component: DemoScreen,
});
`;

const renderTanstackLoginRoute = () =>
  `import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@screens/login";

export const Route = createFileRoute("/login")({
  component: LoginScreen,
});
`;
const renderScreenStyles = () =>
  `const surfaceStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
};

const mutedTextStyle = {
  color: "#64748b",
  fontSize: 14,
};

const statCardStyle = {
  ...surfaceStyle,
  padding: 20,
};
`;

const renderHomeScreen = (projectName, presetName, template) =>
  `${renderScreenStyles()}

const summaryCards = [
  {
    label: "Template",
    value: "${template}",
    hint: "현재 생성된 템플릿 기반",
  },
  {
    label: "Preset",
    value: "${presetName}",
    hint: "프로젝트 운영 성격",
  },
  {
    label: "Phase",
    value: "Kickoff",
    hint: "착수 직후 기본 뼈대",
  },
];

const deliveryChecklist = [
  "API endpoint 및 인증 방식 확정",
  "공통 레이아웃/권한 정책 리뷰",
  "실제 엔티티/피처 스캐폴딩 시작",
];

export const HomeScreen = () => {
  return (
    <section id="overview" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          ...surfaceStyle,
          padding: 28,
          background:
            "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 52%, rgba(51,65,85,1) 100%)",
          color: "#ffffff",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            width: "fit-content",
            borderRadius: 999,
            padding: "6px 10px",
            backgroundColor: "rgba(255,255,255,0.12)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ${template} starter
        </span>
        <h1 style={{ marginTop: 18, marginBottom: 12, fontSize: 36, lineHeight: 1.1 }}>
          ${projectName}
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          생성 직후 바로 SI 프로젝트를 설명하고 운영 기준을 공유할 수 있도록 기본 화면 뼈대를 제공합니다.
          이 화면 위에 실제 도메인 위젯과 피처를 붙이면 됩니다.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {summaryCards.map((card) => (
          <article key={card.label} style={statCardStyle}>
            <span style={{ ...mutedTextStyle, display: "block", marginBottom: 10 }}>{card.label}</span>
            <strong style={{ display: "block", fontSize: 28, marginBottom: 6 }}>{card.value}</strong>
            <span style={{ ...mutedTextStyle, fontSize: 13 }}>{card.hint}</span>
          </article>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 1fr)",
          gap: 16,
        }}
      >
        <section style={{ ...surfaceStyle, padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Delivery Overview</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0 }}>
            프로젝트 초반에 가장 먼저 정리해야 하는 항목들을 기본 섹션으로 배치했습니다.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {deliveryChecklist.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  alignItems: "start",
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#f8fafc",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>{item}</strong>
                  <span style={mutedTextStyle}>
                    실제 요구사항에 맞춰 엔티티/피처/위젯 단위로 구체화하십시오.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ ...surfaceStyle, padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Starter Notes</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8 }}>
            <li>FSD screen layer는 <code>screens</code> 기준입니다.</li>
            <li>공통 모듈은 preset에 따라 자동 포함됩니다.</li>
            <li>이 화면은 실제 디자인 전 임시 운영 뼈대입니다.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
};
`;

const renderSettingsScreen = (template) =>
  `${renderScreenStyles()}

const settingGroups = [
  {
    title: "Runtime",
    description: "환경 변수, API base URL, 인증 리프레시 주기를 검토합니다.",
  },
  {
    title: "Governance",
    description: "라우팅 규칙, 권한 정책, 코드 생성 기준을 확정합니다.",
  },
  {
    title: "Release",
    description: "${template} 템플릿 기준 배포/운영 체크리스트를 연결합니다.",
  },
];

export const SettingsScreen = () => {
  return (
    <section id="settings" style={{ ...surfaceStyle, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Settings Skeleton</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0, marginBottom: 0 }}>
            운영 설정, 권한, 환경 변수 정책을 실제 프로젝트 기준으로 구체화하는 자리입니다.
          </p>
        </div>
        <span
          style={{
            borderRadius: 999,
            backgroundColor: "#eef2ff",
            color: "#3730a3",
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          scaffold managed
        </span>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {settingGroups.map((group) => (
          <article key={group.title} style={{ ...statCardStyle, minHeight: 160 }}>
            <strong style={{ display: "block", fontSize: 18, marginBottom: 10 }}>{group.title}</strong>
            <p style={{ ...mutedTextStyle, margin: 0, lineHeight: 1.7 }}>{group.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
`;

const renderDemoScreen = (template) =>
  `${renderScreenStyles()}

const demoModules = [
  {
    title: "Auth + Guard",
    description: "인증 상태, 라우트 가드, 로그인 리디렉션 흐름을 점검합니다.",
  },
  {
    title: "API + Runtime",
    description: "API client와 환경 변수 구성이 정상인지 검증합니다.",
  },
  {
    title: "FSD + Scaffold",
    description: "${template} 템플릿 위에서 엔티티/피처 생성이 자연스럽게 이어지도록 구성됩니다.",
  },
];

export const DemoScreen = () => {
  return (
    <section id="demo" style={{ ...surfaceStyle, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Template Demo</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0, marginBottom: 0 }}>
            생성 직후 바로 확인할 수 있는 템플릿 데모 구역입니다. 실제 컴포넌트와 위젯을 이 영역부터 치환하면 됩니다.
          </p>
        </div>
        <span
          style={{
            borderRadius: 999,
            backgroundColor: "#ecfeff",
            color: "#155e75",
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ${template} demo
        </span>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {demoModules.map((item) => (
          <article key={item.title} style={{ ...statCardStyle, minHeight: 180 }}>
            <strong style={{ display: "block", fontSize: 18, marginBottom: 10 }}>{item.title}</strong>
            <p style={{ ...mutedTextStyle, margin: 0, lineHeight: 1.7 }}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
`;

const renderLoginScreen = () =>
  `${renderScreenStyles()}

export const LoginScreen = () => {
  return (
    <section id="login" style={{ ...surfaceStyle, padding: 24, maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Login Skeleton</h2>
        <p style={{ ...mutedTextStyle, margin: 0 }}>
          라우트 가드가 비인증 상태에서 이 화면으로 유도합니다. 실제 프로젝트에서는 RHF + Zod 폼으로 교체하십시오.
        </p>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
          <input
            type="email"
            placeholder="admin@example.com"
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          />
        </label>
        <button
          type="button"
          style={{
            marginTop: 8,
            height: 46,
            borderRadius: 12,
            border: "none",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </div>
    </section>
  );
};
`;

const renderScreenIndex = (screenName) =>
  `export { ${screenName}Screen } from "./ui/${toKebabCase(screenName)}-screen";\n`;

const renderProjectConfig = (presetName) =>
  `export const PROJECT_PRESET = "${presetName}";
export const SCREENS_LAYER_NAME = "screens";
`;

const createSharedFiles = (appRoot, name, preset, modules, template) => {
  const homeScreenName = toPascalCase("home");
  const demoScreenName = toPascalCase("demo");
  const settingsScreenName = toPascalCase("settings");
  const loginScreenName = toPascalCase("login");
  const withAuth = modules.includes("auth");

  return [
    {
      path: path.join(appRoot, "src", "app", "providers.tsx"),
      content: renderAppProvidersFile(modules),
    },
    {
      path: path.join(
        appRoot,
        "src",
        "screens",
        "home",
        "ui",
        `${toKebabCase(homeScreenName)}-screen.tsx`,
      ),
      content: renderHomeScreen(name, preset.name, template),
    },
    {
      path: path.join(appRoot, "src", "screens", "home", "index.ts"),
      content: renderScreenIndex(homeScreenName),
    },
    {
      path: path.join(
        appRoot,
        "src",
        "screens",
        "demo",
        "ui",
        `${toKebabCase(demoScreenName)}-screen.tsx`,
      ),
      content: renderDemoScreen(template),
    },
    {
      path: path.join(appRoot, "src", "screens", "demo", "index.ts"),
      content: renderScreenIndex(demoScreenName),
    },
    {
      path: path.join(
        appRoot,
        "src",
        "screens",
        "settings",
        "ui",
        `${toKebabCase(settingsScreenName)}-screen.tsx`,
      ),
      content: renderSettingsScreen(template),
    },
    {
      path: path.join(appRoot, "src", "screens", "settings", "index.ts"),
      content: renderScreenIndex(settingsScreenName),
    },
    ...(withAuth
      ? [
          {
            path: path.join(
              appRoot,
              "src",
              "screens",
              "login",
              "ui",
              `${toKebabCase(loginScreenName)}-screen.tsx`,
            ),
            content: renderLoginScreen(),
          },
          {
            path: path.join(appRoot, "src", "screens", "login", "index.ts"),
            content: renderScreenIndex(loginScreenName),
          },
        ]
      : []),
    {
      path: path.join(appRoot, "src", "shared", "config", "project.ts"),
      content: renderProjectConfig(preset.name),
    },
    { path: path.join(appRoot, "src", "entities", ".gitkeep"), content: "" },
    { path: path.join(appRoot, "src", "features", ".gitkeep"), content: "" },
    { path: path.join(appRoot, "src", "widgets", ".gitkeep"), content: "" },
    { path: path.join(appRoot, "src", "shared", "api", ".gitkeep"), content: "" },
    { path: path.join(appRoot, "src", "shared", "lib", ".gitkeep"), content: "" },
  ];
};

const createNextFiles = async (sourceRoot, appRoot, name, modules, packageNames) => [
  {
    path: path.join(appRoot, "package.json"),
    content: await createPackageJsonFromTemplate(sourceRoot, "next", name, packageNames),
  },
  {
    path: path.join(appRoot, "tsconfig.json"),
    content: await createTsconfigFromTemplate(sourceRoot, "next"),
  },
  {
    path: path.join(appRoot, "eslint.config.js"),
    content: await createEslintConfigFromTemplate(sourceRoot, "next"),
  },
  { path: path.join(appRoot, "next-env.d.ts"), content: renderNextEnv() },
  { path: path.join(appRoot, "src", "app", "layout.tsx"), content: renderLayout(name) },
  { path: path.join(appRoot, "src", "app", "page.tsx"), content: renderNextRoutePage() },
  {
    path: path.join(appRoot, "src", "app", "demo", "page.tsx"),
    content: `import { DemoScreen } from "@screens/demo";

export default function DemoPage() {
  return <DemoScreen />;
}
`,
  },
  {
    path: path.join(appRoot, "src", "app", "settings", "page.tsx"),
    content: `import { SettingsScreen } from "@screens/settings";

export default function SettingsPage() {
  return <SettingsScreen />;
}
`,
  },
  ...(modules.includes("auth")
    ? [
        {
          path: path.join(appRoot, "src", "app", "login", "page.tsx"),
          content: `import { LoginScreen } from "@screens/login";

export default function LoginPage() {
  return <LoginScreen />;
}
`,
        },
      ]
    : []),
];

const createViteFiles = async (sourceRoot, appRoot, name, modules, packageNames) => [
  {
    path: path.join(appRoot, "package.json"),
    content: await createPackageJsonFromTemplate(sourceRoot, "vite", name, packageNames),
  },
  {
    path: path.join(appRoot, "tsconfig.json"),
    content: await createTsconfigFromTemplate(sourceRoot, "vite"),
  },
  {
    path: path.join(appRoot, "eslint.config.js"),
    content: await createEslintConfigFromTemplate(sourceRoot, "vite"),
  },
  { path: path.join(appRoot, "vite.config.ts"), content: renderViteConfig() },
  { path: path.join(appRoot, "vite-env.d.ts"), content: renderViteEnv() },
  { path: path.join(appRoot, "index.html"), content: renderIndexHtml(name) },
  { path: path.join(appRoot, "src", "app", "main.tsx"), content: renderMainTsx() },
  { path: path.join(appRoot, "src", "app", "app.tsx"), content: renderAppTsx({ modules }) },
];

const createTanstackFiles = async (sourceRoot, appRoot, name, modules, packageNames) => [
  {
    path: path.join(appRoot, "package.json"),
    content: await createPackageJsonFromTemplate(sourceRoot, "tanstack", name, packageNames),
  },
  {
    path: path.join(appRoot, "tsconfig.json"),
    content: await createTsconfigFromTemplate(sourceRoot, "tanstack"),
  },
  {
    path: path.join(appRoot, "eslint.config.js"),
    content: await createEslintConfigFromTemplate(sourceRoot, "tanstack"),
  },
  { path: path.join(appRoot, "vite.config.ts"), content: renderTanstackViteConfig() },
  { path: path.join(appRoot, "vite-env.d.ts"), content: renderViteEnv() },
  { path: path.join(appRoot, "index.html"), content: renderIndexHtml(name) },
  { path: path.join(appRoot, "src", "app", "main.tsx"), content: renderTanstackMainTsx() },
  { path: path.join(appRoot, "src", "routes", "__root.tsx"), content: renderTanstackRootRoute() },
  { path: path.join(appRoot, "src", "routes", "index.tsx"), content: renderTanstackIndexRoute() },
  { path: path.join(appRoot, "src", "routes", "demo.tsx"), content: renderTanstackDemoRoute() },
  {
    path: path.join(appRoot, "src", "routes", "settings.tsx"),
    content: renderTanstackSettingsRoute(),
  },
  ...(modules.includes("auth")
    ? [
        {
          path: path.join(appRoot, "src", "routes", "login.tsx"),
          content: renderTanstackLoginRoute(),
        },
      ]
    : []),
];

const TEMPLATE_FILE_CREATORS = {
  next: createNextFiles,
  vite: createViteFiles,
  tanstack: createTanstackFiles,
};

const TEMPLATE_CHECKS = {
  next: (appRoot) => [{ type: "route", target: path.join(appRoot, "src", "app", "page.tsx") }],
  vite: (appRoot) => [{ type: "route", target: path.join(appRoot, "src", "app", "app.tsx") }],
  tanstack: (appRoot) => [
    { type: "route", target: path.join(appRoot, "src", "routes", "index.tsx") },
  ],
};

export const createProjectPlan = async ({
  root: sourceRoot,
  name,
  presetName,
  templateOverride,
  targetDir,
  selectedModules,
  selectedPackages,
  selectedDomains,
  overwrite,
  install,
}) => {
  assertKebabCase(name, "name");
  if (!presetName) {
    throw new Error("Missing required option: preset");
  }

  const preset = getPreset(presetName);
  const template = templateOverride ?? preset.defaultTemplate;
  if (!SUPPORTED_TEMPLATES.includes(template)) {
    throw new Error(
      `Unsupported template: ${template}. Supported templates: ${SUPPORTED_TEMPLATES.join(", ")}`,
    );
  }

  const projectRoot = targetDir ? path.resolve(targetDir) : path.resolve(sourceRoot, "..", name);
  const appRoot = path.join(projectRoot, "apps", name);
  const modules = expandModuleNames(selectedModules ?? preset.modules);
  const packageRequests = selectedPackages?.length ? selectedPackages : SOURCE_PACKAGE_DIRS;
  const modulePackageRequests = modules.includes("api-module") ? ["api-client"] : [];
  const shouldIncludeDomain = packageRequests.includes("domain") || selectedDomains !== undefined;
  const domainRequests = shouldIncludeDomain ? expandDomainModuleNames(selectedDomains) : [];
  const packages = expandPackageNames([
    ...packageRequests,
    ...modulePackageRequests,
    ...(shouldIncludeDomain ? ["domain"] : []),
    "scripts",
  ]);
  const domains = packages.includes("domain") ? domainRequests : [];
  const manifest = createManifestWithDomains({
    preset,
    template,
    name,
    modules,
    packages,
    domains,
  });

  const creates = dedupeCreates([
    ...(await createWorkspaceFiles(sourceRoot, projectRoot, name, template, preset.name)),
    ...(await collectHarnessFiles(sourceRoot, projectRoot)),
    ...createHarnessOverrideFiles(projectRoot, name, template, preset.name, packages, domains),
    ...(await collectRootFiles(sourceRoot, projectRoot)),
    ...(await collectPackageFiles(sourceRoot, projectRoot, packages, domains)),
    ...(await collectTemplateAppFiles(sourceRoot, template, appRoot)),
    ...(await TEMPLATE_FILE_CREATORS[template](sourceRoot, appRoot, name, modules, packages)),
    ...createSharedFiles(appRoot, name, preset, modules, template),
    ...createModuleFiles({
      appRoot,
      moduleNames: modules,
      framework: template,
      preset: preset.name,
    }),
    { path: path.join(appRoot, ".scaffold-manifest.json"), content: stringify(manifest) },
  ]);

  return {
    summary: `Initialize SI project '${name}' from preset '${preset.name}' (template: ${template})`,
    targetRoot: projectRoot,
    appRoot,
    requireEmptyTarget: true,
    preset: preset.name,
    creates,
    modifies: [],
    checks: [
      { type: "workspace", target: projectRoot },
      { type: "workspace-config", target: path.join(projectRoot, "pnpm-workspace.yaml") },
      { type: "workspace-package", target: path.join(projectRoot, "package.json") },
      { type: "app", target: appRoot },
      { type: "manifest", target: path.join(appRoot, ".scaffold-manifest.json") },
      { type: "fsd", target: path.join(appRoot, "src", "screens") },
      ...TEMPLATE_CHECKS[template](appRoot),
    ],
    postActions: install ? [{ type: "install", cwd: projectRoot }] : [],
    manifest,
    warnings: [
      overwrite
        ? "Overwrite mode is enabled."
        : "Target directory must be empty unless --overwrite is provided.",
      "This command bootstraps a standalone project workspace outside the source boilerplate repo.",
    ],
  };
};
