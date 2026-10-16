import process from "node:process";
import { parseCliArgs } from "./parse-argv.js";
import { createProjectCommand } from "./commands/create/project.js";
import { createModuleCommand } from "./commands/create/module.js";
import { createPackageCommand } from "./commands/create/package.js";
import { wizardCommand } from "./commands/create/wizard.js";
import { doctorCommand } from "./commands/doctor.js";

const HELP_TEXT = `click-b-scripts

사용법:
  click-b-scripts create                                                대화형 프로젝트 위자드
  click-b-scripts create project --name <앱이름> --preset <프리셋>      독립 프로젝트 초기화
  click-b-scripts create module <모듈이름> --app <앱이름>               통합 모듈 생성
  click-b-scripts create package --name <패키지이름> [--react]          공유 패키지 생성
  click-b-scripts doctor --app <앱이름>                                 프로젝트 검증

옵션:
  -n, --name              이름 (kebab-case)
      --preset            프리셋 이름
      --app               대상 앱 이름
      --path              생성 경로
  -t, --template          프레임워크 지정
  -r, --react             React 패키지 생성
  -y, --yes               프롬프트 건너뛰기
      --dry-run           생성 계획만 출력 (파일 생성 안 함)
      --overwrite         기존 디렉토리 덮어쓰기 허용
      --install           생성 후 pnpm install 실행
      --verbose           상세 정보 출력
  -h, --help              도움말
`;

const fail = (message) => {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
};

export const main = async (argv) => {
  const { positionals, values } = parseCliArgs(argv);
  const [command, subcommand] = positionals;

  if (values.help || !command) {
    console.log(HELP_TEXT);
    return;
  }

  try {
    // `create` without subcommand → guided wizard
    if (command === "create" && !subcommand) {
      await wizardCommand({ cwd: process.cwd(), values });
      return;
    }

    if (command === "create" && subcommand === "project") {
      await createProjectCommand({
        cwd: process.cwd(),
        values,
      });
      return;
    }

    if (command === "create" && subcommand === "module") {
      await createModuleCommand({
        cwd: process.cwd(),
        values,
        moduleName: positionals[2] ?? values.module,
      });
      return;
    }

    if (command === "create" && subcommand === "package") {
      await createPackageCommand({
        cwd: process.cwd(),
        values,
      });
      return;
    }

    if (command === "doctor") {
      await doctorCommand({
        cwd: process.cwd(),
        values,
      });
      return;
    }

    if (command === "scaffold" && subcommand === "page") {
      fail(
        "`scaffold page` is a compatibility alias. Use `scaffold screen` after it is implemented.",
      );
      return;
    }

    fail(`Unsupported command: ${positionals.join(" ")}`);
  } catch (error) {
    fail(error instanceof Error ? error.message : "Unknown error");
  }
};
