import layerImports from "./rules/layer-imports.js";
import publicApi from "./rules/public-api.js";
import sliceSegments from "./rules/slice-segments.js";

export default {
  rules: {
    "layer-imports": layerImports,
    "public-api": publicApi,
    "slice-segments": sliceSegments,
  },
};
