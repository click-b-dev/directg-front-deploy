import type { Rule } from "eslint";
import {
  type SourceNode,
  getContextCwd,
  getContextFilename,
  getFsdImportInfo,
  getFsdOptions,
  getImportSource,
  getIndexSegmentPosition,
  getLayerInfo,
  isSamePublicScope,
} from "../fsd.js";

const getAllowedDepth = (layer: string): number => {
  return layer === "shared" ? 2 : 2;
};

const isPublicApiImport = (segments: string[]): boolean => {
  const allowedDepth = getAllowedDepth(segments[0] ?? "");

  if (segments.length <= allowedDepth) {
    return true;
  }

  return getIndexSegmentPosition(segments) === allowedDepth;
};

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "enforce public API imports across Feature-Sliced Design scopes",
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
      usePublicApi: "FSD cross-scope import must use the public API of '{{layer}}/{{publicName}}'.",
    },
  },
  create(context) {
    const options = getFsdOptions(context);
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

      if (importeeLayer === undefined || isSamePublicScope(importerLayer, importeeLayer)) {
        return;
      }

      if (!isPublicApiImport(importeeLayer.segments)) {
        context.report({
          node,
          messageId: "usePublicApi",
          data: {
            layer: importeeLayer.layer,
            publicName: importeeLayer.publicName ?? "",
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
