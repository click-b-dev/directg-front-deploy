import nextConfig from "@click-b/config/eslint/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextConfig,
  // public/은 legacy에서 무수정 복사한 정적 vendor 자산(CSS/JS)이므로 lint 대상에서 제외한다.
  { ignores: ["public/**"] },
];
