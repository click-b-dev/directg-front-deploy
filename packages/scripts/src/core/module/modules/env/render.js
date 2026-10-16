export const renderEnvModule = () => ({
  creates: [
    {
      relativePath: "src/shared/config/env.ts",
      content: `import { PROJECT_PRESET } from "./project";

type RuntimeEnv = {
  appName: string;
  appPreset: string;
  apiBaseUrl: string;
};

const readWindowEnv = (): Partial<RuntimeEnv> => {
  if (typeof window === "undefined") {
    return {};
  }

  const candidate = (window as Window & { __APP_ENV__?: Partial<RuntimeEnv> }).__APP_ENV__;
  return candidate ?? {};
};

const windowEnv = readWindowEnv();

export const env: RuntimeEnv = {
  appName: windowEnv.appName ?? "click-b",
  appPreset: windowEnv.appPreset ?? PROJECT_PRESET,
  apiBaseUrl: windowEnv.apiBaseUrl ?? "/api",
};
`,
    },
  ],
});
