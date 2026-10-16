import fsd from "./dist/index.js";

export const fsdLayers = ["shared", "entities", "features", "widgets", "screens", "app"];

export const fsdRuleOptions = {
  aliasMap: {
    "@": "",
    "@app": "app",
    "@screens": "screens",
    "@widgets": "widgets",
    "@features": "features",
    "@entities": "entities",
    "@shared": "shared",
  },
  layers: fsdLayers,
};

export const fsdRules = {
  "fsd/layer-imports": ["error", fsdRuleOptions],
  "fsd/public-api": ["error", fsdRuleOptions],
  "fsd/slice-segments": ["error", { layers: fsdLayers, ignoreLayers: ["shared", "app"] }],
};

/** @type {import("eslint").Linter.Config} */
export default {
  plugins: {
    fsd,
  },
  rules: fsdRules,
};
