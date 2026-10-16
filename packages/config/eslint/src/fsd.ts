import type { Rule } from "eslint";

export const DEFAULT_FSD_LAYERS = ["shared", "entities", "features", "widgets", "screens", "app"];
export const DEFAULT_ALLOW_CROSS_SLICE_FROM_LAYER = "widgets";

export type FsdAliasMap = Record<string, string>;

export type FsdOptions = {
  aliasMap?: FsdAliasMap;
  aliases?: string[];
  allowCrossSliceLayers?: string[];
  allowCrossSliceSameLayer?: boolean;
  layers?: string[];
};

export type LayerInfo = {
  layer: string;
  layerIndex: number;
  publicName?: string;
  segments: string[];
};

type RuleContext = Parameters<Rule.RuleModule["create"]>[0];

type ContextWithRuntimeFields = RuleContext & {
  cwd?: string;
  filename?: string;
  getCwd?: () => string;
  getFilename?: () => string;
};

export type SourceNode = {
  type: string;
  source?: {
    value?: unknown;
  };
};

const DEFAULT_ALIAS_MAP: FsdAliasMap = {
  "@": "",
  "@app": "app",
  "@screens": "screens",
  "@widgets": "widgets",
  "@features": "features",
  "@entities": "entities",
  "@shared": "shared",
  "~": "",
};

export const getContextCwd = (context: RuleContext): string => {
  const runtimeContext = context as ContextWithRuntimeFields;

  return runtimeContext.cwd ?? runtimeContext.getCwd?.() ?? "";
};

export const getContextFilename = (context: RuleContext): string | undefined => {
  const runtimeContext = context as ContextWithRuntimeFields;

  return runtimeContext.filename ?? runtimeContext.getFilename?.();
};

export const toPosixPath = (value: string): string => {
  return value.replaceAll("\\", "/");
};

const getDirname = (filePath: string): string => {
  const normalizedPath = toPosixPath(filePath);
  const index = normalizedPath.lastIndexOf("/");

  return index === -1 ? "" : normalizedPath.slice(0, index);
};

const resolvePath = (...paths: string[]): string => {
  const [firstPath = ""] = paths;
  const isAbsolute = firstPath.startsWith("/");
  const normalizedSegments = paths
    .flatMap((pathValue) => toPosixPath(pathValue).split("/"))
    .filter((segment) => segment.length > 0 && segment !== ".");
  const resolvedSegments: string[] = [];

  for (const segment of normalizedSegments) {
    if (segment === "..") {
      resolvedSegments.pop();
      continue;
    }

    resolvedSegments.push(segment);
  }

  return `${isAbsolute ? "/" : ""}${resolvedSegments.join("/")}`;
};

const getAliasMap = (options: FsdOptions): FsdAliasMap => {
  const aliases = Object.fromEntries((options.aliases ?? []).map((alias) => [alias, ""]));

  return {
    ...DEFAULT_ALIAS_MAP,
    ...aliases,
    ...(options.aliasMap ?? {}),
  };
};

const getSortedAliasEntries = (aliasMap: FsdAliasMap): Array<[string, string]> => {
  return Object.entries(aliasMap).sort(([left], [right]) => right.length - left.length);
};

export const getImportSource = (node: SourceNode): string | undefined => {
  const value = node.source?.value;

  return typeof value === "string" ? value : undefined;
};

export const getLayerInfo = (filePath: string, layers: string[]): LayerInfo | undefined => {
  const segments = toPosixPath(filePath).split("/").filter(Boolean);
  const srcIndex = segments.lastIndexOf("src");

  if (srcIndex !== -1) {
    const layerIndex = srcIndex + 1;
    const layer = segments[layerIndex];

    if (layer === undefined || !layers.includes(layer)) {
      return undefined;
    }

    return {
      layer,
      layerIndex,
      publicName: segments[layerIndex + 1],
      segments: segments.slice(layerIndex),
    };
  }

  const layerIndex = segments.findIndex((segment) => layers.includes(segment));

  if (layerIndex === -1) {
    return undefined;
  }

  return {
    layer: segments[layerIndex],
    layerIndex,
    publicName: segments[layerIndex + 1],
    segments: segments.slice(layerIndex),
  };
};

export const getImportPath = (
  source: string,
  importerFilename: string,
  cwd: string,
  aliases: FsdAliasMap,
): string => {
  if (source.startsWith(".")) {
    return resolvePath(getDirname(importerFilename), source);
  }

  for (const [alias, aliasPath] of getSortedAliasEntries(aliases)) {
    if (source === alias) {
      return resolvePath(cwd, aliasPath);
    }

    if (source.startsWith(`${alias}/`)) {
      return resolvePath(cwd, aliasPath, source.slice(alias.length + 1));
    }
  }

  return resolvePath(cwd, source);
};

export const isPackageImport = (
  source: string,
  layers: string[],
  aliases: FsdAliasMap,
): boolean => {
  if (source.startsWith(".") || source.startsWith("/")) {
    return false;
  }

  if (
    getSortedAliasEntries(aliases).some(
      ([alias]) => source === alias || source.startsWith(`${alias}/`),
    )
  ) {
    return false;
  }

  return !layers.some((layer) => source === layer || source.startsWith(`${layer}/`));
};

export const getFsdOptions = (context: RuleContext): Required<FsdOptions> => {
  const options = (context.options[0] ?? {}) as FsdOptions;
  const layers = options.layers ?? DEFAULT_FSD_LAYERS;
  const defaultAllowCrossSliceLayerIndex = layers.indexOf(DEFAULT_ALLOW_CROSS_SLICE_FROM_LAYER);

  return {
    aliasMap: getAliasMap(options),
    aliases: options.aliases ?? [],
    allowCrossSliceLayers:
      options.allowCrossSliceLayers ??
      (defaultAllowCrossSliceLayerIndex === -1
        ? []
        : layers.slice(defaultAllowCrossSliceLayerIndex)),
    allowCrossSliceSameLayer: options.allowCrossSliceSameLayer ?? false,
    layers,
  };
};

export const getIndexSegmentPosition = (segments: string[]): number => {
  return segments.findIndex((segment) => /^index(\.[cm]?[jt]sx?)?$/.test(segment));
};

export const isSamePublicScope = (from: LayerInfo, to: LayerInfo): boolean => {
  return (
    from.layer === to.layer && from.publicName !== undefined && from.publicName === to.publicName
  );
};

export const getFsdImportInfo = (
  source: string,
  importerFilename: string,
  cwd: string,
  layers: string[],
  aliases: FsdAliasMap,
): LayerInfo | undefined => {
  if (isPackageImport(source, layers, aliases)) {
    return undefined;
  }

  return getLayerInfo(getImportPath(source, importerFilename, cwd, aliases), layers);
};
