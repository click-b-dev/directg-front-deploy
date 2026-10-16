import react from "./react.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...react,
  {
    ignores: ["**/routeTree.gen.ts"],
  },
  {
    // TanStack Router 파일 기반 라우팅은 $param·_pathless·__root 등
    // 프레임워크가 강제하는 파일명을 쓰므로 kebab-case 검사에서 제외한다.
    files: ["**/routes/**/*.{ts,tsx}"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
