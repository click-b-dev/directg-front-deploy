import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import unicornPlugin from "eslint-plugin-unicorn";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "**/.next/**"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      // 파일명은 항상 kebab-case (컴포넌트 식별자는 PascalCase 유지).
      // multipleFileExtensions 기본값(true) 덕분에 button.types.ts·button.test.tsx·
      // vite-env.d.ts·eslint.config.js 등 복합 확장자는 첫 스템만 검사된다.
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },
];
