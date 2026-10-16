import { parseArgs } from "node:util";

export const parseCliArgs = (args) => {
  const normalizedArgs = args.filter((arg) => arg !== "--");
  const { values, positionals } = parseArgs({
    args: normalizedArgs,
    allowPositionals: true,
    strict: false,
    options: {
      name: { type: "string", short: "n" },
      app: { type: "string" },
      module: { type: "string" },
      modules: { type: "string" },
      package: { type: "string" },
      packages: { type: "string" },
      domains: { type: "string" },
      preset: { type: "string" },
      path: { type: "string" },
      template: { type: "string", short: "t" },
      yes: { type: "boolean", short: "y" },
      "dry-run": { type: "boolean" },
      overwrite: { type: "boolean" },
      install: { type: "boolean" },
      react: { type: "boolean", short: "r" },
      verbose: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

  return { values, positionals };
};
