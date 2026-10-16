import path from "node:path";

const assertKebabCase = (value, fieldName) => {
  if (!value) {
    throw new Error(`Missing required option: ${fieldName}`);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    throw new Error(`${fieldName} must be kebab-case.`);
  }
};

const stringify = (value) => `${JSON.stringify(value, null, 2)}\n`;

const createPackageJson = (name, withReact) =>
  stringify({
    name: `@click-b/${name}`,
    version: "0.0.1",
    private: true,
    type: "module",
    main: "./src/index.ts",
    types: "./src/index.ts",
    exports: { ".": "./src/index.ts" },
    dependencies: {},
    devDependencies: {
      "@click-b/config": "workspace:*",
      typescript: "^5.9.3",
      ...(withReact ? { "@types/react": "^19.1.0" } : {}),
    },
    ...(withReact ? { peerDependencies: { react: "^18.0.0 || ^19.0.0" } } : {}),
  });

const createTsconfig = (withReact) =>
  stringify({
    extends: withReact ? "@click-b/config/tsconfig/react-library" : "@click-b/config/tsconfig/base",
    compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } },
    include: ["src"],
  });

const createEslintConfig = () =>
  `import reactConfig from "@click-b/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [...reactConfig];
`;

export const createPackagePlan = async ({ root, name, withReact, install }) => {
  assertKebabCase(name, "name");

  const targetRoot = path.join(root, "packages", name);
  const creates = [
    {
      path: path.join(targetRoot, "package.json"),
      content: createPackageJson(name, withReact),
    },
    {
      path: path.join(targetRoot, "tsconfig.json"),
      content: createTsconfig(withReact),
    },
    {
      path: path.join(targetRoot, "src", "index.ts"),
      content: "export {};\n",
    },
  ];

  if (withReact) {
    creates.push({
      path: path.join(targetRoot, "eslint.config.js"),
      content: createEslintConfig(),
    });
  }

  return {
    summary: `Create shared package '${name}'${withReact ? " (react)" : ""}`,
    targetRoot,
    requireEmptyTarget: true,
    preset: undefined,
    creates,
    modifies: [],
    checks: [
      { type: "workspace", target: targetRoot },
      { type: "package", target: path.join(targetRoot, "package.json") },
      { type: "tsconfig", target: path.join(targetRoot, "tsconfig.json") },
      { type: "entry", target: path.join(targetRoot, "src", "index.ts") },
      ...(withReact ? [{ type: "eslint", target: path.join(targetRoot, "eslint.config.js") }] : []),
    ],
    postActions: install ? [{ type: "install", cwd: root }] : [],
    manifest: {
      type: "package",
      name,
      react: withReact,
    },
    warnings: ["Workspace package is created under packages/ and shares the root pnpm workspace."],
  };
};
