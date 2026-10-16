import tanstackConfig from "@click-b/config/eslint/tanstack";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // public/은 정적 벤더 자산(테마 CSS, SmartEditor2 등) — lint 대상 제외.
  { ignores: ["public/**"] },
  ...tanstackConfig,
];
