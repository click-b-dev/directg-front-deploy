import type { Rule } from "eslint";
import {
  type SourceNode,
  getContextCwd,
  getContextFilename,
  getFsdImportInfo,
  getFsdOptions,
  getImportSource,
  getLayerInfo,
  isSamePublicScope,
} from "../fsd.js";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce Feature-Sliced Design layer import direction",
    },
    schema: [
      {
        type: "object",
        properties: {
          aliasMap: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
          },
          aliases: {
            type: "array",
            items: {
              type: "string",
            },
          },
          allowCrossSliceSameLayer: {
            type: "boolean",
          },
          allowCrossSliceLayers: {
            type: "array",
            items: {
              type: "string",
            },
          },
          layers: {
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
      crossSliceSameLayer:
        "FSD same-layer imports must stay inside the same slice. '{{fromLayer}}/{{fromSlice}}' cannot import '{{toLayer}}/{{toSlice}}'.",
      invalidDirection: "FSD layer '{{fromLayer}}' cannot import upper layer '{{toLayer}}'.",
    },
  },
  create(context) {
    const options = getFsdOptions(context);
    const layerRank = new Map(options.layers.map((layer, index) => [layer, index]));
    const cwd = getContextCwd(context);
    const importerFilename = getContextFilename(context);

    if (importerFilename === undefined || importerFilename === "<input>") {
      return {};
    }

    const importerLayer = getLayerInfo(importerFilename, options.layers);

    if (importerLayer === undefined) {
      return {};
    }

    const validateImport = (node: SourceNode): void => {
      const source = getImportSource(node);

      if (source === undefined) {
        return;
      }

      const importeeLayer = getFsdImportInfo(
        source,
        importerFilename,
        cwd,
        options.layers,
        options.aliasMap,
      );

      if (importeeLayer === undefined) {
        return;
      }

      const importerRank = layerRank.get(importerLayer.layer);
      const importeeRank = layerRank.get(importeeLayer.layer);

      if (importerRank === undefined || importeeRank === undefined) {
        return;
      }

      if (importeeRank > importerRank) {
        context.report({
          node,
          messageId: "invalidDirection",
          data: {
            fromLayer: importerLayer.layer,
            toLayer: importeeLayer.layer,
          },
        });
        return;
      }

      const canImportCrossSliceSameLayer =
        options.allowCrossSliceSameLayer ||
        options.allowCrossSliceLayers.includes(importerLayer.layer);

      if (
        !canImportCrossSliceSameLayer &&
        importerLayer.layer !== "shared" &&
        importeeLayer.layer !== "shared" &&
        importerLayer.layer === importeeLayer.layer &&
        !isSamePublicScope(importerLayer, importeeLayer)
      ) {
        context.report({
          node,
          messageId: "crossSliceSameLayer",
          data: {
            fromLayer: importerLayer.layer,
            fromSlice: importerLayer.publicName ?? "",
            toLayer: importeeLayer.layer,
            toSlice: importeeLayer.publicName ?? "",
          },
        });
      }
    };

    return {
      ExportAllDeclaration: (node) => validateImport(node as SourceNode),
      ExportNamedDeclaration: (node) => validateImport(node as SourceNode),
      ImportDeclaration: (node) => validateImport(node as SourceNode),
    };
  },
};

export default rule;
