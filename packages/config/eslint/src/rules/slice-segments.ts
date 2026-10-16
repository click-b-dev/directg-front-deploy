import type { Rule } from "eslint";
import { getContextFilename, getFsdOptions, getLayerInfo, toPosixPath } from "../fsd.js";

type SliceSegmentsOptions = {
  ignoreLayers?: string[];
};

const isIndexFile = (filename: string): boolean => {
  const normalizedPath = toPosixPath(filename);
  const basename = normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);

  return /^index\.[cm]?[jt]sx?$/.test(basename);
};

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce Feature-Sliced Design layer/slice/segment structure",
    },
    schema: [
      {
        type: "object",
        properties: {
          layers: {
            type: "array",
            items: {
              type: "string",
            },
          },
          ignoreLayers: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingSegment:
        "FSD file in '{{layer}}/{{slice}}' must either be the slice public API index file or live inside a third-level segment.",
      missingSlice:
        "FSD layer '{{layer}}' must contain slice directories before implementation files.",
    },
  },
  create(context) {
    const { layers } = getFsdOptions(context);
    const options = (context.options[0] ?? {}) as SliceSegmentsOptions;
    const ignoreLayers = options.ignoreLayers ?? [];
    const filename = getContextFilename(context);

    if (filename === undefined || filename === "<input>") {
      return {};
    }

    return {
      Program(node) {
        const layerInfo = getLayerInfo(filename, layers);

        if (layerInfo === undefined || ignoreLayers.includes(layerInfo.layer)) {
          return;
        }

        const [, slice, segment] = layerInfo.segments;

        if (slice === undefined) {
          context.report({
            node,
            messageId: "missingSlice",
            data: {
              layer: layerInfo.layer,
            },
          });
          return;
        }

        if (segment === undefined && !isIndexFile(filename)) {
          context.report({
            node,
            messageId: "missingSegment",
            data: {
              layer: layerInfo.layer,
              slice,
            },
          });
        }
      },
    };
  },
};

export default rule;
