import react from "./react.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...react,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
